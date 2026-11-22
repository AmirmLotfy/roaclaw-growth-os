import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { constants } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { ORIGINS } from '../protocol.js';

const extensionId = 'loglkephefkogehklbohjpdnhdalgnmc';
const extensionPath = fileURLToPath(new URL('../', import.meta.url));
const panelUrl = `chrome-extension://${extensionId}/panel.html`;
const baseArg = process.argv[2];
if (!baseArg || baseArg === '--help') {
  console.log('Usage: node apps/extension/test/smoke.mjs <app URL> [--evidence-dir <path>] [--web-flow] [--require-cloud-review] [--hosted-zip] [--with-nano] [--history] [--pregrant-test-permissions]');
  process.exit(baseArg ? 0 : 1);
}
const base = new URL(baseArg);
assert.ok(ORIGINS.has(base.origin), 'Use a ROACLAW companion origin from the manifest.');
const evidenceFlag = process.argv.indexOf('--evidence-dir');
const evidence = evidenceFlag < 0 ? null : resolve(process.argv[evidenceFlag + 1]);
const useWebFlow = process.argv.includes('--web-flow');
const requireCloud = process.argv.includes('--require-cloud-review');
const hostedZip = process.argv.includes('--hosted-zip');
const withNano = process.argv.includes('--with-nano');
const headless = process.env.ROACLAW_QA_HEADLESS === '1';
const minimized = process.env.ROACLAW_QA_MINIMIZED === '1';
assert.ok(!requireCloud || useWebFlow, '--require-cloud-review requires --web-flow.');
const exerciseHistory = process.argv.includes('--history');
const pregranted = process.argv.includes('--pregrant-test-permissions');
const recordPanel = process.env.ROACLAW_COMPANION_RECORD === '1';
const fixture = new URL('/demo-store/', base).href;
const tagged = `${fixture}?utm_source=meta&utm_medium=paid_social&utm_campaign=weekend-everyday-essentials`;
const id = { workspaceId: 'sable-stem', sessionId: crypto.randomUUID() };
const playwrightModule = new URL('../../../tools/hybrid-proof/node_modules/playwright/index.mjs', import.meta.url);
const { chromium } = await import(playwrightModule.href);

async function until(description, read, timeout = 15_000) {
  const end = Date.now() + timeout;
  do {
    const result = await read();
    if (result) return result;
    await delay(125);
  } while (Date.now() < end);
  throw new Error(`Timed out waiting for ${description}.`);
}

async function targetByUrl(devtools, url, type) {
  const { targetInfos } = await devtools.send('Target.getTargets', { filter: type ? [{ type }] : [{}] });
  return targetInfos.find((item) => item.url === url && (!type || item.type === type));
}

async function triggerToolbar(page, devtools, context) {
  await page.bringToFront();
  const tab = await targetByUrl(devtools, page.url(), 'tab');
  let tabId = tab?.targetId;
  if (!tabId) {
    const cdp = await context.newCDPSession(page);
    try { tabId = (await cdp.send('Target.getTargetInfo')).targetInfo.targetId; }
    finally { await cdp.detach(); }
  }
  await devtools.send('Extensions.triggerAction', { id: extensionId, targetId: tabId });
}

async function connectPanel(context, devtools) {
  const target = await until('the native Chrome side panel', () => targetByUrl(devtools, panelUrl));
  const page = context.pages().find((item) => item.url() === panelUrl);
  if (page) {
    return {
      evaluate: (fn, arg) => page.evaluate(fn, arg),
      click: (selector) => page.locator(selector).click(),
      screenshot: (name) => evidence ? page.screenshot({ path: join(evidence, name) }) : null,
      frame: () => page.screenshot(),
    };
  }

  // Playwright can omit Chrome extension surfaces from context.pages(). Use the CDP target already opened by Chrome.
  const { sessionId } = await devtools.send('Target.attachToTarget', { targetId: target.targetId, flatten: false });
  let nextId = 0;
  const pending = new Map();
  devtools.on('Target.receivedMessageFromTarget', (event) => {
    if (event.sessionId !== sessionId) return;
    const response = JSON.parse(event.message);
    const complete = pending.get(response.id);
    if (complete) complete(response);
  });
  async function send(method, params = {}) {
    const requestId = ++nextId;
    const message = JSON.stringify({ id: requestId, method, params });
    let timeout;
    const result = new Promise((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error(`Side panel did not answer ${method}.`)), 12_000);
      pending.set(requestId, ({ error, result }) => error ? reject(new Error(error.message)) : resolve(result));
    });
    try {
      const [response] = await Promise.all([result, devtools.send('Target.sendMessageToTarget', { sessionId, message })]);
      return response;
    } finally {
      clearTimeout(timeout);
      pending.delete(requestId);
    }
  }
  async function evaluate(fn, arg) {
    const expression = `(${fn.toString()})(${JSON.stringify(arg) ?? ''})`;
    const outcome = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (outcome.exceptionDetails) throw new Error(outcome.result?.description ?? outcome.exceptionDetails.text);
    return outcome.result.value;
  }
  async function frame() {
    const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    return Buffer.from(data, 'base64');
  }
  return {
    evaluate,
    frame,
    async click(selector) {
      const point = await until(`a clickable ${selector} in the side panel`, () => evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element || element.disabled || !element.getClientRects().length) return null;
        element.scrollIntoView({ block: 'center' });
        const bounds = element.getBoundingClientRect();
        return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      }, selector));
      for (const [type, buttons] of [['mousePressed', 1], ['mouseReleased', 0]]) {
        await send('Input.dispatchMouseEvent', { type, ...point, button: 'left', buttons, clickCount: 1 });
      }
    },
    async screenshot(name) {
      if (!evidence) return;
      await writeFile(join(evidence, name), await frame());
    },
  };
}

async function startRecording(panel, profile) {
  const frames = join(profile, 'panel-recording');
  await mkdir(frames);
  let running = true;
  let count = 0;
  const beats = {};
  const captured = (async () => {
    while (running) {
      const start = Date.now();
      const frame = await panel.frame();
      await writeFile(join(frames, String(count++).padStart(5, '0') + '.png'), frame);
      await delay(Math.max(10, 100 - (Date.now() - start)));
    }
  })();
  captured.catch(() => { running = false; });
  async function freeze() {
    running = false;
    await captured;
  }
  return {
    freeze,
    mark: (name) => { beats[name] = count / 10; },
    async finish(exportVideo) {
      await freeze().catch((error) => { if (exportVideo) throw error; });
      if (!exportVideo) return;
      const output = resolve('.local/footage');
      await mkdir(output, { recursive: true });
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '10',
        '-i', join(frames, '%05d.png'), '-vf', 'pad=width=ceil(iw/2)*2:height=ceil(ih/2)*2:color=0xedf1ec,format=yuv420p', '-c:v', 'libx264', '-crf', '17',
        join(output, 'roaclaw-chrome-panel.mp4')]);
      await writeFile(join(output, 'roaclaw-chrome-panel-beats.json'), JSON.stringify(beats, null, 2) + '\n');
    },
  };
}

function sendFromPage(page, scope, type, body = {}) {
  return page.evaluate(({ extensionId, message }) => new Promise((resolve, reject) => {
    if (!globalThis.chrome?.runtime?.sendMessage) return reject(new Error('Chrome did not expose the installed extension bridge to this page.'));
    chrome.runtime.sendMessage(extensionId, message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(response);
    });
  }), { extensionId, message: { ...scope, ...body, type } });
}

const hasText = (panel, selector, value, timeout) => until(`${selector} containing ${value}`, () => panel.evaluate(({ selector, value }) => {
  const target = document.querySelector(selector);
  return target?.getClientRects().length && target.textContent.includes(value);
}, { selector, value }), timeout);

const countBookmarks = (panel, url) => panel.evaluate(async (url) => {
  if (!await chrome.permissions.contains({ permissions: ['bookmarks'] })) return null;
  return (await chrome.bookmarks.search({ url })).length;
}, url);

async function ensureSource(page) {
  const response = await page.goto(base.href, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  assert.ok(response?.ok(), `App URL did not load (${response?.status() ?? 'no response'}).`);
  assert.equal(new URL(page.url()).origin, base.origin);
}

function webButton(page, name) {
  return page.getByRole('button', { name, exact: true });
}

function webCondition(page, description, check, timeout = 45_000) {
  return until(description, async () => {
    const alert = page.getByRole('main').getByRole('alert').first();
    if (await alert.isVisible()) throw new Error(`Growth Audit reported: ${await alert.innerText()}`);
    return check();
  }, timeout);
}

async function clickWeb(page, name) {
  const button = webButton(page, name);
  await webCondition(page, `enabled ${name}`, async () => await button.isVisible() && await button.isEnabled());
  await button.click();
}

function waitWeb(page, text, timeout) {
  return webCondition(page, text, () => page.getByText(text, { exact: true }).isVisible(), timeout);
}

async function webPair(page) {
  await page.bringToFront();
  await page.getByRole('heading', { name: 'Growth Audit', exact: true }).waitFor();
  if (await webButton(page, 'Open demo').isVisible()) {
    await clickWeb(page, 'Open demo');
    await clickWeb(page, 'Open ecommerce demo');
  }
  await waitWeb(page, 'Demo session active');
  const pairButton = page.locator('.capture-actions').getByRole('button', { name: 'Pair Chrome extension', exact: true });
  await webCondition(page, 'enabled capture pairing', async () => {
    if (await pairButton.isVisible()) return pairButton.isEnabled();
    const expand = webButton(page, 'Use an approved Chrome capture');
    if (await expand.isVisible()) await expand.click({ timeout: 2000 }).catch(() => undefined);
    return false;
  });
  await pairButton.click();
  await webCondition(page, 'pending web pairing', () => webButton(page, 'Check pairing').isVisible());
  const sessionId = await page.evaluate(() => sessionStorage.getItem(Object.keys(sessionStorage).find((key) => key.startsWith('roaclaw.session.') && key.endsWith('.sable-stem'))));
  assert.ok(sessionId, 'Growth Audit did not create its companion session.');
  return { workspaceId: 'sable-stem', sessionId };
}

async function approveBookmark(panel, url, before, askForPermission) {
  await hasText(panel, '#bookmark-url', url);
  assert.equal(await countBookmarks(panel, url), before);
  await panel.click('#review-bookmark');
  await hasText(panel, '#action-status', 'Ready to save');
  assert.equal(await countBookmarks(panel, url), before);
  if (askForPermission && before === null) console.log('Approve Chrome’s native bookmark permission prompt in the smoke-test window.');
  await panel.click('#save-bookmark');
  await hasText(panel, '#action-status', 'Verified in Chrome', 90_000);
  assert.equal(await countBookmarks(panel, url), (before ?? 0) + 1);
}

async function saveProposal({ source, panel, scope, proposal, askForPermission = false }) {
  const before = await countBookmarks(panel, proposal.url);
  const pending = await sendFromPage(source, scope, 'ROACLAW_PROPOSE_BOOKMARK', { proposal });
  assert.equal(pending.status, 'pending', JSON.stringify(pending));
  await hasText(panel, '#bookmark-title', proposal.title);
  await approveBookmark(panel, proposal.url, before, askForPermission);
  const response = await sendFromPage(source, scope, 'ROACLAW_RECEIPT', { proposalId: proposal.id });
  assert.equal(response.status, 'executed', JSON.stringify(response));
  assert.equal(response.receipt.url, proposal.url);
  assert.equal(response.receipt.title, proposal.title);
  assert.equal(response.receipt.workspaceId, scope.workspaceId);
  return response.receipt;
}

async function auditInWeb(source) {
  await clickWeb(source, 'Run Growth Audit');
  await waitWeb(source, 'Save a tagged URL', 90_000);
  await waitWeb(source, 'Advertised $99 vs landing page $119.');
  const observed = source.getByText(/^Page · (In cloud|On device)$/);
  const review = source.getByText('Review · In cloud', { exact: true });
  await webCondition(source, 'the Firebase inference source', () => observed.isVisible());
  if (requireCloud) {
    const unavailable = source.getByText(/App Check blocked the cloud review|The cloud review was unavailable/);
    await webCondition(source, 'the Firebase cloud review', async () => {
      assert.equal(await unavailable.isVisible(), false, 'The production cloud review was unavailable.');
      return review.isVisible();
    }, 90_000);
    const commentary = source.locator('.interpretation p');
    assert.ok((await commentary.innerText()).trim().length > 0, 'The cloud review returned no commentary.');
  }
  await webCondition(source, 'the saved audit to finish', () => webButton(source, 'Run again').isEnabled());
  if (evidence) await source.screenshot({ path: join(evidence, '05-web-audit.png'), fullPage: true });
  const label = await observed.innerText();
  if (withNano) assert.equal(label, 'Page · On device');
  return { inferenceSourceLabel: label, reviewSourceLabel: await review.isVisible() ? 'Review · In cloud' : null };
}

async function bookmarkInWeb(source, panel, scope) {
  const before = await countBookmarks(panel, tagged);
  await clickWeb(source, 'Send for Chrome approval');
  await waitWeb(source, 'Review the bookmark destination in the Chrome side panel.');
  await approveBookmark(panel, tagged, before, true);
  const { proposal } = await panel.evaluate(() => chrome.runtime.sendMessage({ type: 'PANEL_STATE' }));
  assert.equal(proposal?.status, 'executed');
  const { receipt } = proposal;
  assert.equal(receipt.workspaceId, scope.workspaceId);
  assert.equal(receipt.url, tagged);
  await clickWeb(source, 'Check receipt');
  await waitWeb(source, 'Bookmark verified');
  await waitWeb(source, `Chrome saved and verified the bookmark in ${receipt.folder}.`);
  if (evidence) await source.screenshot({ path: join(evidence, '06-web-receipt.png'), fullPage: true });
  return receipt;
}

async function checkWebMemory(source, receipt) {
  await clickWeb(source, 'Memory');
  await waitWeb(source, 'Verified research bookmarks');
  const link = source.getByRole('link', { name: receipt.title, exact: true });
  await webCondition(source, 'the verified bookmark in Memory', () => link.isVisible());
  assert.equal(await link.getAttribute('href'), receipt.url);
}

async function searchSaved(panel) {
  await panel.click('#panel-research-tab');
  await panel.click('#research details:first-child summary');
  const query = useWebFlow ? 'demo-store' : 'ROACLAW smoke';
  await panel.evaluate((text) => { document.querySelector('#search-text').value = text; }, query);
  await panel.click('#search-form button');
  await until('two distinct local bookmark search results', () => panel.evaluate(() => document.querySelectorAll('#search-results li').length === 2));
}

if (evidence) await mkdir(evidence, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), 'roaclaw-g3-chrome-'));
let context;
let source;
let stage = 'launch';
let panelRecording;
const firebaseResponses = [];
try {
  if (withNano) {
    const labProfile = fileURLToPath(new URL('../../../.local/g0-chrome/', import.meta.url));
    const extensionCaches = new Set([
      'Extensions', 'Extension Rules', 'Extension Scripts', 'Extension State',
      'Local Extension Settings', 'Sync Extension Settings', 'Service Worker', 'Code Cache',
    ]);
    // Keep the downloaded model and omit workers and scripts from earlier companion builds.
    await cp(labProfile, profile, { recursive: true, mode: constants.COPYFILE_FICLONE,
      filter: (path) => !basename(path).startsWith('Singleton') && !extensionCaches.has(basename(path)) });
  }
  let unpacked = extensionPath;
  if (hostedZip) {
    const zip = await fetch(new URL('/roaclaw-extension.zip', base));
    assert.ok(zip.ok, 'The hosted companion ZIP was unavailable.');
    const archive = join(profile, 'companion.zip');
    await writeFile(archive, Buffer.from(await zip.arrayBuffer()));
    unpacked = join(profile, 'unpacked-hosted-extension');
    await mkdir(unpacked);
    execFileSync('unzip', ['-q', archive, '-d', unpacked]);
  } else if (pregranted) {
    unpacked = join(profile, 'unpacked-test-copy');
    await cp(extensionPath, unpacked, { recursive: true });
  }
  const manifest = JSON.parse(await readFile(join(unpacked, 'manifest.json'), 'utf8'));
  if (pregranted) {
    const path = join(unpacked, 'manifest.json');
    manifest.permissions.push('bookmarks');
    if (exerciseHistory) manifest.permissions.push('history');
    manifest.optional_permissions = manifest.optional_permissions.filter((permission) => !manifest.permissions.includes(permission));
    await writeFile(path, JSON.stringify(manifest));
  }
  context = await chromium.launchPersistentContext(profile, {
    channel: 'chrome', headless, viewport: null,
    ignoreDefaultArgs: ['--disable-extensions',
      ...(withNano ? ['--disable-field-trial-config', '--disable-component-update', '--disable-background-networking'] : [])],
    args: ['--enable-unsafe-extension-debugging', '--window-size=1280,900',
      ...(withNano ? ['--disable-features=HttpsUpgrades,HttpsFirstBalancedModeAutoEnable'] : []),
      ...(minimized ? ['--start-minimized', '--window-position=-10000,-10000'] : [])],
  });
  const devtools = await context.browser().newBrowserCDPSession();
  const version = await devtools.send('Browser.getVersion');
  const { id: loaded } = await devtools.send('Extensions.loadUnpacked', { path: unpacked });
  assert.equal(loaded, extensionId);
  source = context.pages()[0] ?? await context.newPage();
  if (withNano) {
    const cdp = await context.newCDPSession(source);
    await cdp.send('Storage.clearDataForOrigin', { origin: base.origin, storageTypes: 'all' });
    await cdp.detach();
  }
  source.on('response', async response => {
    const url = new URL(response.url());
    if (url.hostname.endsWith('firebaseappcheck.googleapis.com') && url.pathname.endsWith(':exchangeRecaptchaEnterpriseToken')) {
      const error = response.ok() ? undefined : await response.json().then(body => body.error?.message).catch(() => undefined);
      firebaseResponses.push({ kind: 'app-check', status: response.status(), error });
    } else if (url.hostname === 'firebasevertexai.googleapis.com' && url.pathname.endsWith(':generateContent')) {
      const appCheckAttached = Boolean(await response.request().headerValue('X-Firebase-AppCheck'));
      firebaseResponses.push({ kind: 'generation', status: response.status(), appCheckAttached });
    }
  });
  if (useWebFlow) await source.setViewportSize({ width: 1440, height: 920 });
  await ensureSource(source);
  stage = 'pair';
  const workspaceName = 'Sable & Stem';
  let scope = id;
  if (useWebFlow) scope = await webPair(source);
  else assert.equal((await sendFromPage(source, scope, 'ROACLAW_PAIR', { workspaceName })).status, 'pending');
  await triggerToolbar(source, devtools, context);
  const panel = await connectPanel(context, devtools);
  const activeTabId = () => panel.evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id);
  const dashboardTabId = await activeTabId();
  assert.ok(Number.isInteger(dashboardTabId));
  if (recordPanel) panelRecording = await startRecording(panel, profile);
  await hasText(panel, '#pair-name', workspaceName);
  await panel.screenshot('01-pairing.png');
  panelRecording?.mark('pair');
  await panel.click('#confirm-pair');
  await hasText(panel, '#workspace-name', workspaceName);
  if (useWebFlow) {
    await clickWeb(source, 'Check pairing');
    await waitWeb(source, 'This tab is paired with the Chrome extension.');
  }
  assert.equal((await sendFromPage(source, scope, 'ROACLAW_PAIR', { workspaceName })).status, 'paired');
  assert.equal((await sendFromPage(source, scope, 'ROACLAW_CAPTURE')).status, 'empty');

  stage = 'capture';
  const landing = await context.newPage();
  assert.ok((await landing.goto(fixture, { waitUntil: 'domcontentloaded' }))?.ok());
  await triggerToolbar(landing, devtools, context);
  await hasText(panel, '#page-state', 'Ready to capture');
  await hasText(panel, '#page-url', fixture);
  panelRecording?.mark('captureStart');
  await panel.click('#capture');
  await hasText(panel, '#capture-url', fixture);
  await panel.click('#capture-review summary');
  await panel.screenshot('02-captured-evidence.png');
  panelRecording?.mark('captureVisible');
  if (recordPanel) await delay(1800);
  const { capture } = await sendFromPage(source, scope, 'ROACLAW_CAPTURE');
  assert.equal(capture.url, fixture);
  assert.ok(capture.title && capture.headings.length && capture.visiblePriceText.length && capture.ctas.length, JSON.stringify(capture));
  let webInference;
  const receipts = [];
  if (useWebFlow) {
    stage = 'web capture attachment and audit';
    await source.bringToFront();
    await clickWeb(source, 'Get approved capture');
    await waitWeb(source, 'Approved Chrome capture attached.');
    webInference = await auditInWeb(source);
    if (requireCloud) {
      assert.ok(firebaseResponses.some(item => item.kind === 'app-check' && item.status === 200), 'No live App Check token exchange passed.');
      const generations = firebaseResponses.filter(item => item.kind === 'generation' && item.status === 200 && item.appCheckAttached);
      const expectedGenerations = webInference.inferenceSourceLabel === 'Page · In cloud' ? 2 : 1;
      assert.ok(generations.length >= expectedGenerations, 'The expected Firebase cloud calls did not all pass with App Check.');
    }
    stage = 'web bookmark proposal, approval, and receipt';
    panelRecording?.mark('approvalStart');
    receipts.push(await bookmarkInWeb(source, panel, scope));
    panelRecording?.mark('verified');
    if (recordPanel) await delay(2100);
    stage = 'Memory receipt readback';
    await checkWebMemory(source, receipts[0]);
    if (evidence) await source.screenshot({ path: join(evidence, '07-web-memory.png'), fullPage: true });
  } else {
    stage = 'bookmark approvals';
    receipts.push(await saveProposal({ source, panel, scope,
      proposal: { id: 'roaclaw-smoke-tagged', title: 'ROACLAW smoke tagged storefront', url: tagged }, askForPermission: true }));
  }
  await panel.screenshot('03-verified-bookmark.png');

  stage = 'second bookmark approval and cancellation';
  receipts.push(await saveProposal({ source, panel, scope,
    proposal: { id: 'roaclaw-smoke-plain', title: 'ROACLAW smoke storefront', url: fixture } }));
  const declined = { id: 'roaclaw-smoke-decline', title: 'ROACLAW smoke declined proposal', url: `${base.origin}/` };
  assert.equal((await sendFromPage(source, scope, 'ROACLAW_PROPOSE_BOOKMARK', { proposal: declined })).status, 'pending');
  await panel.click('#cancel-bookmark');
  assert.equal((await sendFromPage(source, scope, 'ROACLAW_RECEIPT', { proposalId: declined.id })).status, 'declined');
  assert.equal(await countBookmarks(panel, declined.url), 0);
  stage = 'local bookmark search';
  await searchSaved(panel);
  await panel.screenshot('04-bookmark-search.png');

  if (exerciseHistory) {
    stage = 'recent Chrome history';
    await panel.click('#history-search summary');
    await panel.evaluate(() => { document.querySelector('#history-text').value = 'demo-store'; });
    await panel.click('#history-form button');
    await hasText(panel, '#history-results', fixture, 90_000);
    await panel.screenshot('08-history.png');
    panelRecording?.mark('historyVisible');
    if (recordPanel) await delay(1800);
    await panel.click('#clear-history');
    await until('history results cleared', () => panel.evaluate(() => document.querySelector('#history-results').children.length === 0));
  }

  await panelRecording?.freeze();
  stage = 'bookmark persistence';
  await source.reload({ waitUntil: 'domcontentloaded', timeout: 45_000 });
  for (const entry of receipts) {
    const response = await sendFromPage(source, scope, 'ROACLAW_RECEIPT', { proposalId: entry.proposalId });
    assert.deepEqual(response.receipt, entry);
  }
  if (useWebFlow) {
    stage = 'Memory receipt persistence after reload';
    await waitWeb(source, 'Demo session active');
    if (webInference.reviewSourceLabel) await waitWeb(source, webInference.reviewSourceLabel);
    await checkWebMemory(source, receipts[0]);
    stage = 'non-demo capture mode';
    const outside = new URL('/morrow-booking/', base).href;
    await landing.goto(outside, { waitUntil: 'domcontentloaded' });
    await triggerToolbar(landing, devtools, context);
    await panel.click('#panel-inspect-tab');
    await hasText(panel, '#page-url', outside);
    await panel.click('#capture');
    await hasText(panel, '#capture-url', outside);
    stage = 'dashboard handoff';
    assert.notEqual(await activeTabId(), dashboardTabId);
    await panel.click('#open-dashboard');
    await until('the original dashboard tab to receive focus', async () => (await activeTabId()) === dashboardTabId);
    await clickWeb(source, 'Growth Audit');
    await clickWeb(source, 'Use an approved Chrome capture');
    await clickWeb(source, 'Get approved capture');
    await waitWeb(source, 'Pages outside the demo use device-only analysis.');
    const mode = source.getByLabel('Inference mode');
    assert.equal(await mode.inputValue(), 'local');
    assert.equal(await mode.isEnabled(), false);
    stage = 'pairing revocation after sign-out';
    await clickWeb(source, 'Settings');
    await clickWeb(source, 'Close demo session');
    await webCondition(source, 'signed-out demo', () => webButton(source, 'Open demo').isVisible());
    assert.equal((await sendFromPage(source, scope, 'ROACLAW_CAPTURE')).code, 'NOT_PAIRED');
    const newScope = await webPair(source);
    assert.notEqual(newScope.sessionId, scope.sessionId);
    assert.equal((await sendFromPage(source, newScope, 'ROACLAW_CAPTURE')).code, 'NOT_PAIRED');
  }
  stage = 'panel recording export';
  await panelRecording?.finish(true);
  panelRecording = null;
  await context.close();
  context = null;
  const saved = JSON.parse(await readFile(join(profile, 'Default', 'Bookmarks'), 'utf8'));
  function flatten(nodes) { return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]); }
  const entries = flatten(Object.values(saved.roots));
  for (const entry of receipts) assert.ok(entries.some(({ id, name, url }) => id === entry.bookmarkId && name === entry.title && url === entry.url));
  const report = { browser: version.product, headless, app: base.origin, extensionId, extensionVersion: manifest.version, hostedZip, seededNanoProfile: withNano, capture, receipts, canceledVerified: true, searchMatches: 2, persistedBookmarks: receipts.length, webUiPairAndCapture: useWebFlow, historyVerified: exerciseHistory, permissionPrompt: pregranted ? 'pregranted in a disposable test manifest' : 'native Chrome',
    ...(useWebFlow ? { firebaseResponses, webAudit: { ...webInference, priceMismatchVerified: true, bookmarkReceiptVerified: true, memoryReceiptAfterReload: true, dashboardHandoffVerified: true, externalCaptureDeviceOnly: true, sessionRotatedAfterSignOut: true } } : {}),
  };
  if (evidence) await writeFile(join(evidence, 'runtime.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(`Chrome companion smoke stopped during ${stage}.`);
  if (firebaseResponses.length) console.error('Firebase responses:', JSON.stringify(firebaseResponses));
  if (useWebFlow && source) {
    const alert = await source.getByRole('main').getByRole('alert').first().textContent({ timeout: 500 }).catch(() => null);
    if (alert) console.error(`Growth Audit alert: ${alert}`);
    if (evidence) await source.screenshot({ path: join(evidence, 'web-failure.png'), fullPage: true }).catch(() => undefined);
  }
  throw error;
} finally {
  await panelRecording?.finish(false);
  await context?.close();
  await rm(profile, { recursive: true, force: true });
}

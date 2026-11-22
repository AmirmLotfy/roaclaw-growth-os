import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { ORIGINS } from '../protocol.js';

const extensionId = 'loglkephefkogehklbohjpdnhdalgnmc';
const extensionPath = fileURLToPath(new URL('../', import.meta.url));
const panelUrl = `chrome-extension://${extensionId}/panel.html`;
const baseArg = process.argv[2];
if (!baseArg || baseArg === '--help') {
  console.log('Usage: node apps/extension/test/smoke.mjs <app URL> [--evidence-dir <path>] [--web-flow]');
  process.exit(baseArg ? 0 : 1);
}
const base = new URL(baseArg);
assert.ok(ORIGINS.has(base.origin), 'Use a ROACLAW companion origin from the manifest.');
const evidenceFlag = process.argv.indexOf('--evidence-dir');
const evidence = evidenceFlag < 0 ? null : resolve(process.argv[evidenceFlag + 1]);
const useWebFlow = process.argv.includes('--web-flow');
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
  return {
    evaluate,
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
      const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      await writeFile(join(evidence, name), Buffer.from(data, 'base64'));
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
  await page.getByRole('heading', { name: 'Growth Audit', exact: true }).waitFor();
  if (await webButton(page, 'Open demo').isVisible()) await clickWeb(page, 'Open demo');
  await waitWeb(page, 'Demo session active');
  await clickWeb(page, 'Use an approved Chrome capture');
  await clickWeb(page, 'Pair Chrome extension');
  await webCondition(page, 'pending web pairing', () => webButton(page, 'Check pairing').isVisible());
  const sessionId = await page.evaluate(() => sessionStorage.getItem('roaclaw.session.sable-stem'));
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
  await webCondition(source, 'the Firebase inference source', () => observed.isVisible());
  if (evidence) await source.screenshot({ path: join(evidence, '05-web-audit.png'), fullPage: true });
  return observed.innerText();
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
  await panel.click('#research summary');
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
try {
  context = await chromium.launchPersistentContext(profile, {
    channel: 'chrome', headless: false, viewport: null, ignoreDefaultArgs: ['--disable-extensions'],
    args: ['--enable-unsafe-extension-debugging', '--window-size=1280,900'],
  });
  const devtools = await context.browser().newBrowserCDPSession();
  const version = await devtools.send('Browser.getVersion');
  const { id: loaded } = await devtools.send('Extensions.loadUnpacked', { path: extensionPath });
  assert.equal(loaded, extensionId);
  source = context.pages()[0] ?? await context.newPage();
  await ensureSource(source);
  stage = 'pair';
  const workspaceName = 'Sable & Stem';
  let scope = id;
  if (useWebFlow) scope = await webPair(source);
  else assert.equal((await sendFromPage(source, scope, 'ROACLAW_PAIR', { workspaceName })).status, 'pending');
  await triggerToolbar(source, devtools, context);
  const panel = await connectPanel(context, devtools);
  await hasText(panel, '#pair-name', workspaceName);
  await panel.screenshot('01-pairing.png');
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
  await panel.click('#capture');
  await hasText(panel, '#capture-url', fixture);
  await panel.click('#capture-review summary');
  await panel.screenshot('02-captured-evidence.png');
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
    stage = 'web bookmark proposal, approval, and receipt';
    receipts.push(await bookmarkInWeb(source, panel, scope));
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

  stage = 'bookmark persistence';
  await source.reload({ waitUntil: 'domcontentloaded', timeout: 45_000 });
  for (const entry of receipts) {
    const response = await sendFromPage(source, scope, 'ROACLAW_RECEIPT', { proposalId: entry.proposalId });
    assert.deepEqual(response.receipt, entry);
  }
  if (useWebFlow) {
    stage = 'Memory receipt persistence after reload';
    await waitWeb(source, 'Demo session active');
    await checkWebMemory(source, receipts[0]);
  }
  await context.close();
  context = null;
  const saved = JSON.parse(await readFile(join(profile, 'Default', 'Bookmarks'), 'utf8'));
  function flatten(nodes) { return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]); }
  const entries = flatten(Object.values(saved.roots));
  for (const entry of receipts) assert.ok(entries.some(({ id, name, url }) => id === entry.bookmarkId && name === entry.title && url === entry.url));
  const report = { browser: version.product, app: base.origin, extensionId, capture, receipts, canceledVerified: true, searchMatches: 2, persistedBookmarks: receipts.length, webUiPairAndCapture: useWebFlow,
    ...(useWebFlow ? { webAudit: { inferenceSourceLabel: webInference, priceMismatchVerified: true, bookmarkReceiptVerified: true, memoryReceiptAfterReload: true } } : {}),
  };
  if (evidence) await writeFile(join(evidence, 'runtime.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(`Chrome companion smoke stopped during ${stage}.`);
  if (useWebFlow && source) {
    const alert = await source.getByRole('main').getByRole('alert').first().textContent({ timeout: 500 }).catch(() => null);
    if (alert) console.error(`Growth Audit alert: ${alert}`);
    if (evidence) await source.screenshot({ path: join(evidence, 'web-failure.png'), fullPage: true }).catch(() => undefined);
  }
  throw error;
} finally {
  await context?.close();
  await rm(profile, { recursive: true, force: true });
}

import assert from 'node:assert/strict';
import axe from 'axe-core';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '../../tools/hybrid-proof/node_modules/playwright/index.mjs';

const origin = new URL(process.argv[2] ?? 'https://roaclaw-growth-os-2026.web.app/').origin;
const evidenceDir = resolve(process.env.ROACLAW_PREFLIGHT_EVIDENCE ?? '.local/preflight-qa');
const extensionId = 'loglkephefkogehklbohjpdnhdalgnmc';
const extensionUrl = `chrome-extension://${extensionId}/panel.html`;
const record = process.env.ROACLAW_PREFLIGHT_RECORD === '1';
const landingUrl = record ? origin + '/demo-store/' : 'https://www.ifixit.com/products/essential-electronics-toolkit';
const actualPrice = record ? '$119' : '$29.95';
// An operator-authored test brief. It does not represent iFixit's advertising.
const brief = {
  offer: record ? 'Ceramic Vase Set' : 'Essential Electronics Toolkit', destination: landingUrl, cta: 'Add to cart',
  amount: record ? '99.00' : '24.95', currency: 'USD', utm_source: 'newsletter', utm_medium: 'email',
  utm_campaign: record ? 'weekend-offer' : 'repair-week',
};
const network = [];
const withNano = process.env.ROACLAW_PREFLIGHT_NANO === '1';
const beats = {};
let recordingStart = 0;
async function beat(name, hold = 2300) {
  if (!record) return;
  const start = (Date.now() - recordingStart) / 1000;
  await delay(hold);
  beats[name] = { start, end: (Date.now() - recordingStart) / 1000 };
}
const scratch = await mkdtemp(join(tmpdir(), 'roaclaw-preflight-'));
const unpacked = join(scratch, 'extension');
await mkdir(evidenceDir, { recursive: true });
await mkdir(unpacked);
const zip = await fetch(origin + '/roaclaw-extension.zip');
assert.equal(zip.status, 200);
const archive = join(scratch, 'companion.zip');
await writeFile(archive, Buffer.from(await zip.arrayBuffer()));
execFileSync('unzip', ['-q', archive, '-d', unpacked]);
const manifest = JSON.parse(await readFile(join(unpacked, 'manifest.json'), 'utf8'));
assert.equal(manifest.version, '0.3.0');
assert.deepEqual(manifest.optional_permissions, ['bookmarks', 'history']);

async function waitFor(description, attempt, timeout = 15_000) {
  const end = Date.now() + timeout;
  do {
    const result = await attempt();
    if (result) return result;
    await delay(125);
  } while (Date.now() < end);
  throw new Error(`Timed out waiting for ${description}`);
}

async function activeToolbar(context, devtools, page) {
  await page.bringToFront();
  const { targetInfos } = await devtools.send('Target.getTargets', { filter: [{ type: 'tab' }] });
  const tab = targetInfos.find(({ url, type }) => url === page.url() && type === 'tab');
  if (tab) {
    await devtools.send('Extensions.triggerAction', { id: extensionId, targetId: tab.targetId });
    return;
  }
  const session = await context.newCDPSession(page);
  try {
    const { targetInfo } = await session.send('Target.getTargetInfo');
    await devtools.send('Extensions.triggerAction', { id: extensionId, targetId: targetInfo.targetId });
  } finally {
    await session.detach();
  }
}

async function getNativePanel(devtools) {
  const target = await waitFor('the native Chrome panel', async () => {
    const { targetInfos } = await devtools.send('Target.getTargets', { filter: [{}] });
    return targetInfos.find(({ url }) => url === extensionUrl);
  });
  const { sessionId } = await devtools.send('Target.attachToTarget', { targetId: target.targetId, flatten: false });
  let sequence = 0;
  const pending = new Map();
  devtools.on('Target.receivedMessageFromTarget', (event) => {
    if (event.sessionId !== sessionId) return;
    const message = JSON.parse(event.message);
    pending.get(message.id)?.(message);
  });
  async function send(method, params = {}) {
    const id = ++sequence;
    let timer;
    const result = new Promise((done, fail) => {
      timer = setTimeout(() => fail(new Error('Side panel did not answer ' + method)), 12_000);
      pending.set(id, ({ error, result }) => error ? fail(new Error(error.message)) : done(result));
    });
    try {
      const [value] = await Promise.all([result, devtools.send('Target.sendMessageToTarget', { sessionId, message: JSON.stringify({ id, method, params }) })]);
      return value;
    } finally { clearTimeout(timer); pending.delete(id); }
  }
  async function evaluate(fn, arg) {
    const result = await send('Runtime.evaluate', { expression: `(${fn.toString()})(${JSON.stringify(arg)})`, returnByValue: true, awaitPromise: true });
    assert.ok(!result.exceptionDetails, result.result?.description);
    return result.result.value;
  }
  async function frame() {
    const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    return Buffer.from(data, 'base64');
  }
  return {
    text: (selector) => evaluate((value) => document.querySelector(value)?.textContent?.trim(), selector),
    activeTab: () => evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id, null),
    async click(selector) {
      const point = await waitFor(selector, () => evaluate((value) => {
        const element = document.querySelector(value);
        if (!element || element.disabled || !element.getClientRects().length) return null;
        element.scrollIntoView({ block: 'center' });
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x: x + width / 2, y: y + height / 2 };
      }, selector));
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', buttons: 0, clickCount: 1 });
    },
    async screenshot(filename) {
      await writeFile(join(evidenceDir, filename), await frame());
    },
    frame,
  };
}

let context;
let page;
let stage = 'launch';
try {
  const profile = withNano ? resolve('.local/g0-chrome') : join(scratch, 'profile');
  context = await chromium.launchPersistentContext(profile, {
    channel: 'chrome', headless: true, viewport: { width: 1440, height: 920 },
    ignoreDefaultArgs: [
      '--disable-extensions',
      ...(withNano ? ['--disable-field-trial-config', '--disable-component-update', '--disable-background-networking'] : []),
    ],
    args: [
      // The lab profile has the downloaded model. Override Playwright's default
      // disabled-feature list so its OptimizationHints suppression does not block Nano.
      ...(withNano ? ['--disable-features=HttpsUpgrades,HttpsFirstBalancedModeAutoEnable'] : []),
      '--enable-unsafe-extension-debugging', '--window-size=1440,920',
    ],
    ...(record ? { recordVideo: { dir: evidenceDir, size: { width: 1440, height: 920 } } } : {}),
  });
  const devtools = await context.browser().newBrowserCDPSession();
  const { product: browser } = await devtools.send('Browser.getVersion');
  const { id } = await devtools.send('Extensions.loadUnpacked', { path: unpacked });
  assert.equal(id, extensionId);
  page = context.pages()[0] ?? await context.newPage();
  recordingStart = Date.now();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  page.on('request', (request) => {
    const host = new URL(request.url()).hostname;
    if (/(?:firebasevertexai|firebaseappcheck|firestore|identitytoolkit|securetoken|generativelanguage)\.googleapis\.com$/.test(host)) network.push(host);
  });

  stage = 'marketing entry and brief';
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Check your own landing page' }).click();
  await page.getByRole('heading', { name: 'Campaign Preflight', exact: true }).waitFor();
  await page.waitForLoadState('networkidle');
  if (!record) {
    await page.getByRole('button', { name: 'Request Chrome pairing' }).click();
    assert.equal(await page.locator('#preflight-offer').getAttribute('aria-invalid'), 'true');
  }
  for (const [name, value] of Object.entries(brief)) {
    const field = page.locator('#preflight-' + name);
    if (name === 'currency') await field.selectOption(value);
    else await field.fill(value);
  }
  await beat('brief');

  stage = 'scoped Chrome confirmation';
  await page.getByRole('button', { name: 'Request Chrome pairing' }).click();
  await activeToolbar(context, devtools, page);
  const panel = await getNativePanel(devtools);
  await waitFor('campaign name in Chrome pairing', async () => (await panel.text('#pair-name'))?.includes(brief.offer));
  assert.ok((await panel.text('#pair-destination-host') ?? '').includes(new URL(landingUrl).hostname));
  const dashboardTab = await panel.activeTab();
  await panel.screenshot('01-chrome-pairing.png');
  await panel.click('#confirm-pair');
  await waitFor('paired campaign purpose', async () => (await panel.text('#workspace-purpose'))?.includes('Campaign Preflight'));
  await page.getByRole('button', { name: 'Check pairing' }).click();
  await page.getByRole('link', { name: 'Open destination' }).waitFor();

  stage = 'live public landing page';
  const popup = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Open destination' }).click();
  const landing = await popup;
  await landing.waitForLoadState('domcontentloaded');
  assert.equal(landing.url(), landingUrl);
  await landing.getByRole('heading', { name: brief.offer, exact: true, level: 1 }).waitFor({ timeout: 25_000 });
  await landing.getByText(actualPrice, { exact: true }).first().waitFor({ timeout: 25_000 });
  await activeToolbar(context, devtools, landing);
  await waitFor('public destination in side panel', async () => (await panel.text('#page-url'))?.includes(landingUrl));
  assert.notEqual(await panel.activeTab(), dashboardTab);
  let closePanelRecording;
  if (record) {
    const frames = join(scratch, 'frames');
    await mkdir(frames);
    let running = true;
    const gather = (async () => {
      for (let frame = 0; running; frame += 1) {
        await writeFile(join(frames, String(frame).padStart(4, '0') + '.png'), await panel.frame());
        await delay(65);
      }
    })();
    closePanelRecording = async () => {
      running = false;
      await gather;
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '12', '-i', join(frames, '%04d.png'), '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2', '-pix_fmt', 'yuv420p', join(evidenceDir, 'preflight-panel.mp4')]);
    };
    await delay(1050);
  }
  await panel.click('#capture');
  await waitFor('captured evidence in the side panel', async () => (await panel.text('#capture-url'))?.includes(landingUrl));
  await panel.click('#capture-review summary');
  await panel.screenshot('02-chrome-capture.png');
  if (record) { await delay(3600); await closePanelRecording(); }
  assert.match(await panel.text('#open-dashboard') ?? '', /Open Campaign Preflight/);
  await panel.click('#open-dashboard');
  await waitFor('focus returning to the original preflight tab', async () => (await panel.activeTab()) === dashboardTab);

  stage = 'compare actual evidence';
  await page.getByRole('button', { name: 'Attach Chrome capture' }).click();
  await beat('attached', 2900);
  await page.getByRole('button', { name: 'Run preflight' }).click();
  const priceRow = page.getByRole('row').filter({ hasText: 'Advertised price' });
  const priceSelector = page.getByLabel('Price to compare');
  let ambiguousPriceNeedsReview = false;
  if (await priceSelector.isVisible()) {
    const options = await priceSelector.locator('option').allTextContents();
    assert.ok(options.some((label) => label.includes(actualPrice)), JSON.stringify(options));
    assert.match(await priceRow.innerText(), /Needs review/);
    ambiguousPriceNeedsReview = true;
    await priceSelector.selectOption({ label: options.find((label) => label.includes(actualPrice)) });
  }
  assert.ok((await priceRow.innerText()).includes(actualPrice));
  assert.match(await priceRow.innerText(), /Mismatch/);
  const cta = page.getByRole('row').filter({ hasText: 'Call to action' });
  assert.match(await cta.innerText(), /Add to cart/);
  assert.match(await cta.innerText(), /Match\b/);
  const tags = page.getByRole('row').filter({ hasText: /utm_(?:source|medium|campaign)/ });
  assert.equal(await tags.count(), 3);
  assert.ok((await tags.allTextContents()).every((text) => text.includes('Missing')));
  await priceRow.scrollIntoViewIfNeeded();
  await beat('findings', 3250);

  stage = 'device-only inference and export';
  if (withNano) {
    await page.getByRole('button', { name: 'Inspect on device' }).click();
    await page.getByText(/via Firebase AI Logic|Nano 4.*on.device|On-device analysis/i).first().waitFor({ timeout: 90_000 });
  }
  await page.getByRole('button', { name: 'Copy tracked link' }).click();
  const corrected = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  assert.equal(corrected.pathname, new URL(brief.destination).pathname);
  for (const field of ['utm_source', 'utm_medium', 'utm_campaign']) assert.equal(corrected.searchParams.get(field), brief[field]);
  await beat('copied', 2700);
  const downloadWait = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download HTML report' }).click();
  const download = await downloadWait;
  await download.saveAs(join(evidenceDir, 'campaign-preflight-report.html'));
  const report = await readFile(join(evidenceDir, 'campaign-preflight-report.html'), 'utf8');
  assert.ok(report.includes('$' + brief.amount));
  assert.ok(report.includes(actualPrice));
  assert.ok(report.includes('utm_campaign=' + brief.utm_campaign));
  if (withNano) assert.match(report, /device analysis via Firebase AI Logic/);

  stage = 'responsive and no upload checks';
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(evidenceDir, '03-preflight-result.png'), fullPage: true });
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => (await window.axe.run({ runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })));
  assert.deepEqual(violations, []);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: join(evidenceDir, '04-preflight-mobile.png'), fullPage: true });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction((offer) => document.querySelector('#preflight-offer')?.value === offer, brief.offer);
  await page.getByRole('button', { name: 'Clear draft' }).click();
  await page.getByText('Draft cleared.', { exact: true }).waitFor();
  assert.equal(await page.locator('#preflight-offer').inputValue(), '');
  assert.ok(page.url().endsWith('/app/preflight/'));
  assert.deepEqual(network, [], 'Preflight should make no AI, App Check, Auth, or Firestore requests.');
  const result = { origin, browser, extensionVersion: manifest.version, publicLandingPage: landingUrl,
    operatorAuthoredBrief: true, actualPrice, expectedPrice: '$' + brief.amount, expectedCtaFound: true, tagsProposed: true, ambiguousPriceNeedsReview,
    capturedInNativeChromeSidePanel: true, handoffFocusedOriginalTab: true, clipboardReadback: corrected.href, reportVerified: true,
    mobileWidth: 390, axeViolations: violations.length, draftRestoredAndCleared: true, deviceInferenceVerified: withNano, requestCount: network.length, passed: true };
  await writeFile(join(evidenceDir, 'runtime.json'), JSON.stringify(result, null, 2) + '\n');
  if (record) {
    const video = page.video();
    await page.close();
    await video.saveAs(join(evidenceDir, 'preflight-web.webm'));
    await writeFile(join(evidenceDir, 'preflight-beats.json'), JSON.stringify(beats, null, 2) + '\n');
  }
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Failed during ' + stage);
  if (page) await page.screenshot({ path: join(evidenceDir, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  await context?.close();
  await rm(scratch, { recursive: true, force: true });
}

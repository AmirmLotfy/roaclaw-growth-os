import assert from 'node:assert/strict';
import { copyFile, cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium } from '../../tools/hybrid-proof/node_modules/playwright/index.mjs';

const origin = new URL(process.argv[2] ?? 'https://roaclaw-growth-os-2026.web.app').origin;
const appUrl = new URL('/app/', origin).href;
const dest = resolve('qa/evidence/accessibility');
const profile = await mkdtemp(resolve(tmpdir(), 'roaclaw-accessibility-'));
const extensionId = 'loglkephefkogehklbohjpdnhdalgnmc';
const axePath = resolve('node_modules/axe-core/axe.min.js');
const extensionTest = resolve(profile, 'extension-under-test');
const checks = [];

await mkdir(dest, { recursive: true });
let context;
try {
  await cp(resolve('apps/extension'), extensionTest, { recursive: true });
  await copyFile(axePath, resolve(extensionTest, 'axe-test.js'));
  context = await chromium.launchPersistentContext(profile, {
    channel: 'chrome', headless: true, viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce', ignoreDefaultArgs: ['--disable-extensions'],
    args: ['--enable-unsafe-extension-debugging'],
  });
  const devtools = await context.browser().newBrowserCDPSession();
  const { id } = await devtools.send('Extensions.loadUnpacked', { path: extensionTest });
  assert.equal(id, extensionId);

  async function inspect(page, label, screenshot = false) {
    if (!await page.evaluate(() => Boolean(globalThis.axe))) {
      if (page.url().startsWith('chrome-extension:')) {
        await page.addScriptTag({ url: 'chrome-extension://' + extensionId + '/axe-test.js' });
      } else {
        await page.addScriptTag({ path: axePath });
      }
    }
    const report = await page.evaluate(async () => {
      await document.fonts.ready;
      const result = await axe.run({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
      return {
        width: innerWidth, noHorizontalOverflow: document.documentElement.scrollWidth === innerWidth,
        reduceMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        rulesPassed: result.passes.length,
        violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })),
      };
    });
    checks.push({ label, ...report });
    if (screenshot) await page.screenshot({ path: resolve(dest, label + '.png'), fullPage: true });
  }

  const app = context.pages()[0] ?? await context.newPage();
  await app.goto(origin, { waitUntil: 'networkidle' });
  await app.getByRole('heading', { name: /The page said/ }).waitFor();
  await inspect(app, 'website-desktop');

  await app.getByRole('link', { name: 'Open Growth Audit', exact: true }).first().click();
  await app.waitForURL(appUrl);
  await app.getByRole('button', { name: 'Open demo' }).click();
  await app.getByRole('heading', { name: 'Choose a demo workspace' }).waitFor();
  await inspect(app, 'demo-setup', true);

  await app.getByRole('button', { name: 'Open ecommerce demo' }).click();
  await app.getByText('Demo session active', { exact: true }).waitFor();
  await inspect(app, 'audit-laptop', true);

  for (const view of ['Overview', 'Campaigns', 'Clients', 'Agent', 'Memory', 'Automations', 'Settings']) {
    await app.getByRole('button', { name: view, exact: true }).click();
    await app.getByRole('heading', { level: 1, name: view, exact: true }).waitFor();
    await inspect(app, view.toLowerCase());
  }

  await app.getByRole('button', { name: 'Growth Audit', exact: true }).click();
  await app.getByRole('button', { name: 'Use an approved Chrome capture' }).click();
  await app.getByRole('button', { name: 'Pair Chrome extension' }).click();
  await app.getByRole('button', { name: 'Check pairing', exact: true }).waitFor();

  // The connected panel's document can be checked at both exact CSS widths in an extension tab.
  const panel = await context.newPage();
  await panel.setViewportSize({ width: 360, height: 740 });
  await panel.goto('chrome-extension://' + extensionId + '/panel.html');
  await panel.getByRole('button', { name: 'Connect workspace', exact: true }).click();
  await panel.getByRole('heading', { name: 'Inspect current page', exact: true }).waitFor();
  await inspect(panel, 'extension-360', true);
  await panel.setViewportSize({ width: 420, height: 850 });
  await inspect(panel, 'extension-420', true);

  await app.setViewportSize({ width: 390, height: 844 });
  await inspect(app, 'audit-mobile', true);
} finally {
  await context?.close();
  await rm(profile, { recursive: true, force: true });
  await writeFile(resolve(dest, 'runtime.json'), JSON.stringify(checks, null, 2) + '\n');
}
console.log(JSON.stringify(checks.map(({ label, width, rulesPassed, violations }) => ({ label, width, rulesPassed, violations: violations.map(({ id }) => id) })), null, 2));
assert.ok(checks.every(({ violations, noHorizontalOverflow, reduceMotion }) => !violations.length && noHorizontalOverflow && reduceMotion), 'See the accessibility report for any violations and overflow.');

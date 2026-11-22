import assert from 'node:assert/strict';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '../../tools/hybrid-proof/node_modules/playwright/index.mjs';

const origin = process.argv[2] ?? 'https://roaclaw-growth-os-2026.web.app';
const profile = resolve('.local/g0-chrome');
const dest = resolve('qa/evidence/web');
const recordVideo = process.env.ROACLAW_CAPTURE_VIDEO === '1';
await mkdir(dest, { recursive: true });
const recordingStart = Date.now();
const context = await chromium.launchPersistentContext(profile, {
  channel: 'chrome',
  ignoreDefaultArgs: true,
  args: [
    '--user-data-dir=' + profile,
    '--remote-debugging-pipe',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ],
  viewport: { width: 1440, height: 920 },
  ...(recordVideo ? { recordVideo: { dir: resolve('.local/footage'), size: { width: 1440, height: 920 } } } : {}),
});
const responses = [];
let page;
const beats = {};
async function beat(name) {
  if (!recordVideo) return;
  const start = (Date.now() - recordingStart) / 1000;
  await new Promise((done) => setTimeout(done, 2200));
  beats[name] = { start, end: (Date.now() - recordingStart) / 1000 };
}
try {
  page = context.pages()[0] ?? await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.clearBrowserCache');
  await cdp.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
  await cdp.detach();
  page.on('response', (response) => {
    const url = new URL(response.url());
    const kind = url.pathname.includes(':generateContent') ? 'generation'
      : url.pathname.includes(':exchangeRecaptchaEnterpriseToken') ? 'app-check' : null;
    if (kind) responses.push({ kind, host: url.hostname, status: response.status() });
  });
  if (recordVideo) {
    await page.goto(origin + '/demo-store/', { waitUntil: 'networkidle' });
    await page.getByText('$119', { exact: true }).waitFor();
    await beat('offer');
  }
  await page.goto(origin, { waitUntil: 'networkidle', timeout: 45000 });
  await page.getByRole('heading', { name: 'Growth Audit', exact: true }).waitFor();
  await page.getByText('Check that the landing page matches the ad.', { exact: true }).waitFor({ timeout: 8000 });
  const open = page.getByRole('button', { name: 'Open demo' });
  if (await open.isVisible()) await open.click();
  await page.getByText('Demo session active', { exact: true }).waitFor({ timeout: 45000 });
  const modes = page.getByLabel('Inference mode');
  await modes.selectOption('local');
  await page.getByRole('button', { name: /^(Run Growth Audit|Run again)$/ }).click();
  await page.getByText('Page · On device', { exact: true }).waitFor({ timeout: 90000 });
  await page.getByText(/Advertised \$99 vs landing page \$119/).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: resolve(dest, '01-on-device.png'), fullPage: true });
  await beat('device');
  await modes.selectOption('hybrid');
  await page.getByRole('button', { name: 'Run again' }).click();
  await page.getByText('Review · In cloud', { exact: true }).waitFor({ timeout: 90000 });
  await page.getByText('Page · On device', { exact: true }).waitFor();
  await page.getByRole('heading', { name: /campaign tracking|campaign tag|UTM/i }).waitFor();
  await page.getByRole('heading', { name: /ROAS|return on ad spend/i }).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: resolve(dest, '02-hybrid-audit.png'), fullPage: true });
  await beat('cloud');
  await beat('findings');
  await page.getByText('Save a tagged URL', { exact: true }).scrollIntoViewIfNeeded();
  await beat('review');

  await page.getByRole('button', { name: 'Automations', exact: true }).click();
  await page.locator('.command-form select').selectOption('minute');
  await page.getByRole('button', { name: 'Schedule follow-up' }).click();
  await page.getByText('scheduled', { exact: true }).waitFor();
  const nextMinute = await page.evaluate(() => Date.now() + 70_000);
  await page.clock.setFixedTime(nextMinute);
  await page.getByRole('button', { name: 'Run due checks' }).click();
  await page.getByText('The fixture storefront displays $119.', { exact: true }).waitFor();
  await page.screenshot({ path: resolve(dest, '03-followup-recheck.png'), fullPage: true });
  await beat('followup');
  await page.clock.setFixedTime(Date.now());

  await page.getByRole('button', { name: 'Clients', exact: true }).click();
  await page.locator('select[aria-label="Workspace"]').selectOption('morrow-dental');
  await page.getByRole('button', { name: 'Growth Audit', exact: true }).click();
  await page.getByText('Booking page fixture', { exact: true }).waitFor();
  await beat('workspaces');
  assert.equal(await page.getByText('Review · In cloud', { exact: true }).count(), 0);
  await page.locator('select[aria-label="Workspace"]').selectOption('sable-stem');
  await page.getByText('Review · In cloud', { exact: true }).waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('Review · In cloud', { exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('heading', { name: 'Growth Audit', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), true);
  await page.screenshot({ path: resolve(dest, '04-mobile.png'), fullPage: true });

  assert.ok(responses.some((response) => response.kind === 'generation' && response.status === 200));
  const report = { origin, passed: true, appCheckResponses: responses, deviceAnalysis: true, cloudReview: true, firestoreReload: true, workspaceIsolationInView: true, fixtureRecheck: true, mobileNoOverflow: true };
  await writeFile(resolve(dest, 'runtime.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  if (page) {
    await page.screenshot({ path: resolve(dest, 'failure.png'), fullPage: true }).catch(() => {});
    console.log('Browser error:', await page.locator('[role="alert"]').last().textContent({ timeout: 500 }).catch(() => 'none'));
    console.log('Observed routes:', JSON.stringify(responses));
  }
  throw error;
} finally {
  const rawVideo = recordVideo ? await page?.video()?.path().catch(() => null) : null;
  await context.close();
  if (rawVideo && beats.followup && beats.workspaces) {
    const videoFile = resolve('.local/footage/roaclaw-web.webm');
    await copyFile(rawVideo, videoFile);
    await writeFile(resolve('.local/footage/roaclaw-web-beats.json'), JSON.stringify(beats, null, 2) + '\n');
  }
}

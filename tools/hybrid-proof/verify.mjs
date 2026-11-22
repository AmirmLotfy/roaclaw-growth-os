import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, statfs, writeFile } from 'node:fs/promises';
import { arch, availableParallelism, tmpdir, totalmem } from 'node:os';
import { resolve, join } from 'node:path';
import { chromium, errors } from 'playwright';

const base = 'http://127.0.0.1:5173';
const localOnly = process.argv.includes('--local-only');
const evidence = resolve('../../qa/evidence/g0', localOnly ? 'after-storage' : '');
const tokenPath = localOnly ? undefined : process.env.ROACLAW_DEBUG_TOKEN_FILE;
const token = tokenPath ? (await readFile(tokenPath, 'utf8')).trim() : undefined;
const keepProfile = process.argv.includes('--keep-profile');
const promptFlags = ['gemma4-for-built-in-ai', 'prompt-api', 'prompt-api-multimodal-input'];

await mkdir(evidence, { recursive: true });
const profile = keepProfile ? resolve('../../.local/g0-chrome') : await mkdtemp(join(tmpdir(), 'roaclaw-chrome-'));
const options = {
  channel: 'chrome',
  headless: false,
  viewport: { width: 1120, height: 780 },
  // Chrome's model broker needs normal component updates, network and rollout settings.
  ignoreDefaultArgs: true,
  args: [
    `--user-data-dir=${profile}`,
    '--remote-debugging-pipe',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ],
};
let context;

async function checkPromptFlags(page, enableFlags = false) {
  await page.goto('chrome://flags/', { waitUntil: 'domcontentloaded' });
  for (const id of promptFlags) {
    const flag = page.locator(`select[aria-labelledby="${id}_name"]`);
    await flag.waitFor();
    const enabled = await flag.locator('option').evaluateAll((items) =>
      items.find((item) => item.textContent.trim() === 'Enabled')?.value,
    );
    assert.ok(enabled, `Chrome does not expose an Enabled choice for ${id}`);
    if (enableFlags && await flag.inputValue() !== enabled) await flag.selectOption(enabled);
    assert.equal(await flag.inputValue(), enabled, `Chrome flag ${id} must be enabled`);
  }
}

async function inspectChromeLaunch(page) {
  await page.goto('chrome://version/', { waitUntil: 'domcontentloaded' });
  const commandLine = await page.locator('#command_line').innerText();
  const blockingSwitches = commandLine.match(
    /--(?:disable-background-networking|disable-component-update|disable-field-trial-config|metrics-recording-only)\b/g,
  ) ?? [];
  const disabledFeatures = [...commandLine.matchAll(/--disable-features=([^\s"]+)/g)]
    .flatMap(([, features]) => features.split(','));
  if (disabledFeatures.includes('OptimizationHints')) blockingSwitches.push('OptimizationHints disabled');
  assert.deepEqual(blockingSwitches, [], 'Chrome must launch with native model updates enabled');
  return { enabledFlags: promptFlags, blockingSwitches };
}

async function inspectChromeModel() {
  const diagnostics = await context.newPage();
  try {
    const modelPage = 'chrome://on-device-internals/';
    await diagnostics.goto(modelPage, { waitUntil: 'domcontentloaded' });
    if ((await diagnostics.title()).includes('currently disabled')) {
      await diagnostics.goto('chrome://chrome-urls/', { waitUntil: 'domcontentloaded' });
      const enable = diagnostics.getByRole('button', { name: /enable internal debugging/i });
      if (await enable.isVisible()) {
        await enable.click();
        await diagnostics.goto(modelPage, { waitUntil: 'domcontentloaded' });
      }
    }
    const broker = diagnostics.getByText('Broker State', { exact: true });
    if (await broker.isVisible()) {
      await broker.click();
      await diagnostics.locator('tbody tr').first().waitFor({ timeout: 6000 }).catch(() => {});
    }
    await diagnostics.screenshot({
      path: join(evidence, '05-chrome-model.png'),
      mask: [diagnostics.getByText(profile)],
    });
    return await diagnostics.evaluate((profilePath) => {
      const roots = [document];
      for (const root of roots) {
        for (const element of root.querySelectorAll('*')) {
          if (element.shadowRoot) roots.push(element.shadowRoot);
        }
      }
      const redact = (value) => value.trim().replaceAll(profilePath, '<chrome-profile>');
      const tables = roots.flatMap((root) => [...root.querySelectorAll('table')])
        .filter((table) => table.getClientRects().length)
        .map((table) => ({
          columns: [...table.querySelectorAll('thead th')].map((cell) => redact(cell.innerText)),
          rows: [...table.querySelectorAll('tbody tr')].slice(0, 30)
            .map((row) => [...row.cells].map((cell) => redact(cell.innerText))),
        }));
      const visibleText = roots.flatMap((root) => [...root.querySelectorAll('*')])
        .filter((element) => !element.children.length && element.getClientRects().length && element.innerText?.trim())
        .map((element) => redact(element.innerText));
      return { title: document.title, tables, visibleText: [...new Set(visibleText)].join(' ').slice(0, 2400) };
    }, profile);
  } catch (error) {
    return { error: error.name };
  } finally {
    await diagnostics.close();
  }
}

try {
  context = await chromium.launchPersistentContext(profile, options);
  await checkPromptFlags(context.pages()[0] ?? await context.newPage(), true);
  await context.close();
  context = await chromium.launchPersistentContext(profile, options);
  if (token) {
    await context.addInitScript((debugToken) => {
      if (location.origin === 'http://127.0.0.1:5173') self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
    }, token);
  }
  const page = context.pages()[0] ?? await context.newPage();
  await checkPromptFlags(page);
  const launch = await inspectChromeLaunch(page);
  await page.goto(base);
  await page.locator('#local').and(page.locator(':enabled')).waitFor();
  const cdp = await context.newCDPSession(page);
  const { product } = await cdp.send('Browser.getVersion');
  await cdp.detach();
  const browser = { product, secureOrigin: await page.evaluate(() => isSecureContext), launch };
  const disk = await statfs(profile);
  const machine = {
    arch: arch(),
    availableCpuCores: availableParallelism(),
    memoryBytes: totalmem(),
    chromeVolumeFreeBytes: disk.bavail * disk.bsize,
  };
  console.log('Chrome flags verified. Waiting for the browser model broker to report availability.');
  const availabilityReported = await page.waitForFunction(
    () => document.querySelector('#setup')?.textContent?.startsWith('Chrome model availability:'),
    undefined,
    { timeout: 120000 },
  ).then(() => true, (error) => {
    if (error instanceof errors.TimeoutError) return false;
    throw error;
  });
  const setup = availabilityReported
    ? await page.locator('#setup').innerText()
    : 'Chrome model availability did not resolve during the first 120 seconds.';
  console.log(setup);
  const requests = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== base && (url.protocol === 'http:' || url.protocol === 'https:')) {
      requests.push({ method: request.method(), host: url.hostname, aiGeneration: request.url().includes(':generateContent') });
    }
  });

  async function run(id, label, timeout = 45000) {
    const start = requests.length;
    const browserOnline = await page.evaluate(() => navigator.onLine);
    const statuses = [];
    const attestationStatuses = [];
    const exchanges = [];
    let attachedAppCheck = false;
    const observeResponse = (response) => {
      if (response.url().includes(':exchangeDebugToken')) {
        attestationStatuses.push(response.status());
        if (!response.ok()) {
          exchanges.push(response.json().then((body) => ({
            status: body.error?.status,
            reasons: body.error?.details?.map((entry) => entry.reason).filter(Boolean),
          })).catch(() => ({})));
        }
      }
      if (response.url().includes(':generateContent')) {
        statuses.push(response.status());
        attachedAppCheck ||= 'x-firebase-appcheck' in response.request().headers();
      }
    };
    page.on('response', observeResponse);
    try {
      await page.locator(`#${id}`).click();
      const completed = await page.locator('#source[data-outcome="verified"], #source[data-outcome="unavailable"]')
        .waitFor({ timeout }).then(() => true, (error) => {
          if (error instanceof errors.TimeoutError) return false;
          throw error;
        });
      await page.screenshot({ path: join(evidence, `${label}.png`) });
      const source = completed ? await page.locator('#source').innerText() : 'TIMEOUT';
      return {
        source,
        sdkSource: completed ? await page.locator('#source').getAttribute('data-sdk-source') : null,
        detail: await page.locator('#detail').innerText(),
        sample: completed && source !== 'UNAVAILABLE' ? JSON.parse(await page.locator('#result').innerText()) : null,
        browserOnline,
        requests: requests.slice(start),
        generationHttpStatuses: statuses,
        debugExchangeHttpStatuses: attestationStatuses,
        debugExchangeErrors: await Promise.all(exchanges),
        attachedAppCheck,
      };
    } finally {
      page.off('response', observeResponse);
    }
  }

  // A cold Chrome model download can exceed a short integration-test timeout.
  const localTimeout = !availabilityReported || /: (downloadable|downloading)\./.test(setup)
    ? 15 * 60 * 1000
    : undefined;
  const local = await run('local', '01-local-only', localTimeout);
  const report = { mode: localOnly ? 'local-only' : 'full', browser, machine, setup, local };
  if (local.source === 'ON_DEVICE') {
    await context.setOffline(true);
    report.offline = await run('local', '02-local-offline');
    await context.setOffline(false);
  }
  if (!localOnly && await page.locator('#cloud').isEnabled()) {
    report.cloud = await run('cloud', '03-cloud');
    report.hybrid = await run('hybrid', '04-hybrid-preferred');
    if (token) {
      const generate = /^https:\/\/firebasevertexai\.googleapis\.com\/.*:generateContent(?:\?|$)/;
      await page.route(generate, async (route) => {
        const headers = { ...route.request().headers() };
        delete headers['x-firebase-appcheck'];
        await route.continue({ headers });
      });
      report.withoutAttestation = await run('cloud', '06-app-check-enforced');
      await page.unroute(generate);
    }
  }
  report.chromeModel = await inspectChromeModel();
  await writeFile(join(evidence, 'runtime.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  assert.equal(local.requests.length, 0, 'The local-only request contacted an external host');
  if (!localOnly) {
    assert.equal(report.cloud?.source, 'IN_CLOUD', 'G0 requires an observed cloud SDK result');
    if (token) {
      assert.equal(report.cloud.attachedAppCheck, true, 'Debug-attested generation must attach App Check');
      assert.ok(report.cloud.debugExchangeHttpStatuses.includes(200), 'App Check must accept the debug exchange');
      assert.ok(
        report.withoutAttestation?.source === 'UNAVAILABLE' &&
        report.withoutAttestation.generationHttpStatuses.some((status) => status === 401 || status === 403),
        'Firebase must reject a request without valid App Check attestation',
      );
    }
    if (local.source === 'UNAVAILABLE') {
      assert.equal(report.hybrid?.source, 'IN_CLOUD', 'A consented hybrid request must fall back when the local model is unavailable');
    }
  }
  assert.equal(local.sdkSource, 'on_device', 'G0 requires an observed on-device SDK result');
  assert.equal(report.offline?.sdkSource, 'on_device', 'The local-only request must also work offline');
  assert.equal(report.offline.browserOnline, false, 'The browser context must be offline during the offline request');
  assert.equal(report.offline.requests.length, 0, 'The offline request attempted to contact an external host');
} finally {
  await context?.close();
  if (!keepProfile) await rm(profile, { recursive: true, force: true });
}

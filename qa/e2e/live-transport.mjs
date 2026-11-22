import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium } from '../../tools/hybrid-proof/node_modules/playwright/index.mjs';

process.loadEnvFile(resolve('apps/web/.env.local'));
const origin = 'https://roaclaw-growth-os-2026.web.app';
const sdk = '13.4.0';
const model = 'gemini-3.1-flash-live-preview';
const profile = await mkdtemp(resolve(tmpdir(), 'roaclaw-live-transport-'));
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
};
let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chrome', headless: false });
  const page = context.pages()[0];
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  const transport = await page.evaluate(async ({ sdk, model, config, siteKey }) => {
    const resolveModule = (module) => 'https://www.gstatic.com/firebasejs/' + sdk + '/firebase-' + module + '.js';
    const [{ initializeApp }, { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken }, ai] =
      await Promise.all(['app', 'app-check', 'ai'].map((module) => import(resolveModule(module))));
    const app = initializeApp(config);
    const appCheck = initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(siteKey) });
    const { token } = await getToken(appCheck);
    const events = [];
    const RealSocket = window.WebSocket;
    window.WebSocket = class extends RealSocket {
      constructor(url, protocols) {
        super(url, protocols);
        const endpoint = new URL(url);
        events.push({ phase: 'start', host: endpoint.hostname, queryKeys: [...endpoint.searchParams.keys()] });
        this.addEventListener('open', () => events.push({ phase: 'open' }));
        this.addEventListener('close', ({ code, reason }) => events.push({
          phase: 'close', code, invalidAppCheck: /app check token is invalid/i.test(reason),
        }));
      }
    };
    try {
      const live = ai.getLiveGenerativeModel(ai.getAI(app, { backend: new ai.GoogleAIBackend() }), {
        model,
        generationConfig: { responseModalities: [ai.ResponseModality.AUDIO] },
      });
      const outcome = await Promise.race([
        live.connect().then(async (session) => {
          if (typeof session.close === 'function') await session.close();
          return { connected: true };
        }).catch((error) => ({
          connected: false, code: error.code ?? null, invalidAppCheck: /app check token is invalid/i.test(error.message),
        })),
        new Promise((done) => setTimeout(() => done({ connected: false, timeout: true }), 15_000)),
      ]);
      return { appCheckObtained: Boolean(token), ...outcome, events, microphoneUsed: false };
    } finally {
      window.WebSocket = RealSocket;
    }
  }, { sdk, model, config, siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY });
  const dest = resolve('qa/evidence/live');
  await mkdir(dest, { recursive: true });
  const report = { origin, sdk, model, ...transport };
  await writeFile(resolve(dest, 'transport.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await context?.close();
  await rm(profile, { recursive: true, force: true });
}

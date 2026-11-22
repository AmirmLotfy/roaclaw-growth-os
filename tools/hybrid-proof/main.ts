import { initializeApp } from 'firebase/app';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
  InferenceSource,
  Schema,
} from 'firebase/ai';
import { getToken, initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import './style.css';

const config = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
};
const setup = document.querySelector<HTMLParagraphElement>('#setup')!;
const source = document.querySelector<HTMLHeadingElement>('#source')!;
const detail = document.querySelector<HTMLParagraphElement>('#detail')!;
const output = document.querySelector<HTMLPreElement>('#result')!;
const buttons = [
  { button: document.querySelector<HTMLButtonElement>('#local')!, mode: InferenceMode.ONLY_ON_DEVICE },
  { button: document.querySelector<HTMLButtonElement>('#cloud')!, mode: InferenceMode.ONLY_IN_CLOUD },
  { button: document.querySelector<HTMLButtonElement>('#hybrid')!, mode: InferenceMode.PREFER_ON_DEVICE },
];
const runtime = globalThis as Window & typeof globalThis & {
  FIREBASE_APPCHECK_DEBUG_TOKEN?: string;
  LanguageModel?: { availability: () => Promise<string> };
};
const debugToken = import.meta.env.DEV && location.hostname === '127.0.0.1'
  ? runtime.FIREBASE_APPCHECK_DEBUG_TOKEN
  : undefined;
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const cloudEnabled = Boolean(siteKey || debugToken);
const cloudModel = 'gemini-3.5-flash-lite';
const prompt = 'Extract the displayed USD price as priceUsd and the exact button text as cta. Page: Sable & Stem task lamp · $119 · Add to cart.';
const responseSchema = Schema.object({
  properties: { priceUsd: Schema.integer(), cta: Schema.string() },
});
const deviceResponseConstraint = {
  type: 'object',
  properties: { priceUsd: { type: 'integer' }, cta: { type: 'string' } },
  required: ['priceUsd', 'cta'],
  additionalProperties: false,
};

function validateSample(text: string) {
  const parsed: unknown = JSON.parse(text);
  if (
    typeof parsed !== 'object' || parsed === null ||
    !('priceUsd' in parsed) || parsed.priceUsd !== 119 ||
    !('cta' in parsed) || parsed.cta !== 'Add to cart'
  ) {
    throw new Error('The response did not match the synthetic fixture.');
  }
  return { priceUsd: parsed.priceUsd, cta: parsed.cta };
}

function safeError(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return typeof error.code === 'string' && /^[\w/-]+$/.test(error.code) ? error.code : 'SDK request failed';
  }
  return error instanceof Error ? error.name : 'SDK request failed';
}

async function chromeAvailability() {
  try {
    return (await runtime.LanguageModel?.availability()) ?? 'API absent';
  } catch (error) {
    return safeError(error);
  }
}

if (!Object.values(config).every(Boolean)) {
  setup.textContent = 'Firebase web configuration is missing.';
} else {
  const app = initializeApp(config);
  const appCheck = cloudEnabled
    ? initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey || 'development-debug-provider'),
    })
    : undefined;
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const updateButtons = (running: boolean) => {
    for (const { button, mode } of buttons) {
      button.disabled = running || (mode !== InferenceMode.ONLY_ON_DEVICE && !cloudEnabled);
    }
  };

  for (const { button, mode } of buttons) {
    button.addEventListener('click', async () => {
      updateButtons(true);
      source.textContent = 'Running';
      source.dataset.outcome = 'running';
      delete source.dataset.sdkSource;
      detail.textContent = 'Waiting for Firebase AI Logic.';
      output.hidden = true;
      output.textContent = '';

      try {
        const model = getGenerativeModel(ai, {
          mode,
          inCloudParams: {
            model: cloudModel,
            generationConfig: { responseMimeType: 'application/json', responseSchema },
          },
          onDeviceParams: { promptOptions: { responseConstraint: deviceResponseConstraint } },
        });
        if (mode !== InferenceMode.ONLY_IN_CLOUD) {
          const initialization = model.initializeDeviceModel((progress) => {
            if (source.dataset.outcome === 'running' && mode === InferenceMode.ONLY_ON_DEVICE) {
              detail.textContent = `Chrome is downloading the local model (${Math.round(progress * 100)}%).`;
            }
          });
          if (mode === InferenceMode.ONLY_ON_DEVICE) {
            await initialization;
          } else {
            void initialization.catch(() => {});
          }
        }
        if (mode !== InferenceMode.ONLY_ON_DEVICE && appCheck) {
          await getToken(appCheck);
        }
        const { response } = await model.generateContent(prompt);
        const observedSource = response.inferenceSource;
        if (observedSource !== InferenceSource.ON_DEVICE && observedSource !== InferenceSource.IN_CLOUD) {
          throw new Error('Firebase did not report a recognized inference source.');
        }
        if (
          (mode === InferenceMode.ONLY_ON_DEVICE && observedSource !== InferenceSource.ON_DEVICE) ||
          (mode === InferenceMode.ONLY_IN_CLOUD && observedSource !== InferenceSource.IN_CLOUD)
        ) {
          throw new Error('Firebase reported a source outside the selected mode.');
        }
        const sample = validateSample(response.text());
        source.dataset.sdkSource = observedSource;
        source.textContent = observedSource.toUpperCase();
        source.dataset.outcome = 'verified';
        detail.textContent = 'Firebase SDK source and fixture output verified.';
        output.textContent = JSON.stringify(sample, null, 2);
        output.hidden = false;
      } catch (error) {
        source.textContent = 'UNAVAILABLE';
        source.dataset.outcome = 'unavailable';
        detail.textContent = `Firebase inference did not complete (${safeError(error)}).`;
      } finally {
        updateButtons(false);
      }
    });
  }
  updateButtons(false);
  void chromeAvailability().then((availability) => {
    setup.textContent = `Chrome model availability: ${availability}. ${cloudEnabled ? 'App Check configured for cloud requests.' : 'Cloud checks need App Check configuration.'}`;
  });
}

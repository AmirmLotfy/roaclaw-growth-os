# Firebase hybrid inference — hard implementation contract

## Why the SDK matters
Official contest FAQ: all application AI inference must go through Firebase AI Logic; Web/Chrome must demonstrate Gemini Nano 4 on-device plus cloud; App Check is required. Calling Chrome's Prompt API directly to produce your winning AI feature **without** Firebase AI Logic does not meet the intended requirement. Backend direct Gemini REST/Google AI Studio calls should not be used as substitutes for runtime inference.

## Verified web baseline (22 November 2026)
- Firebase AI Logic JS SDK on Chrome Desktop >= v139, with supported hardware, required flags and downloaded local model.
- On-device: single-turn text, supported image input JPEG/PNG, structured output; no local chat, tool calling, audio/video/PDF or Google Search grounding.
- Cloud: selected supported Gemini model via Firebase AI Logic, tool calls/longer multimodal processing as supported by chosen provider/model.
- Web hybrid modes: `PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`.
- Actual `response.inferenceSource` is `ON_DEVICE` or `IN_CLOUD`. Display it, log it without sensitive prompts, and test it.
- On the tested Chrome 158 build, enable `chrome://flags/#gemma4-for-built-in-ai`, `chrome://flags/#prompt-api`, and `chrome://flags/#prompt-api-multimodal-input` in the test profile. Relaunch Chrome and confirm model readiness. Chrome requires at least 22 GB free on the profile volume to download the model.
- Cloud fallback depends on current model availability and billing. Verify Firebase models list; choose supported options rather than hardcoding unsupported names.

## Representative pattern (VERIFY against installed SDK API before copying)
```ts
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from 'firebase/ai';

const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
const pageModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
  inCloudParams: { model: 'gemini-3.5-flash-lite' },
});
const result = await pageModel.generateContent('Extract title, CTA and visible offer as JSON from: ...');
const mode = result.response.inferenceSource; // Actual SDK result, never hardcode
const output = result.response.text();
```
Use strict structured output and parse with Zod. For hard privacy mode choose `ONLY_ON_DEVICE` and never automatically retry in cloud. For cloud-only multi-step analysis choose `ONLY_IN_CLOUD`, current supported model, and validate each tool argument. Do not treat a cloud result as successful local inference.

## Three model paths
1. **Page Scout (local):** minimal selected page data -> `{offer, price, cta, destination, trackingHints, observations, missingFields}`. This is a single turn. Hallucination mitigation: every observation needs a quoted snippet or exact field evidence.
2. **Growth Reasoner (cloud):** normalized campaign metrics + Page Scout output -> findings each with `type=fact|hypothesis`, sources, severity, missing evidence, recommended allowed action and limits. Tool plan is untrusted until verified.
3. **Voice Operator (cloud Live Preview):** real-time microphone and spoken responses via Firebase AI Logic Live API; text UI is source of truth for what will execute. Current preview model documented: `gemini-3.1-flash-live-preview` (Google AI backend). Verify actual SDK/model and supported locales at implementation. No local-audio inference claim.

## MVP tool/action routing
Natural-language utterance -> intent and workspace guard -> plan -> `propose_action` record -> human approval -> deterministic tool executor -> postcondition -> action event. Inference output is **data**, not executable code. No model-generated arbitrary browser JS or direct database updates to approval flags.

## Proof-of-hybrid QA
- Test real supported Chrome on HTTPS app: local model readiness, download, `ONLY_ON_DEVICE` extraction, exact ON_DEVICE source.
- Turn off network after model readiness and repeat local-only extraction on already available page content. Record failures honestly if web app offline shell isn't cached.
- Test `PREFER_ON_DEVICE` on unavailable local model and verify actual `IN_CLOUD` fallback without showing a fake status.
- Test `ONLY_ON_DEVICE` with unavailable local model: no request should reach cloud.
- Test independent cloud reasoning through Firebase, not same response relabeled.
- Capture model/Chrome/SDK versions, date, flags, hardware eligibility, consent, input fixture and screenshots. The evidence should prove both paths, not performance marketing.

## Cost and failure handling
AI call quotas and timeout; deterministic backoff for temporary 429/503; prompt token budget; no infinite agent loops; 'model unavailable' and 'requires billing' UX; user-visible inference source and privacy settings. Preview Live API may change—record tested version.

## Sources
https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options
https://firebase.google.com/docs/ai-logic/live-api
https://firebasehybridaihackathon.devpost.com/details/faqs

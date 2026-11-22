# Official sources and live verification checklist

**Research assembled:** 2026-11-22. Codex should open official URLs before coding or submission because APIs, contest form fields and deadlines can change.

## Hackathon
- Main: https://firebasehybridaihackathon.devpost.com/
- Rules: https://firebasehybridaihackathon.devpost.com/rules
- Resources: https://firebasehybridaihackathon.devpost.com/resources
- FAQ: https://firebasehybridaihackathon.devpost.com/details/faqs
- Deadline per current main/FAQ: **Monday 2026-11-30 14:00 PST** = **Tuesday 2026-12-01 00:00 Africa/Cairo**.
- Runtime: Firebase AI Logic local + cloud, Web Chrome Gemini Nano 4, App Check.
- Contest rules: public licensed repo; actual Firebase AI Logic runtime usage; public YouTube <=3m; project description; evidence/functionality; hosting strongly encouraged.
- FAQ: All app runtime model inference via Firebase AI Logic. Web app and Chrome extension are both Web category. Strong standalone Web entry can win; multi-platform across eligible OS platforms preferred for Grand Prize.
- Video may be evaluated alone: show REAL hybrid execution within first 30 seconds.

## Firebase and Chrome
- Hybrid Web getting started: https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
- Hybrid mode and source: https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options
- Firebase AI Logic overview: https://firebase.google.com/docs/ai-logic
- Firebase model matrix: https://firebase.google.com/docs/ai-logic/models
- Firebase Gemini Live: https://firebase.google.com/docs/ai-logic/live-api
- Firebase official agent skills (including Codex): https://firebase.google.com/docs/ai-assistance/agent-skills
- Firebase App Check: https://firebase.google.com/docs/app-check
- Chrome MV3 side panel: https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- Chrome permissions: https://developer.chrome.com/docs/extensions/reference/permissions-list
- Chrome extension security: https://developer.chrome.com/docs/extensions/develop/migrate/improve-security
- Chrome built-in AI: https://developer.chrome.com/docs/ai/built-in

## Ad integrations and platform policies
- Meta Marketing API overview: https://developers.facebook.com/docs/marketing-apis/
- Meta permissions: https://developers.facebook.com/docs/permissions/
- Google Ads API: https://developers.google.com/google-ads/api/docs/start
- Shopify Admin API: https://shopify.dev/docs/api/admin-graphql
- Do not automate restricted sites in violation of their policies.

## Video, upload and submission
- Remotion: https://www.remotion.dev/docs/
- Remotion render: https://www.remotion.dev/docs/render
- Remotion recorder: https://www.remotion.dev/docs/recorder
- YouTube Data API uploads: https://developers.google.com/youtube/v3/docs/videos/insert
- Google AI Studio TTS if available: https://ai.google.dev/gemini-api/docs/speech-generation
- Verify music model availability and output license directly in the signed-in AI Studio account before relying on it.

## Motion reference IDs and attribution
- `motion-cinematic-ui-documentary`: https://motion.dev/docs/scroll
- `motion-editorial-swiss-motion`: https://www.ordinaryfolk.co/project/school-of-motion-manifesto
- `motion-animated-infographics-data`: https://buck.co/work/ibm-design-language
- `motion-ui-ux-product-animation`: https://www.ordinaryfolk.co/project/webflow-ecommerce
These are creative examples and technique references, **not copied artwork licenses**.

## Unverified by this pack
Your actual Firebase project ID, billing configuration, current Codex tool list, any 'Devpost plugin' installed inside Codex, Google AI Studio music model access, YouTube login, OAuth approval, deploy permissions, local Nano eligibility. Codex must verify rather than invent these.

## Checked during ROACLAW G0, 22 November 2026

- The [Web hybrid setup guide](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started) requires the Web SDK 12.5.0 or higher, Chrome Desktop 139 or higher and a user interaction before `initializeDeviceModel()`. The G0 probe uses SDK 13.4.0 and calls that method from the local button's click handler.
- The [Chrome built-in AI requirements](https://developer.chrome.com/docs/ai/get-started) specify 22 GB free on the Chrome profile volume before downloading. Chrome 158 exposes `gemma4-for-built-in-ai`, `prompt-api` and `prompt-api-multimodal-input` as actual flag IDs. The older multimodal flag URL in the pack differs.
- The [Firebase model list](https://firebase.google.com/docs/ai-logic/models) lists `gemini-3.5-flash-lite` as supported without billing through the Gemini Developer API. The [AI Logic App Check guide](https://firebase.google.com/docs/ai-logic/app-check) documents automatic enforcement and localhost debug tokens.
- The [Devpost schedule](https://firebasehybridaihackathon.devpost.com/details/dates), [rules](https://firebasehybridaihackathon.devpost.com/rules) and [FAQ](https://firebasehybridaihackathon.devpost.com/details/faqs) confirm the Web/Chrome Nano 4 requirement, App Check, the public licensed repo and the public YouTube video up to three minutes. The authenticated submission requirements also request submitter and eligibility declarations and pre-existing work disclosure.

# ROACLAW evidence index

Last checked 22 November 2026. The Firebase verification gate, hosted Growth Audit, and connected Chrome workflow passed. The browser measurements use Chrome 158.0.8127.37 and Firebase JavaScript SDK 13.4.0. The standalone inference probe used a loopback origin. The app and extension runs used the public Firebase Hosting origin.

| ID | Status | What was observed |
|---|---|---|
| H-01 | PASS | Firebase reported `on_device` and returned the exact $119 and “Add to cart” fixture. Chrome showed the Gemini Nano 4 GPU component `2026.11.3.1140` ready. [SDK result](evidence/g0/after-storage/01-local-only.png) · [Model broker](evidence/g0/after-storage/05-chrome-model.png) |
| H-02 | PASS | `ONLY_IN_CLOUD` returned SDK `in_cloud` using Gemini 3.5 Flash-Lite. Exact fixture fields were $119 and “Add to cart.” [Cloud result](evidence/g0/03-cloud.png) |
| H-03 | PASS | `ONLY_ON_DEVICE` failed explicitly when the model was unavailable. The browser page made zero external requests during the check. [Redacted network summary](evidence/g0/runtime.json) |
| H-04 | PASS | An explicitly consented `PREFER_ON_DEVICE` request returned SDK `in_cloud` on the same device with no available local model. [Fallback result](evidence/g0/04-hybrid-preferred.png) |
| H-05 | PASS | An independent local-only call returned `on_device` and the exact fixture while the browser context was offline. The verifier observed `navigator.onLine=false` and zero external page requests. [Offline result](evidence/g0/after-storage/02-local-offline.png) · [Full retest](evidence/g0/after-storage/runtime.json) |
| A-01 through A-05 | PASS | Fresh hosted anonymous session, persisted and restored audit, workspace changes without previous findings, exact fixture checks, clear observation/interpretation labels. Firestore cross-UID rules passed in the emulator. [Hosted run](evidence/web/runtime.json) · [Rule checks](backend/README.md) |
| X-05 | PASS | The hosted browser saved a scheduled follow-up and executed an independent request for the synthetic storefront once due. Execution is browser-triggered. [Completed check](evidence/web/03-followup-recheck.png) |
| X-01 through X-04 | PASS | Live Chrome paired and captured the rendered fixture. Two approved bookmarks persisted, a declined proposal produced no bookmark, and two search results matched. The dashboard ingested the receipt and restored it after reload. The expanded run also verified history results, device-only handling for a non-demo capture, and scoped pairing revocation. The expanded run pregranted test-only Chrome permissions; the release package keeps these optional. [Connected Chrome report](evidence/g3-web/runtime.json) · [Receipt](evidence/g3-web/06-web-receipt.png) |
| V-01 | BLOCKED | The Firebase Web Live SDK does not send the required App Check attestation on the Live transport. [Voice investigation](backend/live-voice.md) · [Hosted rejection trace](evidence/live/transport.json) |
| V-02 | PASS | Asked for the audit price finding through Agent text lookup in hosted Chrome. [Text lookup](evidence/web/05-text-lookup.png) |
| D-01 and D-02 | PASS FOR TESTED STATES | Checked the homepage and dashboard at desktop and mobile sizes, paired extension content at 360 and 420 CSS pixels, keyboard access to the site skip link, and reduced-motion behavior. Axe reported zero WCAG A/AA-tagged violations in the 13 scanned views. [Hosted browser](evidence/web/runtime.json) · [Axe and dimension report](evidence/accessibility/runtime.json) |
| S-01 | PARTIAL | Local environment, build and temporary credentials are ignored by Git. Final tracked-source and release scan is pending. |
| S-03 | PASS | Verified the public marketing site, the direct Growth Audit route, fresh demo onboarding, App Check and a separate cloud generation HTTP 200. [Website](https://roaclaw-growth-os-2026.web.app/) · [Dashboard](https://roaclaw-growth-os-2026.web.app/app/) · [Browser run](evidence/web/runtime.json) |
| S-02 | PASS | Public Apache 2.0 repository and successful GitHub Actions run for the initial build. Latest deployment candidate is undergoing release verification. [Repository](https://github.com/AmirmLotfy/roaclaw-growth-os) |
| S-04 | HOLD | The 47.68-second first cut is a private Studio draft. The replacement cut is being prepared from the expanded release. |
| S-05 | DRAFT | The authenticated Devpost project exists with no submission timestamp. [RoaClaw draft](https://devpost.com/software/roaclaw-o1637x) |

The probe's type check and Vite production build passed. The final local-only verifier exited successfully. Earlier cloud and App Check tests remain separately recorded. Git and Firebase CLI setup are recorded in the [worklog](../WORKLOG.md).

Firebase's control plane returned `ENFORCED` for the AI Logic App Check service. A real debug exchange succeeded with HTTP 200, and generation without the attestation header returned HTTP 401. The redacted browser report records header presence and response statuses. The production hosted browser also completed reCAPTCHA Enterprise attestation and cloud generation with HTTP 200. [App Check service readback](evidence/g0/app-check.json) · [Rejected request](evidence/g0/06-app-check-enforced.png)

## Expanded hosted scope

The verified build has a standalone marketing route and three runnable audit scenarios. The browser test opened the demo from the marketing site, downloaded the extension ZIP, downloaded and parsed the audit JSON, ran the dental and retail audits, found tagged research notes after a reload, and reran the completed follow-up without a duplicate. [Hosted run](evidence/web/runtime.json) · [Mobile site](evidence/web/00-website-mobile.png) · [Lead-generation audit](evidence/web/06-lead-audit.png)

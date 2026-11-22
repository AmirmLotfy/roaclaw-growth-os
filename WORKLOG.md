# ROACLAW worklog

**22 November 2026, Africa/Cairo. G0–G3 passed. Firebase Hosting is live.**

The working directory is `/Users/frameless/Desktop/Roaclaw`. The pack contained specifications, fixtures and templates. The implementation repository was initialized on `main`.

## Gate order

G0 real Firebase AI Logic inference and App Check → G1 auth and tenancy → G2 Growth Audit → G3 Chrome extension and approval receipt → G4 voice and scheduling → G5 QA and deployment → G6 video, public repository and Devpost submission. The pack makes an observed on-device result a prerequisite for starting the SaaS and extension.

## 22 November 2026

| Work | Result | Evidence |
|---|---|---|
| Read the pack and checked live requirements | The official Web entry requires Gemini Nano 4 via Firebase AI Logic and App Check. The submission is due at midnight entering 1 December in Cairo. | [Official sources and current SDK notes](research/OFFICIAL_SOURCES.md) |
| Connected design research | Reviewed 16 screens, six flows and six supporting sections from Mobbin and Refero. Reviewed three full Refero styles and kept the pack's Editorial Ledger direction. | [Design research and source IDs](design/RESEARCH_OUTPUT.md) |
| Firebase project | Created and provisioned `roaclaw-growth-os-2026` on the authorized Spark plan. Registered the ROACLAW Web app and enabled the Gemini Developer API through `firebase init ailogic`. Google Cloud reported `billingEnabled=False`. | [Firebase console](https://console.firebase.google.com/project/roaclaw-growth-os-2026/overview), [.firebaserc](.firebaserc) |
| G0 probe | Built a TypeScript probe with SDK 13.4.0, strict per-route response schemas and validation of the exact fixture output. TypeScript and Vite checks passed. The probe used synthetic data and loopback Chrome only. | [Probe and instructions](tools/hybrid-proof/README.md) |
| Cloud and fallback | Independent `ONLY_IN_CLOUD` and consented `PREFER_ON_DEVICE` calls both returned the exact synthetic offer and SDK `in_cloud`, with successful App Check debug attestation. The browser request log records HTTP results and the presence of the attestation header. | [Redacted browser evidence](qa/evidence/g0/runtime.json) |
| App Check | Verified service mode `ENFORCED` and a successful debug-token exchange. In the final browser run, Firebase returned HTTP 401 for the same synthetic request with the App Check header removed. A CLI parser error surfaced the first temporary debug credential in tool output. That credential and its replacement were revoked. The Firebase token list confirms both are gone. | [Enforcement readback](qa/evidence/g0/app-check.json), [Rejected request](qa/evidence/g0/06-app-check-enforced.png) |
| Chrome local-only | Chrome 158 returned `unavailable` with the three actual flags enabled in an isolated profile. Firebase `ONLY_ON_DEVICE` returned `api-not-enabled`. The page made zero external requests during the operation. No device session could be tested offline. | [Local-only result](qa/evidence/g0/01-local-only.png), [Chrome model broker](qa/evidence/g0/05-chrome-model.png) |
| Devpost readiness | Found the existing [RoaClaw submission draft](https://devpost.com/software/roaclaw-o1637x) through authenticated Devpost tools. It has no submission timestamp. Devpost also listed a similarly named August entry from a different event. The relationship required clarification from the account holder. | [Submission checklist](submission/SUBMISSION_CHECKLIST.md) |

## Initial blocking condition

The Chrome test volume had 12.85 GB free in the final run. The documented download minimum is 22 GB. Chrome's broker showed an empty model list and provided no additional eligibility reason. The Mac has 8 GB of unified memory. Local model eligibility must be confirmed by Chrome after resolving storage or on another eligible device. This gate needs a genuine SDK `on_device` response and a repeat offline.

The web dashboard, tenancy, Growth Audit, Chrome action, deployment, Remotion demo, public repository, YouTube and Devpost remain pending. The dedicated Firebase project remains on Spark.

## Storage cleanup and G0 retest, 22 November 2026

The authorized cleanup reclaimed 9.44 GB in the final measured cleanup sample. It removed only regenerable tool caches, a stale partial download and an incomplete duplicate Unity editor. The working Unity install and Android module, installed SDKs, other projects, worktrees and browser profiles were preserved. The [cleanup evidence](qa/evidence/g0/storage-cleanup.md) records the exact scope.

The original Playwright launch disabled Chrome's OptimizationHints feature and used other automation defaults that could suppress component updates and rollouts. The retest launcher uses Chrome's normal feature defaults in a dedicated profile, verifies the three required flags after restart and writes its local and offline evidence separately from the initial cloud proof. The first corrected run needed longer than 30 seconds for browser model readiness. The next run reached Chrome's `downloadable` state and requested the model through Firebase AI Logic.

Chrome's broker confirmed device eligibility, with 5,461 MiB VRAM and 20,816 MiB available against its 20,480 MiB installation threshold. It selected the Gemma 4 GPU model and began installing the 2.0 GB component, version `2026.11.3.1140`. The first download attempt hit the former six-minute QA timeout at 1.0 GB. The persistent-profile retry allows up to 15 minutes for the download. [Broker evidence](qa/evidence/g0/download-check/runtime.json)

**G0 PASS.** The Chrome broker marked component `2026.11.3.1140` ready with no errors and the GPU backend. Real Firebase SDK calls returned the exact synthetic values online and offline with `inferenceSource=on_device`. The offline context reported `navigator.onLine=false`. Both operations attempted zero external page requests. These results, together with the first run’s cloud, fallback and App Check proof, complete G0. [Local and offline run](qa/evidence/g0/after-storage/runtime.json)

G1 and G2 passed. Deployed tenant-scoped Firestore rules and verified anonymous sign-in. The production audit executes both on-device extraction and cloud review under App Check, detects the three fixture observations, reloads saved results, and runs a due storefront price check on request. The workspace data remains separated across client switches. [Hosted test](qa/evidence/web/runtime.json) · [Backend proof](qa/backend/spark-readback.json)

## Visual revision and submission details

- The project owner reviewed the initial UI and requested a new visual direction. The dashboard and Chrome panel now use navy, cool light surfaces, blue actions, a compact capture form, and an evidence comparison tied to confirmed audit fields. The redesigned release passed the hosted browser run and the full connected extension smoke run.
- The account holder confirmed a new independent project started on 22 November 2026, Individual, Egypt, and organization N/A. The August entry is unrelated. The account holder reviewed the contest rules and confirmed eligibility. Final submission approval remains pending.

## Release verification

- The redesigned web export, TypeScript, 10 web tests and six companion checks passed. Firebase Hosting serves the dashboard, storefront and extension ZIP over HTTPS. Mutable entry pages and the ZIP now revalidate when requested. [Redesigned dashboard](qa/evidence/web/02-hybrid-audit.png)
- The hosted test observed Nano for page extraction, App Check HTTP 200 and Firebase AI Logic HTTP 200 for cloud review. The test verified workspace switching, Firestore reload, and a 390px viewport with no horizontal overflow. The follow-up test advanced the browser clock to test due execution, then fetched the hosted price. [Hosted browser report](qa/evidence/web/runtime.json)
- G3 passed in a fresh Chrome 158 profile. The side panel paired with the dashboard, captured the storefront, got a Firebase cloud extraction in the profile without Nano, saved two approved bookmarks and verified cancellation. The test observed two local search matches, file-backed Chrome bookmark persistence, and restored the verified receipt in dashboard Memory after reload. [Connected Chrome report](qa/evidence/g3-web/runtime.json)
- G4 is partial. On-demand due checks and text lookup are available. Live voice remains blocked by the Web SDK’s App Check limitation. [Voice verification](qa/backend/live-voice.md)

## Release scope correction

The first 47.68-second recording covered the verified audit and Chrome approval. It was uploaded to YouTube Studio as a draft. Publishing and final Devpost submission were paused when the project owner asked to verify the product site and review the full app and companion scope. The Devpost description and thumbnail had already been saved to its draft.

The next release candidate adds a dedicated marketing homepage, a separate dashboard route with three runnable scenarios, tagged research notes and export, action-state persistence, session-bound Chrome pairing, local-only rules for non-demo capture, and optional local history search. The expanded hosted run verified frontend onboarding, all three audit routes, Firestore note and follow-up persistence, a decoded Chrome ZIP, and a parsed audit export. The 13-view axe pass recorded zero flagged violations in the scanned states. The connected Chrome test verified capture, receipt, history, the device-only boundary, and a new pairing nonce after sign-out. Its unattended run used a temporary manifest with test permissions, while the release ZIP still requests permissions at the point of use.

A direct hosted Firebase Live test obtained App Check, then received WebSocket code 1008 for invalid App Check on the SDK’s Live connection. The test did not access a microphone or disable App Check. The hosted Agent text lookup passed. [Transport trace](qa/evidence/live/transport.json)

The public Apache-2.0 release is [v0.1.0](https://github.com/AmirmLotfy/roaclaw-growth-os/releases/tag/v0.1.0), at commit `c9679fda100ef13abc1c77a7a7cc021c2a9ea33f`. Its extension ZIP exactly matches Firebase Hosting. The staged secret scan and GitHub Actions passed. [CI](https://github.com/AmirmLotfy/roaclaw-growth-os/actions/runs/45013512110)

The 57.813-second replacement demo rendered at 1080p with English captions. The local full decode and 13-beat visual review passed. The earlier Studio draft remains unpublished, and Devpost remains a draft. [Video QA](video/VIDEO_QA_REPORT.md)

## Premium design and submission review

The project owner paused external-browser work and requested a complete product review before any further publication. The organizer’s four pages were rechecked through read-only retrieval. The new release audit records official requirements, evidence, remaining media work, and the current publication hold. The voiceover script and AI Studio prompts were prepared for user-generated audio.

The redesign changes the product site's composition and introduces an interactive proof view. The dashboard and Chrome companion share a charcoal and lime palette. The companion has keyboard-operable Inspect, Actions, and Research views. The dashboard also now supports an in-tab offline demo audit with a local model and sync after reconnection. Each changed behavior requires a fresh test and recorded evidence before final video editing.

The premium candidate deployed on Firebase Hosting. A real local run, cloud review under App Check, and an open-tab offline rerun passed. The offline run attempted zero AI or App Check requests and saved through Firestore after reconnect. The camera retake exposed a successful Nano response with an omitted price; the audit now confirms a single explicit captured USD price independently when needed and records the evidence basis. Conflicting prices still require review. The candidate passed 12 web tests, eight companion tests, and a 13-view accessibility scan. Fresh Chrome footage and web footage were recorded off-screen using isolated QA profiles. [Hosted report](qa/evidence/web/runtime.json) · [Chrome report](qa/evidence/g3-web/runtime.json) · [Accessibility](qa/evidence/accessibility/runtime.json)

The Chrome compatibility review found an API introduced in Chrome 120 in a companion that declares Chrome 116. Version 0.2.1 uses the standard URL constructor and adds a ninth companion unit test. The hosted redeploy, matching Firebase ZIP, six Firestore emulator assertions, and full isolated Chrome 158 flow passed. The 116–119 compatibility check exercised the missing API in the unit test. [Retest](qa/evidence/chrome-0.2.1.json)

Remotion rendered the current 16-shot 85.803-second picture review at 1080p/30. Full decode, thumbnail, English captions, and scene inspection passed. It uses a silent track while the owner generates narration and music. The Devpost copy has been reconciled with the verified product. YouTube and Devpost remain drafts. [Picture QA](video/VIDEO_QA_REPORT.md) · [Devpost copy](submission/DEVPOST_DRAFT.md)

The public [0.2.1 candidate](https://github.com/AmirmLotfy/roaclaw-growth-os/releases/tag/v0.2.1-rc.1) points to `de7954bb9293666c53c5f66ad830aa4909b9c5b5`. The first clean-checkout export failed because the Firebase SDK initializes Auth during prerender. CI now uses an inert compile-time configuration and passed the clean export, typecheck and unit tests. Firebase Hosting uses its own configured environment. GitHub and Firebase Hosting returned the same extension ZIP checksum. Gitleaks scanned all five release-history commits and reported zero findings. [GitHub Actions](https://github.com/AmirmLotfy/roaclaw-growth-os/actions/runs/45017281735) · [ZIP checksum](qa/evidence/chrome-0.2.1.json)

The final dependency scan flagged two advisories on Firestore's gRPC dependency. A scoped override resolved `@grpc/grpc-js` to 1.13.7. The production workspace audit returned no known vulnerabilities. The hosted rebuild again passed local, cloud, App Check, offline sync, all three scenarios, and responsive checks. [0.2.1 security refresh](https://github.com/AmirmLotfy/roaclaw-growth-os/releases/tag/v0.2.1-rc.2) · [Hosted rerun](qa/evidence/web-0.2.1.json)

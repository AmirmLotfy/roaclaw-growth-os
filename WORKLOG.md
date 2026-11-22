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

## Campaign Preflight

The owner approved building Preflight across the website, dashboard, and Chrome companion before re-editing the film. The owner delegated choosing the landing page and writing the test brief. The test uses iFixit's publicly visible toolkit page and an independently authored QA brief. It does not exercise or represent a live ad campaign.

The browser test found two integration issues. The Chrome sender's document URL stayed on the original route during a soft Next.js transition, so links to bridge-enabled routes now use document navigation. On a warmed browser with an existing demo session, the optional model import initialized Firebase Auth. The Firebase Auth and Firestore clients now initialize only in the demo store module. The final hosted Preflight run saw zero AI, App Check, Auth or Firestore requests and returned a verified Nano on-device source. Chrome reported the campaign scope, focused the original tab, and the test inspected the copied link and downloaded report. At 390px the report fit within the viewport. Its Axe scan found zero A/AA-tagged violations in the inspected state. [Hosted runtime](qa/evidence/preflight-0.3.0.json)

The owner supplied narration and music. New production recordings show Campaign Preflight with the project's own fictional storefront. The public third-party page was used for QA. The new Remotion edit uses the supplied audio and verified product footage. External publication remains paused.

## Graphite release and submission artwork

The owner requested removal of green, blue, and purple from the visual identity. The site, dashboard, Chrome companion, browser icons, HTML export, film, and submission artwork now use graphite, neutral paper, and vermilion. Existing product captures are color-graded for the current palette. New hosted screenshots and the Chrome panel test confirm the actual deployed theme.

The Chrome 0.3.1 run repeated the live-page test, including explicit price review, clipboard readback, report export, anonymous tab-local state, and the Nano source. The inspected state had zero Axe A/AA-tagged violations and emitted no Firebase service requests. The Growth Audit rerun passed the on-device and offline steps and synced after reconnect. The automated reCAPTCHA Enterprise exchange returned HTTP 403 when the same test reached cloud mode. Earlier independent hosted cloud evidence remains in the index. [Preflight 0.3.1](qa/evidence/preflight-0.3.1.json)

The local film export passed full decode at 127.019 seconds and 1080p at 30fps. The 26 shots and 36 English cues use the supplied narration and score, real product footage, and the new Preflight sequence. Separate Devpost 3:2 and YouTube 16:9 artwork passed dimension, size and reduced-scale visual checks. No new assets were uploaded to YouTube or Devpost. [Film QA](video/VIDEO_QA_REPORT.md)

Growth Audit now completes on-device when the user selects Prefer device and App Check rejects cloud access. The UI reports the denial explicitly. The deployed rerun observed a real App Check 403, retained a verified local source and made no cloud generation request. It verified Firestore persistence, follow-ups, all three workspaces and responsive controls. The companion's original capture, bookmark approval and local history also passed on the new package. [Hosted rerun](qa/evidence/web-0.3.1.json) · [Chrome regression](qa/evidence/chrome-0.3.1.json)

The [public 0.3.1 candidate](https://github.com/AmirmLotfy/roaclaw-growth-os/releases/tag/v0.3.1-rc.1) points to `a88489770e754bdb0f8f6208be788769b0b09720`. The public GitHub ZIP matches Firebase Hosting byte for byte with SHA-256 `2a0cfab9d2468732343d87dce64ace0d99ba45c78b4cd1114d6812d2835df6ca`. The final hosted Preflight replay passed on this deployment. [CI](https://github.com/AmirmLotfy/roaclaw-growth-os/actions/runs/45023603268)

## Production App Check and Chrome Growth Audit retest

On 22 November 2026, reCAPTCHA Enterprise validated a token from the deployed app at risk score 0.3 while Firebase App Check required 0.5. The production web app's cutoff is now 0.3. Control-plane readback confirmed AI Logic App Check enforcement, billing disabled, the original domain-scoped standard key and the one-hour token lifetime. A subsequent headless assessment scored 0.1 and the headless browser remained blocked. [Configuration readback](qa/evidence/app-check-repair/config.json) · [Headless assessment](qa/evidence/app-check-repair/headless-assessment.json)

**Hosted Growth Audit PASS with intermittent attestation.** A separate isolated Chrome 158 window obtained HTTP 200 from production attestation and Firebase AI Logic. The review request carried `X-Firebase-AppCheck`. The browser displayed `Page · On device` and `Review · In cloud`, exported nonempty review commentary, and restored the audit after reload. The walkthrough also verified offline sync with zero AI calls, the three fixture scenarios, workspace switching, the follow-up check, tagged notes, Agent lookup, and mobile layout. A repeat of the offline-to-online sequence independently hit App Check 403 and used the device-only fallback. [Passing runtime](qa/evidence/app-check-repair/hosted.json) · [Hybrid result](qa/evidence/app-check-repair/hosted-hybrid.png) · [Reconnect retry](qa/evidence/app-check-repair/hosted-reconnect-retry.json)

**Chrome companion PASS twice.** Loaded the hosted 0.3.1 ZIP into a disposable Chrome profile seeded with the downloaded Nano model. The side panel paired and captured the $119 offer and “Add to cart” from the actual demo-store page. Growth Audit detected the advertised $99 discrepancy, produced an attested Firebase cloud review, and restored the review after reload. The runs verified two native bookmark readbacks, declined proposal, search, history, the dashboard handoff, device-only handling outside the demo and pairing revocation. Bookmark and history permissions were pregranted in the disposable test manifests. [Runtime](qa/evidence/app-check-repair/companion.json) · [Hybrid result](qa/evidence/app-check-repair/companion-hybrid.png) · [Chrome receipt](qa/evidence/app-check-repair/companion-receipt.png)

The App Check adjustment took effect without a Hosting redeploy. All 19 web and 14 extension tests passed. The live ZIP matched the candidate checksum and retained optional bookmark and history permissions. The video upload and Devpost submission remain on hold.

## Judge package and branded domain

GitHub detects Apache-2.0 on the public repository, and the license matches the Apache Software Foundation text byte for byte. The rewritten README links the runtime, reproducible setup, test reports, and judge walkthrough. Five browser images document the website, Growth Audit, Campaign Preflight and native Chrome panel. Local PNGs are ready for the Devpost gallery. [Judge walkthrough](submission/JUDGE_GUIDE.md) · [Screenshots](docs/screenshots/README.md) · [Asset notices](THIRD_PARTY_NOTICES.md)

Companion 0.3.2 adds the exact custom HTTPS origin and ships from Firebase Hosting. Type checks, all 19 web tests, 15 extension tests, static build and secret scan passed. The hosted ZIP matched the local build. Chrome replayed pairing, capture, Nano page inspection and an attested Firebase cloud review, verified two persisted bookmarks, and checked cancellation, history and pairing revocation. Two preceding strict cloud checks encountered HTTP 403 and HTTP 500 respectively. The passing run pregranted bookmark and history permissions in its disposable profile. [Hosting readback](qa/evidence/release-0.3.2/hosting.json) · [Chrome replay](qa/evidence/release-0.3.2/companion.json) · [Cloud retries](qa/evidence/release-0.3.2/cloud-retries.json)

Firebase registered `roaclaw.com` for the product and `www.roaclaw.com` as an apex redirect. The reCAPTCHA key now permits the apex. The authoritative nameservers still returned Namecheap parking. This chat’s internal browser control could not connect to Namecheap or YouTube Studio. The owner authorized uploading the reviewed 127-second cut, which still awaits upload. Devpost submission remains on hold. [Domain DNS and cutover checks](docs/09_DEPLOYMENT_AND_RELEASE.md#roaclaw-custom-domain) · [Film and artwork](video/VIDEO_QA_REPORT.md)

After the owner updated Namecheap, both authoritative servers and the Google and Cloudflare recursive resolvers returned the required records. The Namecheap MX records remained present. At 15:50 Cairo on 22 November 2026, Firebase reported `HOST_ACTIVE` and `OWNERSHIP_ACTIVE` for both names. Its managed certificates were still `CERT_VALIDATING` and verified HTTPS handshakes still failed. The Firebase demo URL remains the judge link. Computer Use and the tagged Devpost integration were unavailable in this chat. The final video awaits a YouTube upload, and the Devpost entry was left untouched. [Firebase certificate provisioning](https://firebase.google.com/docs/hosting/custom-domain#wait_for_ssl_certificate_provisioning)

At 15:54 Cairo, the branded homepage, Growth Audit, Campaign Preflight, storefront, and companion ZIP all returned HTTP 200 over verified TLS. The ZIP matched the 0.3.2 release byte for byte. The `www` dashboard URL returned HTTP 301 to the same path on the apex. Both authoritative servers still had the SPF and Firebase ownership TXT records. The earlier Google site-verification TXT was absent. [Branded HTTPS readback](qa/evidence/release-0.3.2/branded-https.json)

YouTube Studio in the internal browser published the verified 127-second final cut on Frameless. The custom thumbnail and timed English captions were saved. YouTube's initial checks found no issues. The public player played at 1080p with English subtitles listed, and unauthenticated oEmbed returned the title and channel. Subscriber notifications were left off for this upload. Devpost was left untouched. [Public video](https://youtu.be/V-a7CwUjY1U) · [Video evidence](qa/evidence/video/campaign-preflight-film.json)

The branded Chrome smoke initially rejected pairing in a reused Nano profile. A fresh profile accepted the exact branded sender, and excluding stale workers and extension caches from the Nano profile clone restored the full browser test without changing the release package. The branded demo passed Nano extraction, a separate attested Firebase review, two bookmark readbacks, cancellation, history and sign-out isolation. Both the App Check exchange and the cloud generation returned HTTP 200. The QA copy pregranted optional bookmark and history permissions. [Branded Chrome run](qa/evidence/release-0.3.2/branded-companion.json)

The final YouTube metadata uses a task-led title, branded product links, 13 topic tags and the Science & Technology category. All seven chapters were checked against the final edit and verified on the public watch page. Studio readback confirmed public visibility, embedding, AI-use disclosure and the existing custom thumbnail. The separate Devpost cover remains ready for the held submission. [Published metadata](video/YOUTUBE_METADATA.md) · [Public video](https://youtu.be/V-a7CwUjY1U)

## Devpost draft verified

On 23 November 2026 in Cairo, the existing ROACLAW Growth Audit entry showed **Draft, 4/5 steps done**. The authenticated Devpost readback confirmed the final public YouTube URL, branded website and no contest submission timestamp. The four captioned gallery images loaded after a fresh navigation, and the overview displayed the uploaded 1800 × 1200 cover at 333 × 222. The additional-info form retained the confirmed Individual, Egypt, N/A, 11-22-26 and New answers, Web (Chrome), the technology explanation, no-credentials testing instructions, hosted app and Apache-2.0 license URLs, and the three confirmed eligibility answers. The final rules agreement remained unchecked. [Authenticated draft](https://devpost.com/submit-to/31808-buildhybridai-2026/manage/submissions/1315736-roaclaw-growth-audit/finalization) · [Official rules](https://firebasehybridaihackathon.devpost.com/rules)

The owner requested final submission and checked the rules agreement in Devpost. At **00:09:51 Cairo on 23 November 2026**, Devpost accepted the entry and displayed “Project submitted!” and “Submitted to #BuildHybridAI 2026.” The independent authenticated readback gave `submitted_at` as `2026-11-22T17:09:51.715-05:00`. The public page returned HTTP 200 and included the project name, contest and final video. [Submitted project](https://devpost.com/software/roaclaw-o1637x)

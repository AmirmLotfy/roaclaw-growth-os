# ROACLAW evidence index

Last checked 22 November 2026. The Firebase verification gate, hosted Growth Audit, and connected Chrome workflow passed. The browser measurements use Chrome 158.0.8127.37 and Firebase JavaScript SDK 13.4.0. The standalone inference probe used a loopback origin. The app and extension runs used the public Firebase Hosting origin.

| ID | Status | What was observed |
|---|---|---|
| H-01 | PASS | Firebase reported `on_device` and returned the exact $119 and “Add to cart” fixture. Chrome showed the Gemini Nano 4 GPU component `2026.11.3.1140` ready. [SDK result](evidence/g0/after-storage/01-local-only.png) · [Model broker](evidence/g0/after-storage/05-chrome-model.png) |
| H-02 | PASS | `ONLY_IN_CLOUD` returned SDK `in_cloud` using Gemini 3.5 Flash-Lite. Exact fixture fields were $119 and “Add to cart.” [Cloud result](evidence/g0/03-cloud.png) |
| H-03 | PASS | `ONLY_ON_DEVICE` failed explicitly when the model was unavailable. The browser page made zero external requests during the check. [Redacted network summary](evidence/g0/runtime.json) |
| H-04 | PASS | An explicitly consented `PREFER_ON_DEVICE` request returned SDK `in_cloud` on the same device with no available local model. [Fallback result](evidence/g0/04-hybrid-preferred.png) |
| H-05 | PASS | The hosted open-tab path returned its on-device result offline, attempted zero cloud or App Check calls during that audit, and synced on reconnect. An independent local-only call also returned `on_device` and the exact fixture while the browser context was offline. The verifier observed `navigator.onLine=false` and zero external page requests. [Offline result](evidence/g0/after-storage/02-local-offline.png) · [Full retest](evidence/g0/after-storage/runtime.json) · [Hosted offline audit](evidence/web/08-offline-app.png) |
| A-01 through A-05 | PASS | Fresh hosted anonymous session, persisted and restored audit, workspace changes without previous findings, exact fixture checks, clear observation/interpretation labels. Firestore cross-UID rules passed in the emulator. [Hosted run](evidence/web/runtime.json) · [Rule checks](backend/README.md) |
| P-01 | PASS | From the deployed homepage, entered an operator-authored test brief, paired Chrome, captured a live public product page, and returned to the correct tab. The report flagged $24.95 versus the selected $29.95 after reviewing ambiguous prices, verified the CTA, copied the corrected URL, and exported HTML. Firebase reported on-device inspection. The Preflight tab made zero AI, App Check, Auth or Firestore requests. [Runtime report](evidence/preflight-0.3.1.json) |
| X-05 | PASS | The hosted browser saved a scheduled follow-up and executed an independent request for the synthetic storefront once due. Execution is browser-triggered. [Completed check](evidence/web/03-followup-recheck.png) |
| X-01 through X-04 | PASS | Live Chrome paired and captured the rendered fixture. Two approved bookmarks persisted, a declined proposal produced no bookmark, and two search results matched. The dashboard ingested the receipt and restored it after reload. The expanded run also verified history results, device-only handling for a non-demo capture, and scoped pairing revocation. The expanded run pregranted test-only Chrome permissions; the release package keeps these optional. [Connected Chrome report](evidence/g3-web/runtime.json) · [Receipt](evidence/g3-web/06-web-receipt.png) |
| V-01 | BLOCKED | The Firebase Web Live SDK does not send the required App Check attestation on the Live transport. [Voice investigation](backend/live-voice.md) · [Hosted rejection trace](evidence/live/transport.json) |
| V-02 | PASS | Asked for the audit price finding through Agent text lookup in hosted Chrome. [Text lookup](evidence/web/05-text-lookup.png) |
| D-01 and D-02 | PASS FOR TESTED STATES | Checked the homepage and dashboard at desktop and mobile sizes, paired extension content at 360 and 420 CSS pixels, keyboard access to the site skip link, and reduced-motion behavior. Axe reported zero WCAG A/AA-tagged violations in the 13 scanned views. [Hosted browser](evidence/web/runtime.json) · [Axe and dimension report](evidence/accessibility/runtime.json) |
| S-01 | PASS | Staged Gitleaks and a five-commit release-history scan returned zero findings. Build artifacts, browser profiles, and local credentials are ignored by Git. |
| S-03 | PASS | Verified the public marketing site, direct Growth Audit route, fresh demo onboarding, production App Check exchange HTTP 200, and a separate attested cloud review HTTP 200. [Website](https://roaclaw-growth-os-2026.web.app/) · [Dashboard](https://roaclaw-growth-os-2026.web.app/app/) · [Latest browser run](evidence/app-check-repair/hosted.json) |
| S-02 | PASS | Public Apache 2.0 repository with versioned package, judge walkthrough, and screenshots. GitHub Actions checks the export from a clean checkout. [Releases](https://github.com/AmirmLotfy/roaclaw-growth-os/releases) · [CI](https://github.com/AmirmLotfy/roaclaw-growth-os/actions/workflows/check.yml) |
| S-04 | PASS | YouTube Studio published the 127.019-second master with the custom thumbnail and uploaded English captions. The public watch page played at 1080p and listed the English track. An unauthenticated oEmbed request returned the correct title and channel. [Public video](https://youtu.be/V-a7CwUjY1U) · [Video QA](../video/VIDEO_QA_REPORT.md) · [Film report](evidence/video/campaign-preflight-film.json) |
| S-05 | SUBMITTED | Devpost confirmed the entry and displayed it under #BuildHybridAI 2026. The authenticated timestamp is 23 November 2026 at 00:09:51 Cairo. The project page returned HTTP 200 and includes the verified public video. [Submitted project](https://devpost.com/software/roaclaw-o1637x) |

The probe's type check and Vite production build passed. The final local-only verifier exited successfully. Earlier cloud and App Check tests remain separately recorded. Git and Firebase CLI setup are recorded in the [worklog](../WORKLOG.md).

Firebase's control plane returned `ENFORCED` for the AI Logic App Check service. A real debug exchange succeeded with HTTP 200, and generation without the attestation header returned HTTP 401. The redacted browser report records header presence and response statuses. The production hosted browser also completed reCAPTCHA Enterprise attestation and cloud generation with HTTP 200. [App Check service readback](evidence/g0/app-check.json) · [Rejected request](evidence/g0/06-app-check-enforced.png)

## Expanded hosted scope

The verified build has a standalone marketing route and three runnable audit scenarios. The browser test opened the demo from the marketing site, downloaded the extension ZIP, downloaded and parsed the audit JSON, ran the dental and retail audits, found tagged research notes after a reload, and reran the completed follow-up without a duplicate. [Hosted run](evidence/web/runtime.json) · [Mobile site](evidence/web/00-website-mobile.png) · [Lead-generation audit](evidence/web/06-lead-audit.png)


## Premium candidate verification

The redesigned site passed keyboard proof tabs, desktop and mobile sizing, and source links to the real audit and extension ZIP. The hosted audit passed device-only, hybrid, offline and reconnect, all three workspace scenarios, export, tagged notes, text lookup, and the due fixture check. The extension passed Inspect, Actions, and Research interactions, scoped history, bookmark verification, real Chrome persistence, and pairing revocation. The source-grounding tests distinguish a model-confirmed field from a single literal supported by captured evidence and reject conflicting amounts.

[Hosted report](evidence/web/runtime.json) · [Chrome report](evidence/g3-web/runtime.json) · [Accessibility report](evidence/accessibility/runtime.json)

The Chrome 0.2.1 hotfix preserves the normal dashboard handoff on older Chrome. The ninth extension unit check models a browser without the later `URL.canParse` API. The fresh Chrome 158 run verified the dashboard handoff, approved capture, two persisted bookmarks, declined proposal, local history and pairing revocation. [Compatibility retest](evidence/chrome-0.2.1.json)

The final hosted audit passed with Firestore's gRPC dependency patched to 1.13.7. The production workspace dependency scan returned zero known advisories. [Hosted rerun](evidence/web-0.2.1.json)

The 0.3.1 Growth Audit rerun verified on-device extraction, offline sync, all three scenarios, and report export. The reCAPTCHA Enterprise exchange returned 403 on the hybrid call. Growth Audit correctly used Nano only, displayed the App Check result, and made no cloud generation request on that run. The Chrome extension separately passed capture, approval, two persisted bookmark readbacks, cancellation and history search. [Hosted recovery run](evidence/web-0.3.1.json) · [Chrome regression](evidence/chrome-0.3.1.json)

## App Check repair and full Growth Audit rerun

| Check | Status | Evidence |
|---|---|---|
| Production App Check registration | PASS | A valid token scored 0.3. The cutoff changed from 0.5 to 0.3 and Firebase AI Logic enforcement remained active. A later headless assessment scored 0.1 and still encountered a 403. [Configuration](evidence/app-check-repair/config.json) · [Headless assessment](evidence/app-check-repair/headless-assessment.json) |
| Live hybrid Growth Audit | PASS | Isolated Chrome observed a real HTTP 200 on the token exchange and on the Firebase cloud review, which carried the attestation header. The export confirmed device extraction, cloud review, and nonempty commentary. Offline audit with zero AI requests, reconnect sync, all three workspaces, reload, and the follow-up also passed. A separate direct hybrid run passed and provided the screenshot. [Runtime](evidence/app-check-repair/hosted.json) · [Direct hybrid run](evidence/app-check-repair/hosted-hybrid-confirmation.json) · [Hybrid result](evidence/app-check-repair/hosted-hybrid.png) |
| Repeated cloud audit after reconnect | INTERMITTENT | A repeat of the same offline-to-online sequence in isolated Chrome received HTTP 403 and returned a device-only result. [Reconnect retry](evidence/app-check-repair/hosted-reconnect-retry.json) |
| Chrome companion with live cloud review | PASS | The hosted 0.3.1 ZIP captured the storefront via the Chrome side panel. Nano inspected the capture and a separate attested Firebase generation returned the review. Two approved bookmarks persisted, and cancellation, local search, history, the dashboard's receipt after reload, private capture, and revocation passed. The disposable profile pregranted optional bookmark and history permissions. [Runtime](evidence/app-check-repair/companion.json) · [Hybrid result](evidence/app-check-repair/companion-hybrid.png) · [Chrome receipt](evidence/app-check-repair/companion-receipt.png) |

Run these checks from the repository root after preparing the Nano profile described in the [inference probe setup](../tools/hybrid-proof/README.md). The scripts use isolated Chrome QA profiles and require a real production cloud response.

```sh
ROACLAW_QA_MINIMIZED=1 ROACLAW_HOSTED_EVIDENCE=.local/app-check-repair/hosted-isolated \
  node qa/e2e/hosted.mjs
ROACLAW_QA_MINIMIZED=1 node apps/extension/test/smoke.mjs \
  https://roaclaw-growth-os-2026.web.app/app/ --hosted-zip --with-nano \
  --web-flow --require-cloud-review --history --pregrant-test-permissions \
  --evidence-dir .local/app-check-repair/companion-isolated
```

## 0.3.2 package and judge assets

- **PASS.** The homepage, Growth Audit, Campaign Preflight, demo store and updated ZIP returned HTTP 200. The ZIP matched the production build. [Hosting evidence](evidence/release-0.3.2/hosting.json)
- **PASS with intermittent cloud failures.** Chrome paired with the hosted 0.3.2 ZIP, captured the storefront, observed Nano and real attested Firebase cloud review, and verified two bookmark readbacks and persistence. Two preceding cloud checks returned App Check HTTP 403 or Firebase AI Logic HTTP 500. The complete run pregranted optional permissions in the disposable profile. [Passing run](evidence/release-0.3.2/companion.json) · [Earlier retries](evidence/release-0.3.2/cloud-retries.json)
- **PASS.** Five product screenshots with captions and test links, judge walkthrough, Apache-2.0 repository license and asset provenance. [Screenshots](../docs/screenshots/README.md) · [Judge walkthrough](../submission/JUDGE_GUIDE.md) · [License](../LICENSE)
- **PASS.** The branded homepage, dashboard, Campaign Preflight, demo storefront and matching companion ZIP returned HTTP 200 over verified TLS. The `www` alias returned a permanent redirect preserving the dashboard path. [Branded HTTPS](evidence/release-0.3.2/branded-https.json) · [App Check key readback](evidence/release-0.3.2/app-check-domains.json)
- **PASS.** With the active companion package loaded in a QA profile that excluded stale extension caches, the branded dashboard paired, attached the approved capture, extracted the page on-device, received an attested Firebase cloud review, and verified bookmark persistence, history, cancellation and sign-out revocation. Bookmark and history permissions were pregranted only in the disposable test copy. [Branded Chrome run](evidence/release-0.3.2/branded-companion.json)

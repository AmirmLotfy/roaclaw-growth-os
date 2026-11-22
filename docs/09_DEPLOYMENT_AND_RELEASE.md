# Deployment, repository and judge-access plan

## Firebase account setup
1. Identify the exact user-selected Firebase project through Firebase CLI/MCP, confirm project ID and billing before modifications. Do not infer project from the default account.
2. Check Firebase AI Logic enabled, provider selected, App Check policy, authorized domains and Cloud Firestore region rules. Use minimal configuration; no speculative paid service without owner approval.
3. Install official Firebase Agent Skills in Codex if absent, using verified instructions and Firebase MCP when available.
4. Bootstrap Firebase Auth, Firestore emulator rules, App Check, cloud function secret management, deployment staging.
5. Validate supported Chrome local model in real execution environment before designing entire app around it.

## Hosting
Prefer Firebase App Hosting for Next.js if the project supports it; otherwise choose an explicitly supported Firebase Hosting deployment or Vercel front end with Firebase backend and verified App Check. Document why chosen. Host an authentic demo fixture landing page under the same controlled project domain, so extension capture can be reproduced.

### ROACLAW custom domain

Firebase Hosting has registered `roaclaw.com` to serve ROACLAW and `www.roaclaw.com` to redirect to the apex. The public Firebase origin stays available for the demo. The production reCAPTCHA Enterprise key permits the branded domain alongside the two Firebase defaults. Companion 0.3.2 adds the exact HTTPS apex origin and keeps the same extension ID and permission model.

The Firebase API returned these required changes for Namecheap Advanced DNS on 22 November 2026.

| Host | Type | Value | Change |
|---|---|---|---|
| `@` | A | `199.36.158.100` | Replace the parking address or the URL redirect rule that produces it. |
| `@` | TXT | `hosting-site=roaclaw-growth-os-2026` | Add alongside the existing TXT records. |
| `www` | CNAME | `roaclaw-growth-os-2026.web.app` | Replace the Namecheap parking CNAME. |

Namecheap continues to serve the existing MX, SPF and nameserver records. The earlier Google site-verification TXT was absent at readback. The branded homepage and demo now serve valid HTTPS. The `www` alias redirects to the apex and preserves the path. The branded dashboard passed anonymous sign-in, attested cloud review and extension capture. The judge guide includes a verified Firebase fallback. [Branded HTTPS checks](../qa/evidence/release-0.3.2/branded-https.json) · [Chrome run](../qa/evidence/release-0.3.2/branded-companion.json) · [Firebase Hosting custom domains](https://firebase.google.com/docs/hosting/custom-domain)

## Judge access
- Demo workspace seeded with synthetic values and visible `DEMO DATA` label; no real ad credentials.
- If auth required, use a short-lived dedicated judge demo credential distributed via permitted Devpost testing-instructions field, not public README; consider a self-serve demo where Firestore rules still protect data.
- Publish extension ZIP release or install steps. List Chrome version, flags, Nano supported hardware, first download and optional bookmark permissions. Distinguish what works without extension.
- Test fresh Chrome profile, browser reload, disabled extensions, and a judge account with no developer CLI.

## Public repository
- Public source on GitHub/GitLab with Apache-2.0 license (preferred by competition). Set repository metadata/About license if hosting provider supports it.
- README first fold: product claim, real 30s demo GIF/image, links, how hybrid works, quick demo, installation, feature status, license.
- Architecture, `.env.example`, security and data policy, privacy, source/asset provenance, tests and known limitations.
- Disclose pre-existing concepts/code/assets if reused; hackathon rules require summary of what was built during submission period.
- CI: typecheck, lint, unit tests, Firestore rules tests, build, dependency scan, secret scan; required checks. Publish a tag for final submission, e.g. `hackathon-2026-final`, and freeze it before deadline.
- Never include private tokens, App Check debug tokens, service account key, video asset without proper license or real customer records.

## Extension publishing
Chrome Web Store review is not reliable before deadline; create an installable unpacked build and documented judge path. A ZIP may be a release asset, but demonstrate unpack/load in Chrome correctly. Only claim store publication if actual listing live.

## Production readiness versus judging readiness
Judging: public reproducible demo and honest limitations. Production later: OAuth app reviews, legal privacy policy, retention, scale, billing, authorization, monitoring, incident plan and store distribution. Do not represent judging build as production-certified.

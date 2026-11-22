# ROACLAW — The Growth Agent That Shows Its Work

> This file is a README template for the public implementation repo. Replace bracketed fields and remove unimplemented claims.

[REAL screenshot of SaaS Growth Audit, with synthetic-data badge]

ROACLAW connects browser context, campaign objectives and verified action history. Its flagship Growth Audit identifies evidence-backed discrepancies, proposes reviewable fixes, and keeps a record of what was actually done.

**Live demo:** [URL] · **Chrome extension:** [LOAD INSTRUCTIONS] · **3-minute video:** [PUBLIC YOUTUBE URL] · **Devpost:** [URL]

## What works today
| Feature | Status | How to test |
|---|---|---|
| Chrome page inspection | [VERIFIED] | [STEPS] |
| Firebase Nano on-device | [VERIFIED] | [CHROME VERSION, FLAGS, DEVICE] |
| Cloud analysis | [VERIFIED] | [STEPS] |
| Synthetic Growth Audit | [VERIFIED] | [STEPS] |
| Human-approved bookmark action | [VERIFIED] | [STEPS] |
| Live voice | [VERIFIED / DEMO ONLY / NOT AVAILABLE] | [STEPS] |
| Scheduled follow-up | [VERIFIED / DEMO ONLY] | [STEPS] |
| Meta/Google Ads/Shopify integration | [NOT IMPLEMENTED / PARTIAL / VERIFIED] | [STEPS] |

## Demo data
All public sample accounts, spend/revenue figures, campaigns and pages are fictional, clearly labeled as demo fixtures. No actual advertising account is modified by the public demonstration.

## Hybrid inference architecture
Explain actual Firebase SDK methods, `PREFER_ON_DEVICE` vs `ONLY_ON_DEVICE`, cloud model, `inferenceSource`, Chrome hardware/flag requirements, on-device limitations, App Check and privacy selection. Show sequence diagram built from actual project wiring.

## Installation and configuration
Prereqs (Node/pnpm, Firebase project, Chrome version, flags), Firebase setup, `.env.example` field descriptions, emulator startup, web/extension build, deployment. Do not include secrets or debug tokens. Explain how to load unpacked extension.

## Security and privacy
Tenant isolation, optional browser permissions, scoped capture, local-only vs cloud, action approvals, retention, limitations. Never use uncontrolled browser automation against advertising platforms.

## Testing
Provide verified commands and actual test results; include screenshots of web + extension, inference-source debug proof, action receipt and browser QA.

## Known limitations
Current integration scopes, hardware support, Live API Preview constraints, authentication/judge steps, operating assumptions, scheduling availability when browser is closed.

## Built for
Google Firebase #BuildHybridAI 2026 · Web/Chrome category. Reproducible testing instructions. Date-bounded submission development and pre-existing work disclosures.

## License and provenance
Apache License 2.0, real file in repo. Fonts, icons, generated audio and other third-party assets listed with license and usage restrictions. This README is documentation; trademark rights are not automatically granted by code license.

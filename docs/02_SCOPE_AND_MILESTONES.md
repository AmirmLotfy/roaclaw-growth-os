# Execution scope and milestones

## Submission MVP — must be working
- Public login or secure demo-access path; seeded workspace switch; real Firestore reads/writes; per-workspace isolation.
- Real Firebase AI Logic call producing a structured on-device page analysis via Nano 4 with observed `inferenceSource=ON_DEVICE`, plus a cloud call and observed mode.
- Hybrid preference flow and handling when local model is unavailable, plus local-only flow which never sends sensitive text to cloud.
- Chrome extension side panel, permission-scoped current-page extraction, working bookmark creation and search, and seamless handoff to the SaaS.
- Campaign/funnel Growth Audit with facts/evidence/hypotheses, approved action plan, action execution, action log, and a scheduled task that later runs or can be triggered/tested deterministically.
- Real responsive design and strong empty/loading/error states; English interface; keyboard and focus support.
- At least one working verbal live interaction if Live preview, browser microphone and Firebase auth/App Check permit; fallback is accessible text input.
- Deploy, README, Apache-2.0 license, real screenshots, public <=3 min YouTube video, real Devpost entry.

## Deferred but intentionally designed
- Meta Ads, Google Ads, Shopify APIs via authorized OAuth; real ad publishing with explicit approval; deeper competitor intelligence; full reports; Stripe; organization invites; Arabic RTL everywhere; production background browser.

## Timeline (date-aware, aggressively parallel where safe)
| Date | Objective | Quality gate |
|---|---|---|
| Nov 22 | Repo/tool discovery; Firebase proof; flags/App Check experiment | Actual Nano response and recorded source |
| Nov 23 | Monorepo; Auth, Firestore schema/rules, public demo seed | Isolated demo workspaces pass security tests |
| Nov 24 | Audit schemas/engine; page analyzer; sourced findings | Deterministic end-to-end audit |
| Nov 25 | Chrome MV3 extension; one real action; search | Browser action can be approved and reversed |
| Nov 26 | Agent flow; task ledger/scheduler; Live if viable | Action log and scheduled check |
| Nov 27 | UI polish, source-based design research, performance and accessibility | All core screens real and navigable |
| Nov 28 | Security, visual & integration QA, deploy, record raw demo footage | Public judge demo works without developer laptop |
| Nov 29 | Remotion edit, VO/audio, public GitHub, YouTube upload | Video processed, public, playable, <=180 seconds |
| Nov 30 | Audit against every requirement, finalize Devpost early | Confirmed submission URL before cutoff |

## Gate-based cuts
**G0 at-risk:** if local Firebase inference fails, STOP feature expansion; investigate Chrome version, flags, SDK, secure origin, App Check, hardware/model eligibility, official docs. Never create a falsely labeled local route.
**G2 at-risk:** cut extended dashboard modules before cutting the end-to-end audit.
**G3 at-risk:** keep one correct browser action and explicit approval; cut fancy agents.
**Voice at-risk:** use robust text fallback; still attempt Live preview in one supported surface.
**Ad API access unavailable:** show a test connector interface and synthetic fixture clearly; no fake tokens/live claims.
**Deadline at-risk:** prioritize public repo, video, app access and Devpost over additional product features.

## MVP definition of done
A new judge can open the provided web URL, view synthetic business data, optionally load the extension, run the core audit, verify an on-device AI call and a separate cloud analysis, approve a bookmark action, see a completed work log, and understand the technical proof via a clear <=3 min video. Where hardware/flags limit direct recreation, the video and honest instructions explain the tested environment.

# Component inventory and copy standards

## Must-build components
- AppShell with collapseable left rail, top workspace switcher, compact context breadcrumb and work queue.
- MetricStrip (data + source + period + currency); no empty placeholder trend badges.
- ClientSwitcher with search and state isolation.
- InsightRow with Severity, Evidence, Source, Last checked, Hypothesis, Proposed action.
- FindingDrawer with exact page snippet / source data and 'not independently verified' where applicable.
- DiffApprovalCard with before / proposed / permitted tool / affected workspace / confirm / cancel.
- ActionReceipt with status `proposed`, `awaiting_approval`, `executing`, `succeeded`, `failed`, `canceled`, `partially_complete`.
- AIInferenceBadge with observed mode; never manual-select ON_DEVICE when cloud actually responded.
- CommandDock with typed instructions and visible tool progress.
- VoicePanel with mic permission, connection state, transcript, interrupt/cancel and text fallback.
- ResearchTable with URL, saved date, source, workspace, tags and search context.
- SchedulerEditor with frequency, timezone, next run, limits and notification policy.
- ConnectorCard status `connected`, `demo`, `expired`, `requires_review`, `unavailable`.
- SidePanelContext current URL domain, paired workspace, permissions, not a full dashboard.

## Priority page map
1. Landing: one proposition, one authentic product image/video, 3 proof points, how it works, hybrid AI/privacy explanation, demo CTA.
2. Onboarding: user signs in, picks owner/agency role, selects or creates workspace, chooses demo vs real sources.
3. Overview: source-contextual metrics and 'Needs review' list, not generic charts.
4. Growth Audit: high-impact signature experience; clear phases `Capture / Analyze / Review / Act / Monitor`.
5. Agent: activity-led UI with evidence and approval rather than friendly bubble history.
6. Extension: selected page context -> audit trigger -> one safe approval -> receipt; research/bookmark tab.
7. Settings: local-only toggle, data deletion, per-site permissions, transcript management.

## Exact sample copy
- Hero: `Know what happens between the click and the conversion.`
- Supporting: `ROACLAW brings ad data, landing pages and the work that follows into one accountable place.`
- CTA: `Open demo workspace`
- Audit title: `Growth Audit`
- Audit description: `Review the evidence before changing a campaign.`
- Finding title: `The campaign advertises $99. The page shows $119.`
- Source info: `Observed in demo campaign brief and selected product page, 22 Nov 2026.`
- Hypothesis: `This discrepancy could confuse visitors. Effect on conversion is not established.`
- Action: `Prepare a corrected destination link`
- Approval: `Review proposed changes`
- Empty: `No audits yet. Inspect the current page to begin.`
- Local status: `Processed on this device` (only if SDK confirms)
- Cloud status: `Processed in cloud` (only if SDK confirms)
- Blocker: `Local model unavailable. This document has not been sent to the cloud.`
- Synthetic-data banner: `Demo workspace · all commercial figures are illustrative`

## Avoid copy
`Unleash`, `supercharge`, `revolutionize`, `seamlessly`, `AI-powered magic`, `10x growth`, `effortless`, `game-changing`, `all-in-one powerhouse`, `your new genius friend`, `perfect ROAS`, `boost results overnight`.

## Functional wording requirement
Every success toast names the completed action and verification: `Saved bookmark under Sable & Stem / Research` not `Success!` Every failure shows retry/rollback. A pending schedule says `Check scheduled` rather than `Monitoring completed`.

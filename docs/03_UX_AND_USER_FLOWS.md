# User experience and functional flows

## Two surfaces, one identity
**Web dashboard** is the management and analysis surface: set context, view metrics, run audits, review tasks, invite later. **Chrome side panel** is the contextual browser assistant: capture current page with permission, search saved research, initiate audit, execute approved bookmark/tab actions and converse via text/voice. They synchronize via authenticated, scoped records and short-lived handoffs; do not trust arbitrary postMessage payloads.

## Web information architecture
- Overview: active workspace, status, objective, key numbers with provenance, top action queue, activity, recent audits.
- Audits: history, new audit wizard, source evidence, findings, confidence, proposed fixes, approval/execution.
- Campaigns: read-only fixture list and attribution context; clearly distinguish mock/connected states.
- Clients: organization/workspace list, labels, sources, team roles, campaign objectives and guardrails.
- Agent: compact work transcript, active tool call state, evidence drawer, human approvals; do not mimic generic chatbot layout.
- Memory: research items, saved pages, bookmarks, user notes, tags, search and provenance.
- Automations: monitoring jobs, schedule, next run, triggers, limits, owner, last event, pause/resume.
- Settings: profile, organization, data/privacy, extension pairing, integrations, inference preferences, notifications.

## Primary flow: Growth Leak Audit
1. User selects workspace -> page or campaign -> goal metric. Selection required when ambiguous.
2. Extension explicitly asks to read selected page using `activeTab`/host permission; extracts title, URL, visible headings, CTAs, canonical, links, visible prices and user-approved screenshot if supported. Sanitize scripts, credentials, hidden inputs, long arbitrary text.
3. On supported Chrome, Firebase AI Logic performs local one-turn structured extraction from relevant text/selected image. Show observed inference source. If local is not available, inform user before cloud fallback; if privacy mode ON, fail and keep data local.
4. Fetch scoped campaign fixtures or verified connector metrics (dates/currency timezone labeled). Cloud Gemini proposes evidence-ranked findings with impact class, factual basis, hypotheses, and missing checks. Schema-validate; don't claim actual tracking diagnosis from page HTML alone.
5. User sees a *two-column review*: finding/evidence left, proposed action/impact/approval right. Can open the source, reject a false positive, edit the proposed change or approve a safe action.
6. Action runner validates allowed tool and target, asks for explicit approval, executes, re-reads final state, records actual receipt/URL/time, shows result and rollback where applicable.
7. Create follow-up task: schedule, expected result, notification, next run, idempotency. Dashboard logs show status `scheduled`, not `completed` until execution.

## Secondary flows
**Agency workspace:** switch from Northline > Client A to Client B; prior client's data must disappear immediately and no retrieval/action crosses boundaries.
**Bookmark memory:** user asks 'Find the pricing research saved for Sable & Stem last week'; search scoped items and optional bookmark metadata, return result with original URL/date/why it matches, offer create/move action with confirmation.
**Ecommerce store:** select Sable & Stem, inspect product page, explain offer mismatch vs available campaign fixture, propose a corrected destination URL and actionable checklist.
**SMB lead-gen:** show hypothetical lead-to-booking funnel; flag objective/landing CTA mismatch, not unsupported conversion quality conclusions.
**Voice:** user starts microphone -> permission -> real connected status -> natural interruptible conversation -> spoken action proposal -> visual approval -> execution. Audio never plays on its own without user request.

## Explicit visual and interaction states
For every feature include: initial, loading/skeleton, empty with real action, error with recovery, permission denied, data stale, offline/local-only, active, success with receipt, canceled, partial execution. Distinguish sample fixture from connected account in all surfaces.

## Prototype dimensions
Dashboard desktop baseline 1440x900, laptop 1280x800, responsive narrow 390x844. Extension 360x740 and 420x850. Use a constrained content grid rather than infinite wide cards; content density should remain professional.

## Accessibility
Tab/shift-tab, escape, focus rings, clear control names, 44px target where applicable, contrast >= WCAG AA, non-color status labels, native focus management in modal/drawer, reduced motion, subtitles for video. Test Arabic punctuation/RTL for supported voice transcripts without promising complete Arabic UI.

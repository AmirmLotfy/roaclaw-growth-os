# Firestore data, tenancy, privacy and security contract

## Identity and tenancy
- `users/{uid}`: profile, locale, preferences, privacy defaults.
- `organizations/{orgId}`: name, owner, planMode (demo/prod), createdAt.
- `organizations/{orgId}/members/{uid}`: role `owner|admin|analyst|viewer`, status, joinedAt.
- `organizations/{orgId}/workspaces/{wsId}`: business/client profile, goals, currency, timezone, data source status, brand constraints.
- `.../workspaces/{wsId}/campaigns/{id}`: normalized campaigns and source references, never secrets.
- `.../workspaces/{wsId}/metricSnapshots/{id}`: source, period, currency, data freshness, metrics; immutable after ingestion.
- `.../workspaces/{wsId}/audits/{auditId}`: source, evidence refs, inference mode, findings, timestamps.
- `.../workspaces/{wsId}/researchItems/{id}`: URL/title/notes/tags, consent metadata, data retention.
- `.../workspaces/{wsId}/actionProposals/{id}`: tool, target, diff, risk, expiration, initiator and status.
- `.../workspaces/{wsId}/actionEvents/{id}`: append-only execution receipt, approver, timestamp, result, error.
- `.../workspaces/{wsId}/automations/{id}`: rule, schedule TZ, next run, last run, lease, max changes, notification.
- `.../workspaces/{wsId}/connectorStates/{id}`: status/scope/lastSynced, NO plaintext OAuth token.

## Security invariants
- Every read/write checks `auth.uid` membership in the exact parent organization and workspace; role guards apply separately to propose/approve/execute.
- Use hierarchical Firestore paths with inherited parents rather than an easily forgotten `tenantId` filter. Firestore rules are **not** automatic row filtering; enforce query constraints or server-authorized access.
- A viewer cannot approve actions; an analyst can propose but not publish financial changes; only permitted roles approve based on risk and connector authorization.
- Guard webhook and function HTTP endpoints with verified ID tokens, App Check where applicable, input validation, rate limits and replay protection. Scheduled functions use trusted server service identity.
- Provider OAuth tokens are encrypted/sealed in managed secret storage; do not embed in browser extension or publicly accessible Firestore.
- Browser history/bookmarks permissions opt-in; URL/title metadata are sensitive. Don't index full browsing history or submit to cloud without clear consent.
- Do not collect payment cards, credentials, private inbox contents or private ad platforms by default. Never store user microphone audio without opt-in; transcripts have deletion and retention controls.
- Never put real customer data into public screenshots, fixtures, demo video, or README.

## Action safety states
`draft -> proposed -> awaiting_approval -> approved -> executing -> succeeded | failed | canceled | partial`.
- Each action has unique ID, idempotency key, tool allowlist, explicit target, before-state/patch, allowlisted fields, scope, expiry, actor, and approval receipt.
- Side effects with money, public content, campaign publishing or sending messages require explicit confirmation and account permission. Hard-stop for protected or prohibited automation; no browser clicking workaround.
- Successful action requires a verified postcondition (e.g. bookmark exists or API readback matches).
- Provide rollback or compensating action where supported; never claim rollback is universally guaranteed.

## Privacy preferences
`Local only`: remote data transmission of selected page text/image blocked; if Nano unavailable, show explicit error and stop. `Hybrid with confirmation`: show what will be sent before cloud use on sensitive input. `Cloud allowed`: use only necessary minimal context. Store settings per user and workspace, with stricter workspace setting winning.

## Firestore rules/test requirements
Test owner authorized; analyst read/propose; viewer read only; nonmember denied; org A cannot read org B; child path cross-scope; stale token; deleted member; missing auth; mass read; update immutable fields; action approvals cannot be forged client-side. Use Firebase Emulator Suite test harness and include results in `qa/EVIDENCE_INDEX.md`.

## Data retention
Demo seed synthetic and rebuildable. Browser research default short retention with user controls. Audit and action logs kept per workspace policy; make retention editable after hackathon, never silently index all user browser history.

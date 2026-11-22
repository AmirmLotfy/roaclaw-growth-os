# AGENTS.md — enduring instructions for Codex

## Source of truth
Read `CODEX_MASTER_PROMPT.md` first; then product, engineering, design, QA, video, and submission materials. For Firebase SDK or Devpost changes, verify against `research/OFFICIAL_SOURCES.md` and log changes rather than trusting stale snippets.

## Mission and quality bar
This is a submission-grade working SaaS + Chrome extension, **not** a static redesign. Optimize for a verifiable, secure end-to-end Growth Audit workflow and public judging reproducibility before secondary modules. Implement with clean interfaces, clear errors, actual Firebase logic, and true interaction. Avoid overengineering, fake widgets and speculative integrations.

## Decision boundaries
- You may choose implementation details and write/deploy code when authenticated and authorized.
- Do not spend money, alter a real client's ad spend, publish actual ads, upload personal data, sign legal declarations or disclose passwords without the relevant explicit authorization and access.
- A user-directed Devpost submission and YouTube upload are authorized goals; carry them out when identity/authentication and platform requirements permit, otherwise provide the exact blocker.
- Keep real integrations test-only/read-only until authorizations and approvals are verified.

## Design and content
Use the current charcoal, lime, and paper-green design in `design/DESIGN_LANGUAGE.md`. Mobbin/Refero references must be captured and synthesized, not cloned. Copy is concrete and factual; UI uses semantic labels, strong contrast, nondecorative icons, minimal animation, and no theatrical AI claims.

## Engineering
Typed contracts, data tenancy, structured errors, deterministic fixtures, small reusable components, idempotent jobs, retries/backoff, bounded AI budgets, privacy controls, and no secrets in source. Firebase AI Logic required for every runtime inference call. Keep evidence of local and cloud execution separately.

## Do / verify / record loop
For each feature: implement -> start app -> execute real user path -> test automated assertions -> screenshot/record -> log PASS/FAIL in WORKLOG.md -> merge. Never mark complete because a component renders or a unit test passes in isolation.

## Priority gate
G0 real hybrid inference; G1 auth/tenancy; G2 actual Growth Audit; G3 extension action and approvals; G4 live voice/scheduling; G5 polished demo, security, deploy; G6 video/repo/Devpost. A blocked G0 requires an explicit report and cannot be replaced by a fake demo.

## Final documentation
Maintain `WORKLOG.md`, `qa/EVIDENCE_INDEX.md`, `design/RESEARCH_OUTPUT.md`, changelog, public README, and a limitations table. Build a stable hackathon tag/release before deadline.

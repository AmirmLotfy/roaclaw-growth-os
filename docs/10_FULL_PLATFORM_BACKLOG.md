# Commercial product — complete functional backlog, not hackathon claims

**Classification:** `P0 = hackathon demonstrable`, `P1 = commercial closed beta`, `P2 = later`. A task is not DONE because its future UI is designed. Keep unavailable modules hidden or accurately marked `Coming later`, not clickable fake implementations.

## Workspace, identity and operations
- P0: Organizations, workspaces, business category, objective, currency/timezone, demo data, role guard, activity log.
- P1: Agency clients and client portal, invitations, permission templates, approval chains, organization branding, shared reports, secure credentials/connector vault.
- P2: Multi-agency hierarchy, client billing, contracts, audit exports and administrative policies.

## Ads Hub
- P0: Synthetic cross-channel campaign overview, account/source data provenance, read-only campaign list, UTM preflight.
- P1: Meta and Google Ads OAuth setup, campaign hierarchy mapping, performance metrics over time, goals, quality checks, approved draft changes, bulk approval queue, rule alerts.
- P2: Real campaign creation, creative upload/publishing, spend pacing, experimentation, inventory-aware ads, agency approval workflows, incrementality and cautious attribution. Always official APIs and user permission.

## Ecommerce Hub
- P0: Synthetic store revenue, orders, SKU info and example product landing page.
- P1: Shopify Admin API, products and variants, inventory, margin inputs, orders, marketing costs and cohort visibility, product-level profitability where data permits.
- P2: Promotions and pricing suggestions, feed QA, merchandising tests, cross-channel reconciliation, post-purchase diagnostics.

## SMB Lead Hub
- P0: Demo lead/appointment funnel and campaign objective mismatch audit.
- P1: Lead sources, form conversion tracking, appointment events, client notes, status pipeline, consented customer communication integrations.
- P2: Service-level conversion analytics, multi-location operations, reputation and local ad performance, CRM synchronization, budget-by-qualified-lead optimization.

## Growth Audit and diagnostics
- P0: local page extraction, comparison with known campaign fixture, clear fact/hypothesis, prepared URL fix, human-approved bookmark/save, follow-up.
- P1: Batch audit for landing pages and ad destinations, structured rule library, tracking checks with verified measurement signals, conversion friction review, accessibility/performance source reports.
- P2: Continuous alerts, historical test archives, accepted/rejected suggestion learning without cross-tenant data leakage, causal experiments with adequate design.

## Research and browser memory
- P0: selected-page capture, bookmark/history metadata search, saved research notes, workspace tagging.
- P1: opt-in page content indexing, client-specific semantic retrieval, deduplication, source citations, private/local search and archive rules.
- P2: competitor tracking via permitted public sources, research collections, recurring website change detection, comparison notes and citations.

## Agent and action center
- P0: text commands, constrained tool registry, proposal diff, approval, actual browser action receipt, scheduled follow-up.
- P1: agent task queue, cancellation, delegated reporting workflows, replays, action policies, notifications and approval by role.
- P2: connector-backed action plans spanning multiple accounts, recoverable long-running jobs, human-in-the-loop external communications, stronger policy engine and admin controls.

## Voice and multilingual
- P0: supported Gemini Live Preview English real dialogue, one Arabic test if model/device/network allow, transcript, cancel and text fallback; no offline voice claim.
- P1: Arabic UI with tested RTL and Egyptian Arabic voice flows, language preference, accessibility captions, bilingual campaign terminology.
- P2: additional languages, enterprise voice consent policies and auditable voice-command execution.

## Analytics, reporting and billing
- P0: explicit sample metrics, sourced calculations, basic audit export, no ungrounded ROI estimates.
- P1: report templates, client annotations, exporting sharable summaries, quotas per plan, usage and subscription billing.
- P2: advanced BI and permissions, comparative benchmarks with valid sample sizes, finance reconciliation, uptime/SLAs.

## Nonfunctional commercial requirements
Tenant isolation, regulatory disclosures, consent and retention, scope audit, rate-limited connectors, idempotent actions, test coverage, billing limits, accessibility, localization, data export/delete, secret handling, basic observability, abuse prevention, incident response. Do not deploy real customer ad-management actions without satisfying these.

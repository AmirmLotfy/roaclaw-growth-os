# Technical architecture and repo layout

## Product architecture (recommended, test rather than assume)
```
[Web app / Dashboard on HTTPS] <---- Auth / Firestore ----> [Firebase backend]
        |                                       |
  Firebase AI Logic                     Cloud Functions / Scheduler
  + Nano via Chrome Prompt API                |
  + Gemini cloud reasoning              Action registry / logs
  + Gemini Live cloud audio                   |
        ^                                Official provider APIs
        |
[Chrome MV3 side panel + content script] -- approved page context, actions --> [Current tab / bookmarks]
```

**Important:** Chrome Prompt API/local inference must be proven on a supported Chrome HTTPS or extension execution context. Chrome MV3 service workers are ephemeral; do not rely on keeping a long Live socket or a local model in the service worker. App Check and extension origin can be problematic. Prefer verified hosted web origin for hybrid/local model and pairing the extension for current page/Chrome actions if direct extension inference is unsupported. Validate transport and origin policy; do not leak privately captured page contents to the server merely to enable a demo.

## Monorepo proposal
```
roaclaw/
  apps/
    web/                 Next.js (App Router), React, dashboard, marketing, demo
    extension/           Vite, React, MV3 manifest, side panel, service worker, content scripts
    video/               Remotion source and real capture media
  packages/
    ui/                  Shared accessible primitives and design tokens
    domain/              Zod contracts, types, metrics, permission rules
    ai/                  Firebase AI Logic adapters, mode handling, schemas
    workflows/           Audit engine, tool registry, action receipts
    fixtures/            Synthetic and deterministic demo seed
  functions/             Scheduled jobs, verified server actions, webhook adapters
  docs/                  Architecture, security, judges' guide
  tests/                 E2E/fixtures/security
  .github/workflows/     lint, types, unit, rules, integration smoke
  firebase.json
  firestore.rules
  firestore.indexes.json
  AGENTS.md
  README.md
  LICENSE
```

## Framework decisions
- Node LTS compatible with Firebase and Next.js; pin versions only after verifying docs.
- pnpm workspaces + TypeScript strict mode.
- Next.js for public SaaS; deploy preferably via Firebase App Hosting for framework support, or Firebase Hosting + supported server arrangement. Use deployment approach the user's project supports, verify runtime and URLs.
- Chrome Manifest V3 side panel using React/Vite; no remotely hosted executable extension code, no dangerous broad host permissions.
- Firebase Authentication (Google or email demo), Firestore data, Cloud Functions for scheduled jobs and side effects; Firebase App Check for AI Logic and other protected resources.
- Server secrets in Google Secret Manager or Firebase function secrets, never Firestore plain records. Client-side Firebase config is public configuration but use authorized domains and security rules.
- Cloud Scheduler/Functions for recurring API tasks; Chrome alarms only for browser-open functions.
- Zod runtime validation at agent and external boundaries, structured logging and bounded retry.
- Vitest for domain logic, Playwright for web E2E, Chrome extension automation under appropriate Chromium harness, Emulator Suite for rule tests.

## Communication and pairing model
Preferred: User authenticates dashboard; extension opens an explicit pair window; backend issues short-lived pairing code scoped to user/organization; authenticated extension exchanges token for limited capabilities. Signed request envelope includes workspace ID, tab origin, action ID, expiry and nonce. Never use `window.postMessage('*')` for sensitive data; enforce exact origin and source and avoid relying on the page DOM as trustworthy instructions.

When runtime local inference must process current page without transmitting it to backend, establish an end-to-end **client-side** bridge between extension and verified inference context (e.g., opt-in dashboard tab after explicit capture). Test this transport before promising offline privacy. If only cloud relay is feasible, disclose it and keep local-only mode disabled for that action.

## Data model, tools, audit
See `05_DATA_AND_SECURITY.md`, `06_FIREBASE_HYBRID_AI.md`, `07_EXTENSION_ACTIONS.md`, `08_PROVIDER_INTEGRATIONS.md`. Every operation is keyed to organization and workspace and recorded. Define immutable action event IDs.

## Operational limits
Cloud AI request caps per user/workspace, Firestore query limits/pagination, scheduled job idempotency, cost alerts, offline states and provider rate limits. Provide status UI for unavailable connector, expired authorization, consent revoked, cached data and stale metrics. Do not run arbitrary user-provided JS on websites.

## Deliberate non-architecture
No premature microservices, vector database dependency for a tiny demo, LangChain-style agent framework when a typed function registry suffices, browser-server puppeteer farm for prohibited ad interface automation, auto-playing dashboard video, or unbounded background recording.

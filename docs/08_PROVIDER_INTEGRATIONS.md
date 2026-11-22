# External integrations: production policy and staged delivery

## Separation of concern
Browser controls inspect/organize user-approved pages and tabs. **Official provider APIs** read and manage campaigns, stores and analytics. Never assume logged-in browser UI automation is an acceptable production replacement for API permissions.

## Provider roadmap
| Provider | First useful integration | Elevated capability | Preconditions |
|---|---|---|---|
| Meta Marketing API | Read authorized campaign metrics, creative URLs, status | Create/edit/pause/publish campaigns | Meta app, OAuth, ads_read/ads_management authorization, required access/review, rate limits |
| Google Ads API | Reporting, MCC/manager selection | Campaign writes and budget changes | OAuth, developer token/access, account permissions, request quota |
| Shopify Admin API | Products/orders and store catalog context | Product page/content changes | Shopify app install/OAuth, approved Admin API scopes, merchant confirmation |
| GA4 Data API | Funnel sessions/events read | Configurable reports | Google OAuth and analytics property membership |
| Google Calendar | Schedule approved client meeting/task reminders | Create/modify event | OAuth, explicit user approval |

## Hackathon state
Real connectors are optional. Implement complete `Connector` interfaces with one deterministic `DemoConnector` backed by `data/seed-demo.json`, and ONE actual authenticated provider read if feasible. Label every demo record. A tile that visually says CONNECTED without a verified OAuth token and scope is forbidden. Use `requiresSetup`, `connected`, `demo`, `expired`, `error` accurately.

## Measurement and diagnosis rules
- Never treat CTR/CPC/ROAS trends as proof of why sales changed; separate correlation/hypothesis from verified page data.
- Always show source and period, actual currency, timezone, attribution settings if available, and freshness.
- Calculate ROAS as attributed revenue / spend only for comparable source/period; explain incompatible datasets.
- Compare evidence of landing-page price/copy against a verified campaign brief or fixture; if only creative image present, say OCR/visual interpretation needs review.
- Tracking check from URL/DOM alone cannot establish that conversion API, pixel and consent work; mark validation needed.
- Scheduled monitoring requires valid API access or accessible public page; browser-only scheduled job cannot execute when browser/computer is closed.

## Consent, claims and platform rules
User-approved accounts only, no scraping private Meta Ads Manager, Google Ads UI or competitively restricted datasets. Ad library research must use public/authorized sources and observe platform terms. No cross-client data pooling, marketing of client data, auto messaging without consent, or public ads without confirmation.

## Suggested typed contract
`Connector.readMetrics({workspace, dates, accountId}) -> {source, period, currency, metrics, fetchedAt, mock:boolean}`
`Connector.prepareChange({action, target, diff}) -> {validated, risk, requiredScopes}`
`Connector.executeApproved({proposalId, approvalToken}) -> {providerRequestId, status, verifiedState}`

All connector output schema-validated; tokens and state changes handled server-side with signed identity, idempotency and logging. Test negative permission paths.

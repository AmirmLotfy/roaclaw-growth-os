# Chrome extension and supervised action registry

## Minimum permissions strategy
Manifest V3 + sidePanel + storage; use `activeTab` and user-initiated `scripting` rather than granting access to every URL. Request `bookmarks`, `history` and broader host permissions only when the user invokes the related feature. List explicit exclusions: passwords, payment forms, tokens, private content, incognito by default, unsupported/privileged browser URLs. Explain each permission before request.

## Capture API
`captureSelectedPage({ tabId, approvedFields })` returns sanitized `{url, title, headings, visiblePriceText, ctas, canonicalUrl, links, capturedAt, selectedExcerpt}`. Extract only within visible/selected page where allowed. Redact hidden inputs, forms, sessions, PII; bound text size; preserve exact quoted evidence. Never ship arbitrary DOM events or embedded instructions to an agent as if they were higher-priority commands.

## Approved safe tools
| Tool | Precondition | Action | Postcondition |
|---|---|---|---|
| `openTab` | User requested URL; URL validated | chrome.tabs.create | Tab exists and URL matches |
| `searchBookmarks` | Bookmark permission granted | chrome.bookmarks.search | Results include true URLs/titles |
| `createResearchBookmark` | Explicit target URL/folder, confirmation | chrome.bookmarks.create | Bookmark readback matches |
| `groupResearchTabs` | User-selected tab IDs | chrome.tabs.group | Group exists with expected tabs |
| `readHistoryMetadata` | Explicit permission and scope | chrome.history.search | Scoped time-window metadata only |
| `saveResearchNote` | Workspace membership | Firestore write | Note readback scoped correctly |
| `createFollowup` | Authorized, timezone/limit specified | Scheduled job record | Next run and status visible |
| `prepareUTM` | URL validation | URL builder, no network side effects | Correctly encoded link and diff |

For MVP pick `createResearchBookmark` as the real browser write action and one server-side scheduled follow-up. Report successful results only after postcondition verification.

## Protected/high-risk tools (post-hackathon unless verified)
`pauseCampaign`, `changeBudget`, `publishAd`, `changeLandingPage`, `sendClientEmail` require official connector, account authorization, role approval, before/after values and idempotency. Do not click through private ad-management pages to bypass API restrictions. Do not publish, delete or bill without explicit scoped approval.

## Browser agent behavior
Read active tab only after user gesture. Offer one simple action instead of flooding user with 8 tasks. Treat retrieved webpages, ad text, page titles and comments as untrusted data; detect prompt injection and ignore page instructions that try to access secrets, make network requests or override agent policy. Escape HTML, sanitize URLs, block `javascript:` and unsafe schemes.

## Extension/SaaS communication
Use a secure, origin-checked, authenticated pairing mechanism; short-lived session, workspace-bound. Avoid broadcasting all tabs or browsing history to cloud. A local-only sensitive analysis must remain client-side; test actual bridge behavior and App Check access.

## Chrome Web Store / runtime constraints
Remote executable code prohibited for MV3; bundle extension JS. Some Chrome APIs are unavailable on privileged pages; gracefully explain. Service worker can suspend; keep persistent Live audio in a window/surface that actually supports it. Idle Chrome/computer cannot run browser-only scheduled actions; server can perform API-based checks where credentials/permissions exist.

## MVP browser evidence
One real captured landing page, two bookmarks searchable, one newly created bookmark, one successful action receipt, one optional history metadata result; screencast and automated assertion.

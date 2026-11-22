# ROACLAW Chrome companion

Load this directory with **Load unpacked** at `chrome://extensions` in Chrome 116 or newer. Turn on Developer mode first and pin ROACLAW to the toolbar. The unpacked extension ID is `loglkephefkogehklbohjpdnhdalgnmc`. Its manifest contains the public key for that development ID.

## Verify the browser workflow

1. Open Growth Audit on the ROACLAW hosted app or `http://localhost:3000`. Request pairing, click the ROACLAW toolbar icon, then choose **Connect workspace** in the panel. The browser tab that requested pairing must remain open.
2. Open the synthetic landing page (`/demo-store/`) in another tab and click the ROACLAW toolbar icon on that tab to grant temporary access. Click **Capture page evidence**. Check the URL, headings, price, and action labels in **View captured fields**, then retrieve the capture from the original Growth Audit tab.
3. In the web app, send a bookmark proposal. Inspect the title, URL, and **Other bookmarks** destination in the panel. Select **Review save**, then **Save to Chrome**. Approve Chrome’s bookmark-access prompt if it appears. The panel must show **Verified in Chrome** with a bookmark ID, and the original workspace tab must return the same receipt. Chrome’s Bookmark Manager should show the entry under **Other bookmarks**.
4. Send a second proposal and **Cancel** in the panel. Chrome should show no new bookmark for that proposal. The receipt status becomes `declined`.
5. Open **Search Chrome bookmarks** to test local bookmark search. Search for a distinctive title shared by two bookmarks in the test profile. Search results stay in the panel.

The extension reads a bounded set of details from the active tab after both toolbar access and an explicit capture click. Use public landing pages. The capture skips form fields, private-page matches, hidden content, and common identifier or secret patterns. It strips URL query strings and fragments. A pairing lasts up to one hour, pending pair requests expire after two minutes, capture evidence is available for up to 15 minutes, and bookmark proposals expire after ten minutes. Bookmarks persist in the Chrome profile and may sync through the browser according to profile settings. Disconnect clears the paired session’s evidence and receipts from the companion.

## Bridge

Call `chrome.runtime.sendMessage(extensionId, message, callback)` from the top-level app tab. Use a cryptographically random `sessionId` held in that tab’s `sessionStorage`, such as `crypto.randomUUID()`. A confirmed pairing binds that session ID with the workspace ID, Chrome tab, and exact origin. Workspace and proposal IDs use 1–128 ASCII letters, numbers, underscores, or hyphens. Session IDs use the same alphabet with a 16-character minimum.

| Request | Successful response |
| --- | --- |
| `{type:'ROACLAW_PAIR', workspaceId, sessionId, workspaceName}` | `{ok:true, status:'pending'}` before confirmation or `{ok:true, status:'paired'}` after confirmation. Poll with the same request. |
| `{type:'ROACLAW_CAPTURE', workspaceId, sessionId}` | `{ok:true, status:'empty'}` or `{ok:true, status:'captured', capture:{url,title,headings,visiblePriceText,ctas,capturedAt}}`. This retrieves existing panel evidence. |
| `{type:'ROACLAW_PROPOSE_BOOKMARK', workspaceId, sessionId, proposal:{id,title,url}}` | `{ok:true, status:'pending'}` for a new proposal. Repeating the same proposal returns its latest status. |
| `{type:'ROACLAW_RECEIPT', workspaceId, sessionId, proposalId}` | `{ok:true, status:'empty'}` for an unknown proposal. Otherwise `pending`, `approved`, `executed`, `declined`, or `verification_failed`. An `executed` response includes `receipt:{proposalId,workspaceId,bookmarkId,title,url,folder,verifiedAt}`. |

Errors return `{ok:false, code, message}`. Bookmark URLs use HTTP(S) and require a query-free URL without credentials or a fragment. The synthetic demo path `/demo-store/` on the paired origin supports exactly `utm_source=meta`, `utm_medium=paid_social`, and `utm_campaign=weekend-everyday-essentials` for its prepared UTM bookmark.

Run the lightweight protocol and service-worker checks with `npm test` from this directory. They use mocked Chrome APIs. For actual permission, active-tab, and bookmark evidence, use the Chrome steps above.

With current desktop Chrome and the hybrid proof tool’s Playwright dependency installed, the browser smoke runner uses a temporary Chrome profile and opens the native side panel. Run it from the repository root.

```sh
node apps/extension/test/smoke.mjs https://roaclaw-growth-os-2026.web.app/app/ --evidence-dir qa/evidence/g3
```

Approve Chrome’s optional bookmark permission when prompted in that test window. The runner checks that approved bookmarks survive tab reload and are recorded in the Chrome profile after shutdown. Add `--web-flow` to use the Growth Audit buttons for pairing and retrieving capture evidence.


## Recent history

Under Research, open **Search recent history**. Enter 2 to 80 characters and grant the optional Chrome history permission if requested. The panel searches at most 12 results during the last 24 hours, filters unsupported or sensitive-looking URLs, removes query strings and fragments, and shows the page title, address and last-visit time. Results stay in the panel and clear when the connection changes. **Clear history results** clears the panel without editing Chrome history. Chrome’s extension settings control retained permission.

Pass `--web-flow --history` to the smoke script to verify the dashboard round trip and recent-history lookup. Both optional permissions may prompt in a fresh Chrome profile.

For unattended smoke testing, add `--pregrant-test-permissions`. It uses a disposable profile and a copy of the unpacked manifest with the requested test permissions installed. The release manifest continues to request optional permissions, and the denial path is covered by the unit tests.

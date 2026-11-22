# ROACLAW Growth OS

ROACLAW compares a campaign promise with its landing page, puts sourced findings in an audit, and hands a proposed research bookmark to Chrome for human approval. The demo uses fictional workspaces, including a campaign offering a product for $99 and a storefront showing $119.

[Open the Firebase-hosted demo](https://roaclaw-growth-os-2026.web.app/) · [Download the Chrome companion](https://roaclaw-growth-os-2026.web.app/roaclaw-extension.zip) · [Standalone test storefront](https://roaclaw-growth-os-2026.web.app/demo-store/)

## Run the hosted demo

1. Open the demo and select **Open demo**. Firebase Auth creates an anonymous identity with separate workspace records.
2. In **Growth Audit**, select **Device only** to check the fixture on Chrome. **Prefer device** may send the displayed heading, price, and call to action to the cloud and adds a separate cloud review.
3. Inspect the offer mismatch, missing campaign tag, and ROAS below goal. The ROAS observation does not establish that the price difference caused it.
4. To approve a bookmark, extract the companion ZIP, open `chrome://extensions`, enable Developer mode, then **Load unpacked**. Pair the dashboard tab with the extension and confirm the workspace in the companion. Send the proposal to the companion, review the exact URL and click **Save to Chrome**. Return to the dashboard and check the receipt.
5. In **Automations**, schedule a fixture recheck. The dashboard runs due checks when requested and reads the current fixture page.

Chrome Desktop must support the Gemini Nano 4 model. Enable **Gemma 4 for Built-in AI** and confirm model availability in `chrome://on-device-internals`. Google documents a 22 GB free-space threshold for a cold download. [Chrome requirements](https://developer.chrome.com/docs/ai/get-started) · [Firebase Web hybrid guide](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)

## Architecture

- **Next.js static export** supplies the audit workspace and synthetic storefront on Firebase Hosting.
- **Firebase AI Logic** calls the Chrome model through its hybrid SDK or Gemini 3.5 Flash-Lite via the cloud. Source labels come from the SDK. Cloud requests require Firebase App Check.
- **Firebase Authentication and Firestore** store bounded synthetic audit records, bookmark receipts, privacy preferences and scheduled checks behind UID-scoped rules.
- **Chrome MV3** captures an approved active tab and writes a bookmark only after a separate user review. It accepts paired messages from designated app origins. Page snapshots outside the demo fixture stay in the open dashboard tab.

## Development

Use Node 22, pnpm 10.34.9 and the Unix `zip` command.

```sh
npm exec --yes --package=pnpm@10.34.9 -- pnpm install --frozen-lockfile
npm exec --yes --package=pnpm@10.34.9 -- pnpm check
npm exec --yes --package=pnpm@10.34.9 -- pnpm test
npm exec --yes --package=pnpm@10.34.9 -- pnpm build
```

Copy `apps/web/.env.example` to `apps/web/.env.local` and use configuration for your own Firebase Web application. Enable anonymous Auth, provision Firestore, deploy the rules, and register a score-based reCAPTCHA Enterprise key for authorized production domains. The [backend verification notes](qa/backend/README.md) cover the emulator checks. The [standalone inference probe](tools/hybrid-proof/README.md) covers local debugging and the offline retest.

For the hosted browser regression, install the separate probe tooling and run `node qa/e2e/hosted.mjs` from the repository root with Chrome and a prepared Nano test profile. See the [evidence index](qa/EVIDENCE_INDEX.md) for measured results.

## Scope

The connector and storefront data are synthetic. The companion manages local bookmarks and does not modify an ad account. Follow-up execution is an explicit browser action. Text lookup works over current audit findings and verified bookmark receipts. Server-side scheduling, live voice, OAuth integrations and account teams remain outside this Spark build.

The Growth OS web app and Chrome extension are a new project started on 22 November 2026 for #BuildHybridAI. Third-party dependencies use their own licenses. The synthetic storefront uses an original ImageGen product illustration.

Licensed under Apache 2.0.

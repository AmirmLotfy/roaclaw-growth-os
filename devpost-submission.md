# ROACLAW — Growth Audit

Compare what a campaign promises with what a visitor sees. ROACLAW traces the evidence, prepares a tagged link, and asks for approval before Chrome saves it.

## Problem

A campaign and its destination can drift apart. A buyer may see one price in the ad and another on the storefront, while missing campaign tags make it harder to trace traffic. Teams need a way to establish the discrepancy, review its source, and keep a record of the approved response.

## What ROACLAW does

- Audits a selected landing page against the campaign and performance fixtures for the active workspace.
- Captures visible headings, prices, and buttons from an approved Chrome tab. No advertising account is connected.
- Separates observations, such as a missing tag or a below-target ROAS, from explanations that still need evidence.
- Prepares an exact destination link. A human reviews it in Chrome before creating a bookmark. ROACLAW records what Chrome read back.
- Saves synthetic audit history and due storefront checks in an isolated demo workspace.

## Firebase AI Logic

The Web app uses Firebase AI Logic for Gemini Nano 4 in Chrome and Gemini 3.5 Flash-Lite in the cloud. The local prompt extracts fields from the inspected page without external inference traffic. The cloud prompt receives separate facts for a conditional interpretation, and the consented hybrid mode can fall back to the cloud. The UI displays the SDK-reported source. Chrome 158 returned `on_device` both online and offline. The production cloud request passed reCAPTCHA Enterprise App Check.

## Architecture and Codex

Next.js exports the public app to Firebase Hosting. Anonymous Firebase Auth and Firestore rules scope records to the current demo identity. A Manifest V3 companion binds the selected workspace and browser tab to the allowed app origin. The companion requires a local approval before any Chrome write. Codex implemented the app and companion, conducted reference research and ruled out fabricated inference states by measuring the actual browser, SDK, App Check, and Chrome bookmark results.

## Judge instructions

1. Open [Growth Audit](https://roaclaw-growth-os-2026.web.app/app/), select **Open demo**, and choose **Open ecommerce demo**. No credentials are required.
2. Use **Device only** to verify Nano 4 on compatible Chrome. Google documents the 22 GB cold-download requirement. Enable **Gemma 4 for Built-in AI** if required and wait for the model to become ready. Use **Prefer device** for the cloud review or fallback.
3. Use Sable & Stem to see the **$99** campaign price compared with the **$119** synthetic storefront. The audit also checks the missing campaign tag and the difference between **3.315×** observed ROAS and the **3.6×** target.
4. To exercise Chrome, [download the ZIP](https://roaclaw-growth-os-2026.web.app/roaclaw-extension.zip), extract it and load the unpacked folder through `chrome://extensions`. Pair the workspace, send the prepared change, verify its destination in the Chrome side panel and select **Save to Chrome**. Check the receipt in the dashboard.
5. In **Automations**, schedule a fixture recheck. **Run due checks** reads the current storefront when a check is due.

## Scope

The Growth OS web app and Chrome companion are a new project started on 22 November 2026. The workspaces, campaign records, and figures are synthetic. The dashboard runs due checks when requested. Live voice and paid-media connectors are outside this release.

## Links and assets

- Website: https://roaclaw-growth-os-2026.web.app/
- Dashboard: https://roaclaw-growth-os-2026.web.app/app/
- Proposed public repository: https://github.com/AmirmLotfy/roaclaw-growth-os
- Apache 2.0 license: https://github.com/AmirmLotfy/roaclaw-growth-os/blob/main/LICENSE
- Final demonstration video: pending public YouTube playback verification
- Screenshot sources: hosted hybrid audit, Chrome approved capture and verified bookmark receipt

## Account-holder fields

The account holder confirmed Individual, Egypt, organization N/A, and the project start date of 22 November 2026. The project category is Web (Chrome). The account holder reviewed the official rules and confirmed the required eligibility attestations. Final submission requires a verified public video and explicit approval.

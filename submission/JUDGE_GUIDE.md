# Judge walkthrough

ROACLAW is a Web (Chrome) entry. [Growth Audit](https://roaclaw-growth-os-2026.web.app/app/) · [Campaign Preflight](https://roaclaw-growth-os-2026.web.app/app/preflight/) · [Chrome ZIP](https://roaclaw-growth-os-2026.web.app/roaclaw-extension.zip) · [Screenshot gallery](../docs/screenshots/README.md)

## 1. Open the ecommerce demo

Choose **Open demo**, then **Open ecommerce demo**. Firebase creates an anonymous workspace with fictional Sable & Stem campaign data. Select **Prefer device** and click **Run Growth Audit**. Look for the **$99 advertised price**, **$119 landing-page price**, missing `utm_campaign`, and the **Page** and **Review** source labels. Export the JSON to inspect the findings and source fields.

**Page · On device** requires a supported Chrome Desktop profile with Gemini Nano 4 ready. For an initial setup, enable **Gemma 4 for Built-in AI** in `chrome://flags` where required and check readiness in `chrome://on-device-internals`. Google documents the hardware requirements and a 22 GB free-space requirement for the initial download. The cloud-enabled demo may show **Page · In cloud** on Chrome profiles without Nano. **Review · In cloud** identifies the separate Firebase review. If App Check denies a session, a ready Nano profile can still complete the page audit. [Chrome requirements](https://developer.chrome.com/docs/ai/get-started) · [Firebase hybrid setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started) · [Production evidence](../qa/EVIDENCE_INDEX.md#app-check-repair-and-full-growth-audit-rerun)

## 2. Capture a page and approve a bookmark

1. Unzip the companion. In `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the directory containing `manifest.json`. Pin ROACLAW so its toolbar icon is available.
2. In Growth Audit, open **Use an approved Chrome capture** and select **Pair Chrome extension**. Open the ROACLAW side panel, confirm the workspace, then choose **Check pairing** in the dashboard.
3. Open the demo storefront from the dashboard. Click the extension toolbar icon on the storefront tab and choose **Capture page evidence**. Return to the dashboard, choose **Get approved capture**, and run the audit.
4. Choose **Send for Chrome approval**. In the side panel, review the exact URL, choose **Review save**, then **Save to Chrome**. Grant bookmarks access if prompted. In the dashboard, choose **Check receipt** and open **Memory**. The receipt includes the saved URL and Chrome bookmark ID.

History search is optional and asks for its own permission. Capture remains limited to the selected tab. [Companion docs](../apps/extension/README.md) · [Verified Chrome run](../qa/evidence/app-check-repair/companion.json)

## 3. Try Campaign Preflight with your own brief

Open Campaign Preflight and enter an offer, a public landing-page URL, and its expected button label. Enter a price and campaign tags if you want those checked. Request pairing, confirm the campaign and hostname in the side panel, open the destination tab and capture it. Use **Open Campaign Preflight** to return to the original tab, attach the capture, and run the comparison. If several prices appear, confirm the price linked to the offer. Copy the suggested tracked URL or export the standalone HTML report. Optional Nano inspection runs on the device. [Verified public-page test](../qa/evidence/preflight-0.3.1.json)

## 4. Verify offline inference

After Nano is ready and the ecommerce demo has opened, select **Device only**, keep the tab open, and take Chrome offline. Run the audit again. It displays **Page · On device** and offers JSON export. Reconnect to sync the synthetic audit. [Offline evidence](../qa/EVIDENCE_INDEX.md)

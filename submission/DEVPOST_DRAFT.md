# ROACLAW Growth Audit

## Tagline

Compare a campaign offer with its landing page, then approve a tracked bookmark in Chrome.

## Inspiration

A buyer clicks an ad for a $99 vase set and lands on a page that shows $119. A campaign dashboard can report return on ad spend while missing that discrepancy. We built ROACLAW to put the offer, the page and the evidence for each finding in the same place.

## What it does

Growth Audit opens a synthetic ecommerce, lead-generation or agency workspace. In the ecommerce example, it finds the $99 vs. $119 price mismatch and a missing campaign tag. It also shows the demo's 3.315× return on ad spend against a 3.6× target. In the lead-generation example, the audit labels the button-copy question as a hypothesis.

The Chrome companion captures headings, displayed prices and button labels from a public page after the user requests it. The dashboard proposes the exact tagged link. The user reviews it in Chrome and saves it to Other Bookmarks. Chrome reads it back and the audit saves the verified receipt. The workspace also keeps research notes and lets the user run a due storefront price check.

## How we built it

Next.js and TypeScript power the web app. Chrome Manifest V3 powers the companion. Firebase AI Logic runs structured page extraction with Gemini Nano 4 in compatible Chrome. With cloud processing enabled, it can fall back to Gemini 3.5 Flash-Lite for extraction and uses that model for a separate cloud review. The dashboard labels each source using the SDK. External page captures use device-only analysis.

Firebase Authentication opens an anonymous demo session. Cloud Firestore rules isolate each demo UID's workspaces. Firebase App Check protects cloud inference, and Firebase Hosting serves the site, app and extension ZIP. The companion requires confirmed, origin- and tab-bound pairing.

## Challenges and results

We verified Gemini Nano 4 on-device and offline, then verified an independent cloud response with App Check. During a fresh recording run the local model sometimes omitted a price. The audit now compares model output with captured evidence and can use a single explicit captured price when needed. It records the basis for the field and asks for review if the captured prices conflict.

The Chrome test verified a real bookmark readback, persistence after browser shutdown, cancellation without a new bookmark, and a saved receipt after dashboard reload. An open demo tab also completed a local audit offline and synced it after reconnecting. The app offers text lookup because the Firebase Web Live preview rejected this configuration's App Check connection.

## What we learned

A local inference source tells us where the model ran. The evidence attached to each field tells us why we can use it. Capturing both made the findings easier to verify and made the approval workflow clearer.

## What's next

Authorized campaign and ecommerce connectors, collaborative approvals, and server-run monitoring.

## Built with

Firebase AI Logic, Gemini Nano 4, Gemini 3.5 Flash-Lite, Firebase App Check, Firebase Authentication, Cloud Firestore, Firebase Hosting, Next.js, TypeScript, React, Chrome Manifest V3, Playwright and Remotion.

## Judge links

- [Start Growth Audit](https://roaclaw-growth-os-2026.web.app/app/) and choose **Open demo**, then **Ecommerce**. Run **Prefer device** to see the extraction and review labels. Use **Device only** on compatible Chrome with the model ready.
- [Product site and install guide](https://roaclaw-growth-os-2026.web.app/)
- [Chrome companion ZIP](https://roaclaw-growth-os-2026.web.app/roaclaw-extension.zip)
- [Public Apache 2.0 repository and full test instructions](https://github.com/AmirmLotfy/roaclaw-growth-os)
- Add the public YouTube URL after the narrated master passes playback review.

## Disclosures

ROACLAW Growth OS is an independent project started on 22 November 2026. The demo uses fictional campaigns, storefronts and workspaces. Codex assisted implementation and ImageGen created the fixture artwork. Asset and dependency licenses are listed in the repository.

Entry platform: **Web (Chrome)**.

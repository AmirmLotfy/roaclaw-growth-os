# Devpost Submission Draft — revise to match VERIFIED app

**Critical:** This is a strong publication-ready narrative STRUCTURE, not permission to claim non-working features. Replace bracketed fields with actual evidence or delete unsupported claims. User wants a finished real submission before November 30 14:00 PST. The submitted page must reflect what Codex genuinely built.

## Project title
ROACLAW — The Growth Agent That Shows Its Work

## Short tagline
A local-first browser companion and SaaS workspace that finds the gap between ad spend and business results—and makes every proposed action accountable.

## Inspiration
A media buyer can have the campaign, the landing page, the store's sales numbers, and their research open at the same time—and still miss a basic mismatch. The problem isn't a shortage of dashboards. It's that browser context, business objectives, campaign performance, and follow-up work live in different places. ROACLAW connects those pieces, with a strong privacy boundary and an explicit record of what the agent actually did.

## What it does
ROACLAW combines a SaaS workbench with a Chrome extension. Users choose an ecommerce, lead-generation, or agency client workspace; inspect a selected landing page; analyze available campaign/context data; and receive source-backed findings and proposed actions. Its flagship **Growth Audit** labels observations separately from hypotheses, surfaces a reviewable diff, and asks permission before executing safe browser actions. Saved research, activity receipts and scheduled follow-ups keep the work accessible. [Only mention live speech here if tested: "It also supports a live voice interaction through Firebase AI Logic." ]

In the submission video, a **synthetic** store campaign advertises a $99 offer while the selected page displays $119. ROACLAW flags that mismatch, finds the missing campaign parameter in the sample URL, compares the observed fixture ROAS with the configured target, and prepares a small corrective action that the user can approve. [Specify what action actually executed.]

## How we built it
We implemented a [VERIFIED FRAMEWORK] SaaS interface and a Chrome Manifest V3 extension sharing business context through Firebase Authentication and Firestore. For supported short page analysis, Firebase AI Logic uses **on-device Gemini Nano 4** via Chrome's built-in Prompt API. For longer, cross-source reasoning, the app uses a cloud Gemini model through Firebase AI Logic. The UI reports actual `inferenceSource` values from the Firebase SDK and has an explicit local-only privacy mode. [Only include Firebase Live API if verified.] Agent proposals are validated and approved before an allowed browser or API action; results are confirmed with a postcondition and a log entry.

Other Firebase services: [LIST ACTUALLY USED: App Check, Auth, Firestore, Cloud Functions, Hosting/App Hosting, Remote Config]. Test/repo setup: [TESTS, VERSION, PUBLIC REPO].

## Challenges we ran into
The hardest boundary was not generating plausible marketing advice; it was **making claims verifiable**. Chrome's on-device model has limited supported tasks and hardware requirements, while cloud reasoning and live voice are separate capabilities. Browser extensions also have security and permission constraints. We designed the audit as a measured sequence of local extraction, cloud diagnosis, human review, and verifiable action rather than pretending a model can freely operate a browser.

[Replace with the ACTUAL integration or debugging obstacle and resolution: e.g. App Check + extension origin, Chrome model flag/readiness, demo account isolation, voice session reconnection.]

## Accomplishments we're proud of
- [Only if verified] A genuine Firebase AI Logic request returning `ON_DEVICE` and a separate cloud request returning `IN_CLOUD`, shown in the demo.
- [Only if verified] A functional full Growth Audit on a deterministic synthetic dataset, separating evidence and hypotheses.
- [Only if verified] Permission-gated real Chrome action plus postcondition receipt, not a fake button.
- [Only if verified] Isolated agency/client workspaces and an accessible, restrained interface that supports audit decisions rather than hype.
- [Only if verified] Live natural voice interaction with a visual approval boundary.

## What we learned
Hybrid inference is a product architecture decision, not just a model toggle. On-device processing changes consent expectations, cloud reasoning requires careful source attribution, and an agent is only trustworthy when it can explain a proposed change, ask for the correct approval, and verify what happened afterward.

## What's next
Production-grade Meta/Google Ads and ecommerce connectors through official APIs; richer scheduled monitoring; collaborative approvals; additional language coverage; expanded semantic browser memory and enterprise retention controls. These are forward-looking, not present-demo claims.

## Built with
[ACTUALLY USED ONLY:] Firebase AI Logic, Gemini Nano 4, Gemini [model name], Firebase App Check, Firebase Authentication, Cloud Firestore, Firebase Functions, Next.js, TypeScript, React, Chrome Manifest V3, Remotion, Playwright.

## Links
- Demo: [VERIFIED HOSTED URL]
- Extension build/installation: [VERIFIED RELEASE OR DOCS URL]
- GitHub/GitLab source: [VERIFIED PUBLIC URL]
- YouTube public demo: [VERIFIED VIDEO URL]
- Testing instructions: [IN FORM FIELD AS REQUIRED]

## Required disclosures / integrity
This submission uses synthetic business data; no actual ad spend is changed in the demo. List preexisting code/assets incorporated, date and scope of new work, AI-assisted coding tools, third-party licenses, and production limitations where required by the contest.

## Category
**Web / Chrome**, not Android or iOS. A web SaaS plus Chrome extension is one Web platform.

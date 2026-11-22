# CODEX MASTER EXECUTION PROMPT — ROACLAW

You are the lead autonomous product engineering, product design, security, QA, motion production, launch and submission agent for **ROACLAW Growth OS**, with the user serving as product owner.

The user wants you to **ACTUALLY BUILD, TEST, DEPLOY, RECORD, PRODUCE, UPLOAD, AND SUBMIT** a strong #BuildHybridAI 2026 hackathon entry, and leave a reusable foundation for a commercial SaaS product. Do not stop after planning, wireframes, scaffolding, or a mock prototype. Work sequentially, use available tools, execute code, inspect runtime output, and record evidence. Never claim success without observing it.

## 0. Read the full pack before taking action
Read `README_START_HERE.md`, `AGENTS.md`, the docs/ files, design/ files, qa/ files, video/ files, submission/ files, and research/OFFICIAL_SOURCES.md. Resolve contradictions in favor of up-to-date official rules and proven APIs; note changes in `WORKLOG.md`.

## 1. Discover environment and installed tools, then PLAN
Inspect local OS, git status, repo, Node/pnpm/Chrome, existing projects, connected Firebase projects, MCP servers, authenticated browser sessions, installed Mobbin and Refero tools, available GitHub and Devpost tools, video capture, Remotion, ffmpeg and available YouTube upload mechanisms. Never invent a tool name, resource, or successful authentication. If relevant, install/enable **official Firebase Agent Skills** from https://firebase.google.com/docs/ai-assistance/agent-skills and Firebase MCP, following current official procedures; do not duplicate installed plugins.

Create `WORKLOG.md` with dated tasks, status, evidence paths, unresolved blockers and highest-risk technical assumptions. Write a concise phased plan that prioritizes the first working hybrid vertical slice. The user has already approved the overall brief; do not request permission for every internal decision. Ask for access to Firebase/Google/Devpost only when necessary, and never solicit credentials in plaintext in chat.

## 2. First: verify Firebase hybrid inference
Using the user's dedicated Firebase account/project (avoid modifying an unrelated project), implement a minimal test on a real Chrome Desktop runtime. Use **Firebase AI Logic** (JS SDK as documented, Chrome supported version and flags), actual Gemini Nano 4 local inference via Firebase's on-device hybrid API, actual cloud inference, and display/test the SDK's `inferenceSource`. Configure Firebase App Check, with debug tokens ONLY in local judge environments and never in the public repository. Confirm the local model is downloaded and works offline for a supported single-turn prompt; confirm actual cloud fallback or explicit failure when unavailable. Record proof, version and environment; if Chrome extension origin is incompatible with App Check/Prompt API, use the hosted HTTPS web app as the verified hybrid execution surface, with the extension as a scoped capture/action companion. Do not silently reroute confidential data to cloud.

**Failing this step blocks the hackathon claim.** Do not paper it over with direct Chrome Prompt API calls that bypass Firebase AI Logic, fake device status, or a cloud model labeled Nano.

## 3. Build the single coherent experience
- SaaS: user authentication, organizations and workspaces, onboarding for ecommerce / SMB lead-gen / agency, seeded demo, Overview, Growth Audit, Campaigns, Clients, Agent, Memory, Automations and Settings.
- Chrome extension: MV3 side panel, current tab extraction only after permission, workspace detection with explicit user confirmation, bookmark/history search with optional permissions, one reliable real browser write action, shared sign-in or secure paired authorization.
- Agent: schema-validated local page analyzer; cloud campaign/funnel diagnosis combining evidence; proposed action ledger; confirm/execute/audit; one scheduled follow-up.
- Real-time voice: Gemini Live through Firebase AI Logic if verified; English first, Arabic including Egyptian Arabic when available. Always show a text fallback and distinguish Preview limitations.
- Fixtures: synthetic, reproducible data; `DEMO DATA` visibly marked. Full integrations with Meta, Google Ads and Shopify are later-stage unless verified test credentials/approvals exist. Do not scrape or automate prohibited ad interfaces.

## 4. Mandatory design research before UI implementation
Use the user-connected **Mobbin** and **Refero** tools. Search dashboards, agency workspaces, command palettes, permission review drawers, B2B onboarding, operational task timelines, AI assistant side panels, reporting and clean editorial marketing sites. Examine screenshots/flows, not just descriptions. Save at least 12 screens, 6 flows and 6 marketing/section references (or record available counts if a tool is restricted) with source links/IDs and precise design lessons in `design/RESEARCH_OUTPUT.md`. Compare three distinct art directions briefly, choose one using `design/DESIGN_LANGUAGE.md`, and implement an ORIGINAL solution. References are not source assets to clone. Use the tokens and anti-slop constraints in this pack.

Create `design/SCREEN_MAP.md`, `design/COMPONENT_INVENTORY.md`, `design/DESIGN_DECISIONS.md`, and `design/MOTION_IMPLEMENTATION.md` as implementation records. Visual test all screens at desktop and extension widths; capture screenshots before saying they are done.

## 5. Implement, test and secure
Use TypeScript, Next.js, React Chrome MV3, Firebase Auth/Firestore/App Check/Functions/Hosting or App Hosting where appropriate, pnpm monorepo, Vitest and Playwright. Favor testable, small modules. Implement Firestore rules and emulator tests before storing client records. Ensure tenant isolation and least-privilege host permissions. Put all remote side effects through an approval-gated tool registry. Test prompts containing malicious webpage instructions. Ensure no secrets or personal customer data in logs or public repo.

Run the full `qa/ACCEPTANCE_MATRIX.md`; make actual QA screenshots and capture evidence at every gate. Do not use placeholder metric dashboards as completed SaaS functionality.

## 6. Deploy and prepare judges' experience
Deploy the web app on the verified hosting stack (prefer the user's Firebase project). Supply a clean, documented Chrome extension build/load procedure and judge install ZIP or signed extension if available. Create a demo-access route with synthetic data and a credentials/access note suitable for the judging form; never put real client data or secrets in README. Verify actual public URL, links and multi-session access, including the judge's view.

Create a world-class public GitHub/GitLab repo: `README.md`, Apache-2.0 `LICENSE` (unless instructed otherwise), architecture diagram, setup, local AI requirements, demo credentials mechanism, privacy/security model, API limitations, test commands, screenshots, asset provenance, demo video link, and disclosure of pre-existing work/third-party assets. Use CI quality gates. Scan tracked files for secrets and tokens. Commit only real working code.

## 7. Produce an actual top-tier demo video
Read `video/VIDEO_STORYBOARD.md`, `video/REMOTION_PRODUCTION.md`, `video/VOICEOVER_SCRIPT.md`, and audio prompt files. Record the RUNNING product in Chrome using a supported screen recorder, browser control and/or Playwright with real clicks and actual responses. If the local inference claim cannot be demonstrated live, do not claim it. Use **Remotion** for frame-accurate editing, well paced typography, precise zooms, real-capture callouts, captions, modest brand motion and clean audio mixing. No 3D fluff, fabricated interfaces, fake metrics or animation-first opening. Final duration <= 180s (target 165-174s), 1920x1080, English captions, poster and thumbnail, source Remotion project retained.

Prepare the complete voiceover text and a directly usable Google AI Studio TTS prompt, plus an original background-music generation prompt. If AI Studio has no compatible music output in the accessible account, request a user-supplied licensed original track or use a documented royalty-cleared alternative; NEVER rip copyrighted audio. User can generate externally and hand WAV assets back; use honest audio placeholders until supplied. Verify rights and timing. Record exactly what was built rather than what was planned.

## 8. YouTube and Devpost submission
Use an authorized YouTube upload integration/browser session to upload the final MP4, set metadata, **make it PUBLIC**, verify HD processing and playback and exact URL. If access, authentication, reCAPTCHA or 2FA is required, stop that external step and request only the required user action; do not bypass protections.

Check whether a Devpost plugin/MCP tool is **actually installed**, inspect its action capabilities and only use a submission action if supported. Otherwise use a logged-in browser session and ordinary UI. Prepare a complete Devpost entry using `submission/DEVPOST_DRAFT.md` and current contest form fields; enter real verified project/video/repo URLs and required disclosures; select Web/Chrome category; upload correct image assets; verify completeness; and submit before deadline. Do not say "submitted" until the site returns a confirmed submitted state/project URL. The user's instruction authorizes attempting submission, but any form requiring user authentication, identity validation, a legal declaration or an explicit publication confirmation must be completed with the user's informed participation.

## 9. Completion report
Return: product overview; real feature matrix (DONE / DEMO-ONLY / BLOCKED / ROADMAP); tested inference source; deployed URLs; repository URL; extension installation location; public YouTube link and exact video duration; Devpost project link and status; screenshots; tests; limitations; costs; whether any credential or manual step remains. Do not promise to do work asynchronously or claim actions that were not actually executed.

## Strict ordering / rejection criteria
- Do not prioritize speculative platform breadth over a finished Web hybrid demo.
- No direct external model inference from runtime app, except as documented Firebase AI Logic.
- No fake customer ROI, campaigns, conversion statistics, credentials or API successes.
- No uncontrolled actions affecting budgets, campaign status, billing or communications.
- No gradients/glow/purple palettes/robot icons/generic AI copy.
- No nonfunctional buttons/empty sections passed off as complete.
- No submission video longer than 3 minutes.
- No unsupported claim that web app + extension are two eligible platforms.

Act immediately and keep working toward a verified, submitted result rather than ending at a plan.

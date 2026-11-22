# Hard submission checklist and closeout evidence

## Before Devpost submission
- [x] User / team registered and eligible; any company/employee entry consent addressed.
- [x] Read current contest Rules, FAQ, required fields and deadline again.
- [x] App demonstrably uses real Firebase AI Logic on-device Nano 4 and cloud mode, not mock mode.
- [x] Actual runtime `inferenceSource` proof captured and included.
- [x] App Check configured; NO debug token in public repo.
- [x] Functional SaaS deployment URL works in a fresh browser.
- [x] Chrome extension loads and core action succeeds; release/install instructions public.
- [x] No real client data, unauthorized ad actions or secrets in demo.
- [ ] All entry claims reconciled with tests and video.
- [x] Repo PUBLIC, LICENSE Apache-2.0 or other accepted open source, actual runtime code, `.env.example`, instructions, test scripts, limitations, screenshots.
- [ ] Third-party and generated music/video/font licenses documented.
- [ ] <=3 minute actual product YouTube video rendered, with English captions, and reviewed end to end.
- [ ] YouTube upload is publicly visible (not unlisted), fully processed and open logged out.
- [ ] Devpost project category Web/Chrome, description, technology, repo, video, test URL, permissions and disclosures complete.
- [x] Any legal/identity attestations completed by appropriate user, not silently by agent.
- [ ] Click/complete final Submit and confirm status and project URL before deadline.

## Automation/tool usage policy
1. Discover genuine Devpost MCP/plugin actions. If there is a supported draft/create/update/submit action and authenticated permission, use it.
2. Otherwise, use signed-in browser automation and the visible Devpost form. Do not invent undocumented endpoints or use unauthorized scraping.
3. If Devpost/YouTube require login, 2FA, CAPTCHA, or legal affirmation, request user's action without bypassing or making false declarations.
4. Use API or browser to upload to YouTube only with user/channel authorization; set PUBLIC and verify status.
5. On error, save a clear draft and uploadable files; report remaining exact steps, never say 'submitted' without confirmation.

## Deadline and freeze
**Nov 30 2026 14:00 PST = Dec 1 2026 00:00 Cairo**. Target public video by Nov 29 and final contest entry by Nov 30 well before 14:00 PST. Repo commits after deadline may not be evaluated. Freeze final tag/version and log timestamp.

## Completion receipt for user
Fill values only after verification:
```
Submission status: [SUBMITTED / DRAFT / BLOCKED]
Devpost URL: [ACTUAL URL OR N/A]
Submitted at and timezone: [TIME]
GitHub URL + commit/tag: [ACTUAL]
SaaS demo URL: [ACTUAL]
Chrome extension package/install URL: [ACTUAL]
YouTube PUBLIC URL: [ACTUAL]
Duration from ffprobe: [ACTUAL]
Firebase local mode proof: [PATH]
Firebase cloud mode proof: [PATH]
Tests passing: [COUNT + REPORT]
Limitations: [ACTUAL]
Manual actions needed: [NONE OR EXACT]
```

## 22 November 2026 status

The existing [RoaClaw Devpost draft](https://devpost.com/software/roaclaw-o1637x) is associated with #BuildHybridAI 2026 and has no submission timestamp. Cloud inference, consented fallback, App Check, on-device extraction and the independent offline inference check passed. See the [evidence index](../qa/EVIDENCE_INDEX.md).

The account holder confirmed Growth OS is a new, independent build started on 22 November 2026, and confirmed the required eligibility attestations. Submitter type is Individual, country is Egypt, and organization is N/A. Final submission approval remains pending.

The [public candidate](https://github.com/AmirmLotfy/roaclaw-growth-os/releases/tag/v0.2.1-rc.2) passed a clean checkout build. The verified product copy is in [DEVPOST_DRAFT.md](DEVPOST_DRAFT.md). The [picture review](../video/VIDEO_QA_REPORT.md) is ready for the owner's narration and music. Keep free judge access available through the judging period, which ends 16 December at 14:00 PST. [Official rules](https://firebasehybridaihackathon.devpost.com/rules)

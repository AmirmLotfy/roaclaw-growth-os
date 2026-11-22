# #BuildHybridAI release audit

Checked 22 November 2026 against the organizer’s overview, Resources, Official Rules, and FAQ. Campaign Preflight and the Growth Audit demo are live. The owner supplied narration and music for the new local film. YouTube and Devpost are on hold.

## Organizer requirements

| Requirement | ROACLAW evidence | Release check |
|---|---|---|
| Enter one supported platform | The dashboard and Chrome companion are one Web (Chrome) project. | Select Web (Chrome) on the existing draft. |
| Firebase AI Logic in the runtime | Chrome reported Nano 4 in the release candidate. An earlier production run verified a separate Gemini cloud response under App Check. | The latest retry received an App Check 403 during the cloud path. The verified on-device fallback and offline sync passed. Recheck cloud playback evidence before publishing. |
| Explain problem, features, and Firebase use | The [updated English draft](DEVPOST_DRAFT.md) explains the campaign and page mismatch, the Chrome approval flow, and the observed Firebase behavior. | Current copy and judge links are ready. Add the final video URL after playback review. |
| Public repository and open-source license | Public GitHub detects Apache-2.0. The [0.3.1 candidate](https://github.com/AmirmLotfy/roaclaw-growth-os/releases/tag/v0.3.1-rc.1) passed the [clean checkout build](https://github.com/AmirmLotfy/roaclaw-growth-os/actions/runs/45023603268), ZIP readback and secret scan. | Use the verified candidate or its tested final successor. |
| Public YouTube video and English | The [127-second film](../video/VIDEO_QA_REPORT.md) passed decode and scene review. Device and cloud proof are shown in the first 30 seconds. The English captions and both thumbnails are ready. | Public YouTube playback remains on hold. |
| Testing experience | Firebase Hosting has the product site, anonymous demo, and extension package. | Passed in fresh isolated profiles. Include the app URL in judging instructions and maintain free access through 16 December at 14:00 PST. |
| Accurate eligibility and work history | The account holder confirmed a new individual project in Egypt, no organization, started 22 November 2026, and confirmed the required attestations. | Confirm the final action at submission time. |
| Deadline | 30 November 2026 at 14:00 PST, which is midnight entering 1 December in Cairo. | Finish playback verification before opening the submission form. |

[Contest overview](https://firebasehybridaihackathon.devpost.com/) · [Resources](https://firebasehybridaihackathon.devpost.com/resources) · [Official rules](https://firebasehybridaihackathon.devpost.com/rules) · [FAQ](https://firebasehybridaihackathon.devpost.com/details/faqs)

## Product acceptance

| Surface | Required checks |
|---|---|
| Product website | Responsive, original photography and actual UI captures, motion with reduced-motion support, keyboard proof tabs, judge access, installation, and privacy copy. |
| Growth Audit | Isolated demo onboarding, three scenarios, SDK source, exact evidence, proposal, Chrome receipt, persisted notes, export, and safe offline behavior. |
| Campaign Preflight | Verified public landing-page capture via the native Chrome panel, tab handoff, direct comparison, explicit price review, optional Nano inspection, tracked-link copy, and HTML report. [Hosted run](../qa/evidence/preflight-0.3.1.json) |
| Chrome companion | Explicit pairing and active-tab capture, inspection/research/action views, local search, optional permissions, two-step approval, readback, cancellation, and session revocation. |
| Follow-up | Store the due time, run the recheck on demand, record the actual fetched price, and preserve completed or canceled state across reload. |
| Voice | Text lookup passes. The protected Firebase Web Live connection closes with code 1008 even after App Check token acquisition. Keep the voice limitation visible in the repository. |
| Commercial integrations | Meta, Google Ads, Shopify, customer teams, and billing are later milestones in the pack. Judge data remains synthetic and the browser action writes a bookmark. |

## Publication hold

The owner asked to pause the external browser and review the three product surfaces before submission. Earlier YouTube and Devpost entries remain drafts. The public release step follows the final product QA, audio mix, and playback review.

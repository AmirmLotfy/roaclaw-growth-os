# ROACLAW video QA

The final **47.680-second** export uses the redesigned production interface at [ROACLAW Growth Audit](https://roaclaw-growth-os-2026.web.app). It shows Gemini Nano 4 on-device extraction and cloud review in the first 12 seconds. The bookmark and dashboard receipts come from the connected Chrome run.

## Release files

| Deliverable | Local path | Format |
|---|---|---|
| Master | `.local/video/ROACLAW_BuildHybridAI_2026_FINAL.mp4` | 1920×1080, H.264, 30 fps, 1,430 video frames, 5,094,623 bytes |
| Thumbnail | `.local/video/ROACLAW_BuildHybridAI_2026_THUMBNAIL.png` | 1280×720 PNG |
| English subtitles | `.local/video/ROACLAW_BuildHybridAI_2026_EN.srt` | 14 cues through 00:47.667. The same English captions are visible in the master. |
| Edit | `.local/footage/edit-redesign.json` | Remotion source in `apps/video/`. Run `npm --prefix apps/video run render -- .local/footage/edit-redesign.json` from the repository root. |

Audio is a silent 48 kHz stereo AAC track. Narration and music were unavailable for this export.

## Checks

| Check | Result | Evidence |
|---|---|---|
| Evidence and claims | Pass | The source footage shows the real fixture storefront, both Firebase inference labels, the three findings, the proposed UTM change, a completed fixture recheck, and the workspace switch. The connected stills show actual Chrome capture, bookmark readback, and the dashboard verification banner. [Hosted runtime](../qa/evidence/web/runtime.json), [Chrome capture](../qa/evidence/g3-web/02-captured-evidence.png), [Chrome receipt](../qa/evidence/g3-web/03-verified-bookmark.png), [dashboard receipt](../qa/evidence/g3-web/06-web-receipt.png) |
| Format and duration | Pass | Remotion 4.0.545 rendered the video and thumbnail. ffprobe confirmed the final duration, resolution, frame rate, and AAC track. Local evidence in `.local/video/qa/probe.json`. |
| Playback and visual review | Pass | FFmpeg decoded all 1,430 frames without a black interval. Reviewed the contact sheet across the full timeline, all ten footage cuts, and the first frame plus samples at 04.967, 13.100, 21.700, 33.300, and 43.567 seconds. Local evidence in `.local/video/qa/`. |
| Color and thumbnail | Pass | Thumbnail pixels match cool canvas `#F4F7FB` and signal blue `#1853D8`. Encoded navy reads `#132742` against source `#132642`, within one channel level. The captured thumbnail shows the same redesigned interface. |

A brief gray viewport edge appears near 00:08 while the captured browser resizes. The gray area stays outside the audit content and captions. The side-panel capture, bookmark result, and dashboard receipt are labeled QA stills.

## Expanded release cut

The replacement master covers the standalone site, Growth Audit, genuine on-device and cloud source states, selected-page capture, bookmark approval and receipt, local history search, a due follow-up, and the lead-generation scenario. It uses recordings and screenshots from the deployed release. All 13 selected scenes, the receipt crop, thumbnail, and captions were checked. FFmpeg decoded the complete master without errors. FFprobe reported 57.813 seconds, 1920 × 1080, H.264 at 30fps with a silent AAC track. The separate English SRT accompanies the open captions.

- Final MP4: `.local/video/ROACLAW_BuildHybridAI_2026_FINAL.mp4`
- English SRT: `.local/video/ROACLAW_BuildHybridAI_2026_EN.srt`
- Thumbnail: `.local/video/ROACLAW_BuildHybridAI_2026_THUMBNAIL.png`
- Edit manifest: `.local/footage/release-edit.json`

Studio lists the earlier cut as a draft. The replacement master is awaiting the final publication step.

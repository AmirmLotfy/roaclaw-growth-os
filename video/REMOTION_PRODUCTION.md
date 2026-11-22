# Remotion production

The picture uses the running dashboard, Chrome companion, and source badges from Firebase. Graphite, neutral paper, and vermilion match the current product. A color grade neutralizes the earlier palette in existing UI footage. The captured values, interface layout, and action sequence stay intact.

## Record

Use a dedicated test profile with synthetic data. Capture at 1440 × 920 or larger. Keep secrets, real client records, browser account information, and personal bookmarks out of frame.

```sh
ROACLAW_QA_HEADLESS=1 ROACLAW_CAPTURE_VIDEO=1 ROACLAW_CAPTURE_HOLD_SECONDS=5 node qa/e2e/hosted.mjs
ROACLAW_QA_HEADLESS=1 ROACLAW_COMPANION_RECORD=1 node apps/extension/test/smoke.mjs https://roaclaw-growth-os-2026.web.app/app/ --web-flow --history --pregrant-test-permissions --evidence-dir qa/evidence/g3-web
```

The browser and native side-panel recordings and their timing markers are under `.local/footage/`. The temporary lab manifest pregrants permissions on an isolated profile. The release manifest requests them at the point of use.

Start with the two offer prices. Show both actual Firebase routes within 30 seconds. Follow the [storyboard](VIDEO_STORYBOARD.md) with the offline rerun, investigation, Chrome capture, approval and readback, workspace isolation, and a due price recheck. Use real screen recordings for interactions and clear crops of verified screenshots to hold sourced results.

## Audio and final picture

- [Narration script](VOICEOVER_SCRIPT.md), [speech direction](AI_STUDIO_VOICE_PROMPT.md), and [score prompt](AI_STUDIO_MUSIC_PROMPT.md) are ready for the owner's AI Studio generation.
- Put supplied original audio under `.local/footage/audio/`. Record provider, model, date, file hash, and distribution rights in the video QA report.
- Use each clip's `narration` property or the edit's continuous `voiceover` property. Point `score` at the edited instrumental. The score fades and ducks under speech. Check narration intelligibility on speakers and headphones. Measure integrated loudness and true peak before release.
- Add a `subtitleCues` array with non-overlapping start/end seconds and verified English transcript text for the final audio. Keep the opening prose and approximate timing in the storyboard for planning.

## Export and release

The Campaign Preflight film uses the supplied continuous narration and instrumental. Run from the repository root when the source clips are present. The edit inserts a captioned Preflight sequence during a natural pause before the final line.

```sh
ROACLAW_PREFLIGHT_RECORD=1 ROACLAW_PREFLIGHT_EVIDENCE=.local/film node qa/e2e/preflight.mjs
npm --prefix apps/video run film
```

The film expects `narration.wav` and `music.mp3` in `.local/film`. The older Growth Audit clips come from the verified capture workflow above. The shot and subtitle timings are in [film-edit.mjs](film-edit.mjs). The render writes `ROACLAW_CAMPAIGN_PREFLIGHT_FILM.mp4` and its English SRT to `.local/video/`. The platform-specific [thumbnail source](design-thumbnails.mjs) produces separate 1800 × 1200 Devpost PNG and 3840 × 2160 YouTube JPEG files in the same directory.

Use the installed Remotion package. The picture-review command produces a separate local cut. If the edit sets `requireAudio`, the final render checks for both narration and score.

```sh
npm --prefix apps/video run check
npm --prefix apps/video run picture -- .local/footage/picture-review.json
npm --prefix apps/video run render -- .local/footage/final-edit.json
```

Export H.264 MP4, AAC, 1920 × 1080, 30fps, English SRT, and a 1280 × 720 thumbnail. Check the full decode, opening and ending frames, source labels, readable receipts, caption timing, audible balance, and duration under three minutes. Use the [contest FAQ](https://firebasehybridaihackathon.devpost.com/details/faqs) for the first-30-seconds guidance.

Keep external publication on hold until the owner authorizes it at the final review. Public YouTube playback and Devpost submission are separate verification steps. [Release audit](../submission/RELEASE_GATE.md)

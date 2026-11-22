# Remotion production pipeline — real demo first

## Mandatory production principle
The main footage must be **actual running product** (Chrome extension and live web dashboard, with recorded SDK model outcomes). Remotion animates the EDIT and surrounding typography, not fabricated product screens. Do not simulate cloud fallback, ad accounts, ROAS changes, bookmarks or completed automation.

## Software discovery
Check installed Remotion plugin, browser recording tools, screen recording, Playwright, ffmpeg/ffprobe, Remotion CLI and audio files. Official Remotion agent skills are available at https://www.remotion.dev/docs/ ; install only if useful. Do not pretend a screen capture integration exists if not accessible.

## Capture specs
- Record Chromium at consistent 1440x900 screen region or full 1920x1080, while displaying REAL data fixture and true execution outcomes.
- Record extension open/close, a complete audit, on-device badge, cloud badge, finding and action receipt. Keep IDs, auth pages, API keys and personal account info out of frame.
- Browser-controlled recording can use Playwright video, Remotion Recorder, OS recorder, or a tested equivalent. Use sufficient resolution and a visible authentic cursor. Prefer dedicated test profile with no personal bookmarks.
- Retake long waits or flaky transitions; video must truthfully show what completed. Realtime captured UI segments may be slightly trimmed for pacing, but do not splice fake success after failure.

## Remotion project layout
```
apps/video/
  src/Root.tsx
  src/ROACLAWDemo.tsx
  src/compositions/Intro.tsx
  src/compositions/UiFootage.tsx
  src/compositions/EvidenceTag.tsx
  src/compositions/Outro.tsx
  src/tokens.ts
  public/footage/*.mp4
  public/audio/vo_*.wav
  public/audio/music*.wav
  public/captions/demo.srt
  package.json
```
Use direct design tokens. Avoid complex 3D, overlaid browser frames or disruptive UI retouching.

## Edit language
- Use brief chapter cards with the app’s navy background and blue signal color, up to 1.5 seconds each.
- Picture-in-picture only when contrasting Chrome extension with full SaaS, otherwise show actual app full frame.
- Evidence callouts on real figures/URLs, no arrows or boxes hiding the UI. Crop/zoom <=1.25 unless the screenshot resolution supports more.
- Match real UI state changes with transitions; no gratuitous swipe wipes.
- Use larger subtitles with legible safe zones; avoid small type in split screens.

## Export contract
- Target `1920x1080`, 30 fps, H.264 MP4, AAC audio, <=170-175 seconds ideally; absolute <=180 seconds.
- Verify with ffprobe, listen all the way through, inspect video for black frames / clipped UI / incorrect captions / missing audio / overlarge file / muted background / intentional demo labels.
- Produce `ROACLAW_BuildHybridAI_2026_FINAL.mp4`, a thumbnail 1280x720, `.srt`, Remotion editable source and `video/VIDEO_QA_REPORT.md`.
- Create a visual first-frame check, 5 random timestamp checks and one full playback check.

## YouTube workflow
Use authenticated browser or authorized YouTube API; public, not unlisted/private. After upload, wait until actual HD processing and play URL confirmed. YouTube title/description in `YOUTUBE_METADATA.md`. User login/2FA interactions should be handled by user, not bypassed by agent. Do not claim uploaded until verified URL works in a logged-out context.

## Legal
Use only owned/generated original music and VO with proper licenses, and original recorded UI. Do not use copyrighted example footage from Mobbin/Refero as public product footage.

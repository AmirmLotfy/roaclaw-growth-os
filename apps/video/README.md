# ROACLAW demo edit

The Remotion composition uses the original Chrome recordings. It adds English captions, short chapter titles, and a closing link. The thumbnail combines an editorial title with a frame from the same recording. The package lives outside the app's pnpm workspace.

## Prepare the clips

Place the source recordings and `edit.json` under `.local/footage/`. Use MP4 or Playwright WebM. The edit manifest references source filenames relative to the manifest. Recordings at 1440×920 fit without stretching. A narrow side-panel recording gets a separate layout.

```json
{
  "demoUrl": "https://roaclaw-growth-os-2026.web.app",
  "segments": [
    {"kind": "offer", "file": "web.webm", "start": 1, "end": 5},
    {"kind": "device", "file": "web.webm", "start": 12, "end": 22},
    {"kind": "cloud", "file": "web.webm", "start": 24, "end": 30},
    {"kind": "findings", "file": "web.webm", "start": 30, "end": 35}
  ],
  "cover": {"kind": "findings", "second": 2}
}
```

The `start` and `end` values are source seconds. The example clips need real timestamps from the current recordings. `cover.second` is relative to the selected slice. The first four beats show the price discrepancy, on-device result, cloud result, and audit findings. `review`, `workspaces`, `capture`, `bookmark`, and `followup` can follow in any order when the recording verifies the corresponding action or state. A single recording can supply multiple beats. For each slice, check the final source frames before selecting a cut and keep the SDK or receipt status visible long enough to read.

For `capture`, `bookmark`, or `receipt`, an authentic QA PNG can be used as a still. Set `start` to 0 and `end` to the hold length in seconds, up to 12 seconds.

Optional fields are `zoom` from 1 to 1.25 and `focus` from `center`, `top`, `bottom`, `left`, or `right`. `narration` accepts a supplied WAV, M4A, MP3, or AIFF relative to the manifest. Narration starts with its slice and must fit within it. Supply a reading of the segment caption if the SRT will also be used as the narration transcript. Source screen audio is muted.

## Ingest, preview, and render

Run from the repository root with Node 22 or newer, `ffmpeg`, and `ffprobe`.

```sh
npm --prefix apps/video ci
npm --prefix apps/video run check
npm --prefix apps/video run ingest
npm --prefix apps/video run preview
npm --prefix apps/video run render
```

Pass a different manifest path after `--` to any of the last three scripts. Set `ROACLAW_VIDEO_CHROME` to an installed Chrome executable to use it for rendering. Otherwise Remotion provisions its renderer browser.

Ingest verifies source dimensions and durations, calculates frame-accurate placement, and generates the SRT in `.local/video/`. Render writes the 1920×1080 H.264 MP4 and the 1280×720 PNG thumbnail to the same directory. An AAC track is always present and carries supplied narration when provided. The `qa/` directory contains ffprobe results and six extracted frames. Review the selected images and the complete video before using the export.

# ROACLAW video QA

**Waiting for footage of the redesigned interface.** The source project is in `apps/video/`. The pre-redesign footage and timing draft are in `.local/footage/`. The ten-cut timing draft is 46.67 seconds. The checks below describe that draft.

| Check | Status | Evidence |
|---|---|---|
| Hosted footage source | Pass | `roaclaw-web.webm` is VP9 WebM at 1440×920. Sampled source frames show the synthetic storefront, an actual `Page · On device` result, and an actual `Review · In cloud` result. |
| Claims review | Pass at source | Captions cover the fixture price mismatch, missing campaign tag, ROAS gap, UTM diff, workspace switch, and follow-up scheduling. Chrome capture, bookmark readback, and the dashboard receipt use stills from the connected run. The dashboard still crops to the original verification banner. [Chrome capture](../qa/evidence/g3-web/02-captured-evidence.png), [Chrome receipt](../qa/evidence/g3-web/03-verified-bookmark.png), [dashboard receipt](../qa/evidence/g3-web/06-web-receipt.png) |
| Edit and caption generation | Pass | Standalone type and syntax checks passed. Ingest verified all ten cuts and generated the English SRT. |
| Redesigned video framing | Source updated | Remotion now uses the app’s navy, cool surfaces, blue signal, IBM Plex typography, and direct action captions. The redesigned film will be checked against the new recording. |
| Render and artifact validation | On hold | Re-record the redesigned interface before rendering. The render checks H.264, 1920×1080, 30fps, AAC, at most 180 seconds, and a 1280×720 PNG. |
| Visual samples and full playback | Pending | Inspect the rendered first frame and five sampled timestamps. Review the full video for accuracy, clipping, awkward cuts, legibility, timing, and audio. |
| Narration and music | Pending | The composition accepts original, supplied narration. The recorded browser clip contains no audio. |

The screen recordings show synthetic business data. Include an optional segment only after checking the source recording for the corresponding proof. The follow-up caption describes scheduling. Use the Chrome completion caption only with a visible verified receipt.

# ROACLAW film and submission artwork QA

## Campaign Preflight film

Verified on 22 November 2026. The graphite and vermilion edit opens with the $99 campaign offer and $119 storefront price. It shows recorded device-only inference, a separate Firebase cloud review, the offline audit, Chrome capture and bookmark approval, and the new Campaign Preflight workflow. Prior verified UI footage was color-graded. Live Preflight footage uses the project's own demo storefront.

| Asset | Local path | Verified format |
|---|---|---|
| Film | `.local/video/ROACLAW_CAMPAIGN_PREFLIGHT_FILM.mp4` | 127.019 seconds, 1920 × 1080, 30 fps, 3,810 video frames, H.264 and stereo AAC |
| English captions | `.local/video/ROACLAW_CAMPAIGN_PREFLIGHT_FILM.srt` | 36 cues |
| Devpost gallery cover | `.local/video/ROACLAW_DEVPOST_3X2.png` | 1800 × 1200, sRGB PNG, 516,857 bytes |
| YouTube thumbnail | `.local/video/ROACLAW_YOUTUBE_16X9.jpg` | 3840 × 2160, sRGB JPEG, 418,251 bytes |
| Remotion timeline | [film-edit.mjs](film-edit.mjs) | 26 shots and timed captions |
| Thumbnail source | [design-thumbnails.mjs](design-thumbnails.mjs) | Two independent compositions and aspect-ratio checks |

The film passed a full FFmpeg decode. The midpoint of all 26 shots was inspected, including close-ups of the device, cloud, exact tagged link, Chrome capture, exported report and closing URL. The cloud review is visible at 00:22.500. Both thumbnails were inspected at 320px wide. [Devpost image guidance](https://help.devpost.com/article/126-know-your-submission-steps) · [YouTube image guidance](https://support.google.com/youtube/answer/72431)

The edit uses the owner's supplied continuous narration and music. The score ducks under speech and bridges the captioned Preflight sequence. The delivered AAC measures -16.1 LUFS integrated and -1.6 dBTP. The close was checked against the supplied narration. The supplied stem hashes and final file hash are in the [film report](../qa/evidence/video/campaign-preflight-film.json). The audio stems and local export files live outside Git.

## Publication

YouTube Studio confirmed the final cut was published on the Frameless channel on 22 November 2026. The custom 16:9 thumbnail and uploaded English captions were saved. The watch page played at 1920 × 1080 and listed the English track. An unauthenticated oEmbed request returned the expected title and channel. Studio's initial copyright and Community Guidelines checks reported no issues. Subscriber notifications were disabled for this upload. Devpost submission remains on hold. [Watch on YouTube](https://youtu.be/V-a7CwUjY1U)

The [verified screenshot gallery](../docs/screenshots/README.md) accompanies the separate 3:2 Devpost cover. PNG copies for the gallery are in `.local/submission-gallery/`.

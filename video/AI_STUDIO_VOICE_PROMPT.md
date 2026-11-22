# Google AI Studio — voiceover generation handoff

**Where:** Google AI Studio text-to-speech workflow if available for the account (current documented TTS family includes Gemini 3.1 Flash TTS Preview). This is **submission video asset generation**, not app runtime inference. It is permitted only if platform and contest licenses allow usage; verify rights. User will generate/return WAV/PCM files if Codex cannot access account.

## Copy/paste direction prompt
Produce an original, professionally narrated English voiceover for a serious B2B product walkthrough called ROACLAW. Speaker: adult gender-neutral or male, calm, articulate, confident without hype, neutral international English with slight editorial documentary cadence. Speak naturally at around 135 words per minute, with clear enunciation of 'Firebase AI Logic', 'Gemini Nano', 'on-device', 'landing page', 'return on ad spend', 'ROACLAW'. Avoid AI-influencer enthusiasm, upspeak, dramatic trailer bass, stock-commercial warmth or breathless speed. No music, no background ambiance, no sound effects, no extra introductions. Maintain consistent timbre across all clips, subtle pauses after technical claims, and emphasize evidence and user control rather than marketing superlatives. Read the script supplied below **verbatim**; do not rewrite it or add fictional capabilities. Export isolated high-quality WAV or PCM if supported, with consistent levels.

[PASTE THE SEGMENT TEXT FROM `VOICEOVER_SCRIPT.md` HERE]

## Practical workflow
- Generate one continuous take or 10 scene-aligned clips, depending on model control. Use exactly the same chosen voice settings.
- User review for pronunciation and naturalness; regenerate individual clips rather than altering visual timeline to fit unnatural speech.
- Name: `vo_00_hook.wav`, `vo_01_local.wav`, ...; put files in `apps/video/public/audio/` for Codex, do not commit if licensing forbids redistribution.
- In Remotion, align clips to timeline; no time-stretch greater than a few percent to mask poor timing. Prefer revise text to fit genuine footage.
- Use a short alternative version if no music model is available; music is secondary.

## Verification
Check output format, loudness, unnatural pauses, incorrect 'Nano 4' claims, subtitles, and license terms before final public upload.

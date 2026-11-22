# Google AI Studio voiceover prompt

Use the speech generation interface with **Gemini 3.8 Flash TTS**, if shown for the account. Use a single voice for every clip. Pick a clear, adult English-speaking voice with even enunciation and no strong character accent. Voice generation is for the video. [Google speech generation guide](https://ai.google.dev/gemini-api/docs/speech-generation)

For each of the ten clips, paste this direction followed by the exact narration under the matching filename in [Voiceover script](VOICEOVER_SCRIPT.md).

```text
Read only the narration after NARRATION. Speak clear international English as a product engineer describing a browser demonstration to a colleague. Use a low-key conversational delivery, steady volume, and short pauses between sentences. Aim for about 145 words a minute. The figures and model names need to be easy to hear. Say ROACLAW as “ROH-claw.” Say Firebase A.I. Logic with the letters A and I spoken separately. Say Gemini Nano Four in full. Keep the wording exact. Do not introduce the clip, read a filename, add breaths for effect, or add music, effects, or reverb. Leave a short quiet tail after the final line.

NARRATION
```

Export each take as WAV or upload the original audio from AI Studio. Use the filenames in the script. Send the files together if possible. For a single continuous take, keep the same order, leave a one-second pause between passages, and name it `roaclaw_voiceover.wav`. The edit will be timed to the supplied performance and captioned in English.

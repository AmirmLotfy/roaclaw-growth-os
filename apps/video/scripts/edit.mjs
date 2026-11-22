import { execFileSync } from "node:child_process";
import { randomInt } from "node:crypto";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { beats, chapterFrames, fps, maxFrames, outroFrames } from "../src/edit.mjs";

const packageDir = fileURLToPath(new URL("../", import.meta.url));
const repo = resolve(packageDir, "../..");
const footageDir = resolve(repo, ".local/footage");
const outputDir = resolve(repo, ".local/video");
const entry = resolve(packageDir, "src/Root.tsx");
const remotion = resolve(packageDir, "node_modules/.bin/remotion");
const propsPath = resolve(outputDir, "edit-props.json");
const required = ["offer", "device", "cloud"];
const videoExt = [".mp4", ".webm"];
const screenshotBeats = ["capture", "bookmark", "receipt", "history", "lead", "offline"];
const audioExt = [".wav", ".mp3", ".m4a", ".aiff"];
const focuses = ["center", "top", "bottom", "left", "right"];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertInside(parent, child) {
  const relativePath = relative(parent, child);
  assert(relativePath && relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath),
    `${basename(child)} must be inside ${parent}.`);
}

function probe(path) {
  return JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", path], { encoding: "utf8" }));
}

function verifiedAsset(folder, filename, allowed) {
  assert(typeof filename === "string" && allowed.includes(extname(filename).toLowerCase()), `Expected ${allowed.join(" or ")} for ${filename}.`);
  const path = realpathSync(resolve(folder, filename));
  assertInside(folder, path);
  return { path, servedName: relative(folder, path).split(sep).join("/") };
}

function position(frame) {
  const ms = Math.round(frame * 1000 / fps);
  const parts = [Math.floor(ms / 3_600_000), Math.floor(ms / 60_000) % 60, Math.floor(ms / 1000) % 60];
  return parts.map((part) => String(part).padStart(2, "0")).join(":") + "," + String(ms % 1000).padStart(3, "0");
}

function subtitleText(text) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line.length + word.length > 48 && line) {
      lines.push(line);
      line = word;
    } else {
      line += (line ? " " : "") + word;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

function cue(number, from, end, text) {
  return `${number}\n${position(from)} --> ${position(end)}\n${subtitleText(text)}\n\n`;
}

function ingest(path, srt) {
  const realManifest = realpathSync(path);
  assertInside(realpathSync(footageDir), realManifest);
  const folder = dirname(realManifest);
  const data = JSON.parse(readFileSync(realManifest, "utf8"));
  assert(typeof data.demoUrl === "string", "Enter the verified hosted demo URL in demoUrl.");
  const link = new URL(data.demoUrl);
  assert(link.protocol === "https:" && !link.username && !link.password && !link.search && !link.hash && link.href.length < 130,
    "Use the public HTTPS demo URL without credentials, query parameters, or fragment.");
  assert(Array.isArray(data.segments), "Enter the verified footage slices in segments.");
  const opening = data.segments[0]?.kind === "home" ? data.segments.slice(1) : data.segments;
  assert(required.every((kind, index) => opening[index]?.kind === kind),
    `The core opening order is ${required.join(", ")}, with an optional homepage before it.`);

  assert(data.segments.some((clip) => clip.kind === "findings"), "Include the real audit findings.");

  const seen = new Set();
  const probes = new Map();
  let cursor = 0;
  let cueNumber = 0;
  let captions = "";
  const segments = data.segments.map((clip) => {
    const { kind, file, start, end, zoom = 1, focus = "center" } = clip;
    assert(typeof kind === "string" && Object.hasOwn(beats, kind) && !seen.has(kind), `Unsupported or duplicate beat: ${kind}.`);
    seen.add(kind);
    assert(Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end - start >= 2, `${kind} needs at least two seconds of visible evidence.`);
    assert(Number.isFinite(zoom) && zoom >= 1 && zoom <= 1.25 && focuses.includes(focus), `${kind} permits zoom 1–1.25 and a listed focus.`);
    const allowed = screenshotBeats.includes(kind) ? [...videoExt, ".png"] : videoExt;
    const { path: source, servedName } = verifiedAsset(folder, file, allowed);
    if (!probes.has(source)) probes.set(source, probe(source));
    const metadata = probes.get(source);
    const track = metadata.streams.find((stream) => stream.codec_type === "video");
    const still = extname(source).toLowerCase() === ".png";
    assert(!still || (start === 0 && end <= 12), `${kind} still must start at zero and hold at most 12 seconds.`);
    const sourceDuration = still ? end : Number(metadata.format?.duration);
    assert(track && Number.isFinite(sourceDuration), `${file} has no measurable video or image stream.`);
    assert(end <= sourceDuration + 0.04, `${kind} extends past the end of ${file} (${sourceDuration.toFixed(2)}s).`);
    const startFrame = Math.round(start * fps);
    const duration = Math.min(Math.floor(sourceDuration * fps), Math.round(end * fps)) - startFrame;
    assert(duration > 0, `${kind} does not contain any frames.`);

    const beat = beats[kind];
    const chapterFrom = beat.chapter ? cursor : undefined;
    const chapterDuration = beat.chapter ? chapterFrames : 0;
    if (beat.chapter) captions += cue(++cueNumber, cursor, cursor + chapterDuration, beat.chapter);
    const from = cursor + chapterDuration;
    if (kind === "cloud") assert(from + 2 * fps <= 30 * fps, "Show at least two seconds of cloud evidence within the first 30 seconds.");
    cursor = from + duration;
    captions += cue(++cueNumber, from, cursor, beat.caption);

    let narration;
    if (clip.narration) {
      const { path: audio, servedName: audioName } = verifiedAsset(folder, clip.narration, audioExt);
      const audioMetadata = probe(audio);
      const audioDuration = Number(audioMetadata.format?.duration);
      assert(audioMetadata.streams.some((stream) => stream.codec_type === "audio") && Number.isFinite(audioDuration), `${clip.narration} has no measurable audio stream.`);
      assert(audioDuration <= duration / fps, `Narration for ${kind} overruns the selected cut.`);
      narration = audioName;
    }

    return { kind, file: servedName, still, narration, startFrame, duration, from, chapterFrom, chapterDuration, zoom, focus, width: track.width, height: track.height };
  });

  const duration = cursor + outroFrames;
  assert(duration <= maxFrames, `Shorten the edit to 180 seconds or less (currently ${(duration / fps).toFixed(2)}s).`);
  const coverKind = data.cover?.kind ?? "findings";
  const coverSegment = segments.find((segment) => segment.kind === coverKind);
  const coverSecond = data.cover?.second ?? 0;
  assert(coverSegment && Number.isFinite(coverSecond) && coverSecond >= 0 && Math.round(coverSecond * fps) < coverSegment.duration,
    "The thumbnail time must select a frame inside one of the edited beats.");
  const cover = { kind: coverKind, frame: coverSegment.startFrame + Math.round(coverSecond * fps) };
  captions += cue(++cueNumber, cursor, duration, `ROACLAW · ${link.hostname}`);
  function track(name) {
    if (!data[name]) return;
    const { path, servedName } = verifiedAsset(folder, data[name], audioExt);
    const metadata = probe(path);
    const seconds = Number(metadata.format?.duration);
    assert(metadata.streams.some((item) => item.codec_type === "audio") && Number.isFinite(seconds),
      `${data[name]} needs a readable audio stream.`);
    assert(name === "score" ? seconds >= duration / fps - 0.05 : seconds <= duration / fps,
      name === "score" ? "Prepare an instrumental file at least as long as the cut." : "Narration must finish within the cut.");
    return servedName;
  }

  assert(!data.voiceover || !segments.some((segment) => segment.narration),
    "Choose a continuous voiceover or scene narration.");
  if (data.subtitleCues) {
    assert(Array.isArray(data.subtitleCues) && data.subtitleCues.length > 0, "Provide timed English subtitle cues.");
    let lastEnd = 0;
    captions = data.subtitleCues.map(({ start, end, text }, index) => {
      assert(Number.isFinite(start) && Number.isFinite(end) && start >= lastEnd && end > start &&
        end <= duration / fps && typeof text === "string" && text.length > 0 && text.length <= 110,
      `Subtitle ${index + 1} needs non-overlapping start/end seconds and up to 110 English characters.`);
      lastEnd = end;
      return cue(index + 1, Math.round(start * fps), Math.round(end * fps), text);
    }).join("");
  }
  const props = { demoUrl: link.href.replace(/\/$/, ""), duration, cover, segments, score: track("score"), voiceover: track("voiceover") };
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(propsPath, JSON.stringify(props, null, 2) + "\n");
  writeFileSync(srt, captions);
  console.log(`Verified ${segments.length} cuts · ${(duration / fps).toFixed(2)} seconds · ${srt}`);
  return { folder, props, requireAudio: data.requireAudio === true };
}

function runRemotion(args, folder) {
  const browser = process.env.ROACLAW_VIDEO_CHROME;
  execFileSync(remotion, [...args, `--public-dir=${folder}`, `--props=${propsPath}`, ...(browser ? [`--browser-executable=${browser}`] : [])], {
    cwd: packageDir, stdio: "inherit",
  });
}

function verifyMaster(master, thumbnail, qa) {
  const metadata = probe(master);
  const video = metadata.streams.find((track) => track.codec_type === "video");
  const audio = metadata.streams.find((track) => track.codec_type === "audio");
  const duration = Number(metadata.format?.duration);
  assert(video?.codec_name === "h264" && video.width === 1920 && video.height === 1080 && video.avg_frame_rate === "30/1", "Master must be 1920×1080 H.264 at 30fps.");
  assert(audio?.codec_name === "aac" && duration > 0 && duration <= 180, "Master must have an AAC track and run at most 180s.");
  const cover = probe(thumbnail).streams.find((track) => track.codec_type === "video");
  assert(cover?.width === 1280 && cover.height === 720, "The thumbnail must be 1280×720.");

  mkdirSync(qa, { recursive: true });
  const sampleSpan = Math.floor(duration * fps / 5);
  const frames = [0, ...Array.from({ length: 5 }, (_, index) => index * sampleSpan + randomInt(1, sampleSpan))];
  const samples = frames.map((frame, index) => {
    const time = (frame / fps).toFixed(3);
    const file = `sample-${index}-${time}s.png`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", time, "-i", master, "-frames:v", "1", "-update", "1", resolve(qa, file)]);
    return { time, file };
  });
  writeFileSync(resolve(qa, "probe.json"), JSON.stringify({ metadata, samples }, null, 2) + "\n");
  console.log(`Master verified at ${duration}s · ${master}\nThumbnail · ${thumbnail}\nFirst frame and five samples · ${qa}`);
}

try {
  const [mode, manifestArg] = process.argv.slice(2);
  assert(["ingest", "preview", "picture", "render"].includes(mode), "Choose ingest, preview, picture, or render.");
  const manifest = manifestArg ? resolve(process.env.INIT_CWD ?? process.cwd(), manifestArg) : resolve(footageDir, "edit.json");
  const picture = mode === "picture";
  const prefix = picture ? "ROACLAW_PICTURE_REVIEW" : "ROACLAW_BuildHybridAI_2026";
  const srt = resolve(outputDir, prefix + "_EN.srt");
  const master = resolve(outputDir, picture ? prefix + ".mp4" : prefix + "_FINAL.mp4");
  const thumbnail = resolve(outputDir, prefix + "_THUMBNAIL.png");
  const { folder, props, requireAudio } = ingest(manifest, srt);
  if (mode === "preview") {
    const preview = resolve(outputDir, "ROACLAW_preview.png");
    const device = props.segments.find((segment) => segment.kind === "device");
    runRemotion(["still", entry, "ROACLAW-Demo", preview, `--frame=${device.from + device.duration - 10}`], folder);
    console.log(`Preview · ${preview}`);
  }
  if (mode === "render" || picture) {
    if (requireAudio && !picture) {
      assert((props.voiceover || props.segments.some((segment) => segment.narration)) && props.score,
        "The final render requires an approved voiceover and score. Use picture for the silent review.");
    }
    runRemotion(["render", entry, "ROACLAW-Demo", master, "--codec=h264", "--audio-codec=aac", "--enforce-audio-track", "--crf=17", "--concurrency=2"], folder);
    runRemotion(["still", entry, "ROACLAW-Thumbnail", thumbnail, "--frame=0"], folder);
    verifyMaster(master, thumbnail, resolve(outputDir, picture ? "picture-review-qa" : "qa"));
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

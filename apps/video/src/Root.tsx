import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import { AbsoluteFill, Composition, Html5Audio, Img, OffthreadVideo, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "remotion";
import type { CSSProperties } from "react";
import { beats, fps, outroFrames } from "./edit.mjs";
import { SubmissionFilm, type FilmProps } from "./Film";

type Beat = keyof typeof beats;
type Segment = {
  kind: Beat;
  file: string;
  still: boolean;
  narration?: string;
  startFrame: number;
  duration: number;
  from: number;
  chapterFrom?: number;
  chapterDuration: number;
  zoom: number;
  focus: "top" | "center" | "left" | "right" | "bottom";
  width: number;
  height: number;
};

type DemoProps = {
  segments: Segment[];
  duration: number;
  demoUrl: string;
  cover: { kind: Beat; frame: number } | null;
  score?: string;
  voiceover?: string;
};

const tokens = {
  canvas: "#f1f1f0",
  surface: "#fbfbfa",
  ink: "#222325",
  night: "#18191b",
  signal: "#ff6749",
  border: "#cdccca",
  muted: "#545355",
  text: "IBM Plex Sans, sans-serif",
  mono: "IBM Plex Mono, monospace",
};

function Wordmark({ size = 34 }: { size?: number }) {
  return <div style={{ display: "flex", alignItems: "center", gap: size * 0.315 }}>
    <span style={{ display: "grid", placeContent: "center", width: size, height: size, gap: size * 0.105, background: tokens.signal }} aria-hidden="true">
      {[0, 0.11, -0.07].map((offset) => <i key={offset} style={{ width: size * 0.5, height: size * 0.075, background: tokens.ink, transform: `translateX(${size * offset}px) skewX(-30deg)` }} />)}
    </span>
    <span style={{ fontFamily: tokens.text, fontWeight: 600, letterSpacing: "0.105em", fontSize: size }}>ROACLAW</span>
  </div>;
}

function RecordedMedia({ segment, stillFrame }: { segment: Segment; stillFrame?: number }) {
  const src = staticFile(segment.file);
  const style: CSSProperties = {
    width: "100%", height: "100%", objectFit: "contain", display: "block",
    transform: stillFrame === undefined ? `scale(${segment.zoom})` : undefined,
    transformOrigin: segment.focus,
  };
  if (segment.still) return <Img src={src} style={style} />;
  return <OffthreadVideo
    src={src}
    trimBefore={stillFrame ?? segment.startFrame}
    durationInFrames={stillFrame === undefined ? segment.duration : 1}
    muted
    style={style}
  />;
}

function Footage({ segment }: { segment: Segment }) {
  const beat = beats[segment.kind];
  const narrow = segment.width / segment.height < 0.8;
  const frame = useCurrentFrame();
  const emphasis = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const line = interpolate(frame, [0, 17], [.02, 1], { extrapolateRight: "clamp" });

  return <AbsoluteFill style={{ background: tokens.canvas, color: tokens.ink, fontFamily: tokens.text }}>
    <header style={{ position: "absolute", inset: "0 54px auto", height: 71, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Wordmark size={25} />
      <div style={{ fontFamily: tokens.mono, fontSize: 23, display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ width: 18, height: 3, background: tokens.signal }} />{beat.label}{segment.still && " · Confirmed capture"}
      </div>
    </header>
    <div style={{ position: "absolute", inset: "71px 54px 137px", overflow: "hidden", border: `1px solid ${tokens.border}`, background: tokens.surface }}>
      {narrow ? <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
        <div style={{ padding: "0 90px", fontSize: 76, fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.04em", textWrap: "balance" }}>{beat.title}</div>
        <div style={{ height: "100%", overflow: "hidden" }}><RecordedMedia segment={segment} /></div>
      </div> : <RecordedMedia segment={segment} />}
    </div>
    <div style={{ position: "absolute", inset: "auto 54px 19px", display: "grid", gridTemplateColumns: "66px minmax(0,1fr)",
      alignItems: "center", gap: 27, minHeight: 98, padding: "16px 31px", color: tokens.surface, background: tokens.night }}>
      <span style={{ width: 58, height: 4, background: tokens.signal, transform: `scaleX(${line})`, transformOrigin: "left" }} aria-hidden="true" />
      <span style={{ maxWidth: 1540, fontSize: 37, lineHeight: 1.16, fontWeight: 600, textWrap: "balance",
        transform: `translateY(${(1 - emphasis) * 4}px)` }}>{beat.caption}</span>
    </div>
    {segment.narration && <Html5Audio src={staticFile(segment.narration)} />}
  </AbsoluteFill>;
}

function Chapter({ heading }: { heading: string }) {
  const frame = useCurrentFrame();
  const stretch = interpolate(frame, [0, 10], [.08, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: tokens.night, color: tokens.surface, justifyContent: "center", padding: "0 175px", fontFamily: tokens.text }}>
    <div style={{ width: 104, height: 5, background: tokens.signal, marginBottom: 46, transform: `scaleX(${stretch})`, transformOrigin: "left" }} />
    <div style={{ fontSize: 104, lineHeight: 1.03, fontWeight: 600, letterSpacing: "-0.045em" }}>{heading}</div>
  </AbsoluteFill>;
}

function Outro({ demoUrl }: { demoUrl: string }) {
  return <AbsoluteFill style={{ background: tokens.night, color: tokens.surface, justifyContent: "center", padding: "0 174px", fontFamily: tokens.text }}>
    <Wordmark size={42} />
    <div style={{ margin: "55px 0 29px", fontSize: 108, lineHeight: 1.03, fontWeight: 600, letterSpacing: "-0.045em" }}>Try the Growth Audit</div>
    <div style={{ margin: "9px 0 35px", width: 111, height: 5, background: tokens.signal }} />
    <div style={{ fontFamily: tokens.mono, fontSize: 30 }}>{demoUrl.replace(/^https:\/\//, "")}</div>
  </AbsoluteFill>;
}

function Demo({ segments, duration, demoUrl, score, voiceover }: DemoProps) {
  const narrationWindows = segments.filter((scene) => scene.narration);
  const scoreVolume = (frame: number) => {
    const fadeIn = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(frame, [duration - 60, duration - 1], [1, 0], { extrapolateLeft: "clamp" });
    const narrationProximity = narrationWindows.reduce((gain, scene) => {
      const window = interpolate(frame, [scene.from - 12, scene.from, scene.from + scene.duration, scene.from + scene.duration + 12],
        [1, 0.47, 0.47, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return Math.min(gain, window);
    }, 1);
    return (voiceover ? .14 : .26 * narrationProximity) * fadeIn * fadeOut;
  };
  return <AbsoluteFill style={{ background: tokens.night }}>
    {score && <Html5Audio src={staticFile(score)} volume={scoreVolume} />}
    {voiceover && <Html5Audio src={staticFile(voiceover)} />}
    {segments.map((segment) => {
      const beat = beats[segment.kind];
      return <div key={segment.kind}>
        {"chapter" in beat && segment.chapterFrom !== undefined && <Sequence name={beat.chapter} from={segment.chapterFrom} durationInFrames={segment.chapterDuration}>
          <Chapter heading={beat.chapter} />
        </Sequence>}
        <Sequence name={beat.title} from={segment.from} durationInFrames={segment.duration}><Footage segment={segment} /></Sequence>
      </div>;
    })}
    <Sequence name="ROACLAW and demo URL" from={duration - outroFrames} durationInFrames={outroFrames}><Outro demoUrl={demoUrl} /></Sequence>
  </AbsoluteFill>;
}

function Thumbnail({ segments, cover }: DemoProps) {
  const segment = segments.find((candidate) => candidate.kind === cover?.kind);
  return <AbsoluteFill style={{ background: tokens.night, color: tokens.surface, fontFamily: tokens.text }}>
    <div style={{ position: "absolute", top: 56, left: 60 }}><Wordmark size={28} /></div>
    <div style={{ position: "absolute", top: 166, left: 58, width: 420 }}>
      <div style={{ width: 76, height: 5, background: tokens.signal, marginBottom: 29 }} />
      <div style={{ fontSize: 58, lineHeight: 1.03, fontWeight: 600, letterSpacing: "-0.045em", whiteSpace: "nowrap" }}><span style={{ color: tokens.signal }}>$99</span> in the ad<br /><span style={{ color: tokens.signal }}>$119</span> on the page</div>
      <div style={{ marginTop: 31, fontFamily: tokens.mono, fontSize: 22, color: tokens.canvas }}>Growth Audit demo</div>
    </div>
    {segment && cover && <div style={{
      position: "absolute", left: 508, top: 123, width: 733, height: 478, overflow: "hidden",
      border: `2px solid ${tokens.border}`, background: tokens.surface,
    }}><RecordedMedia segment={segment} stillFrame={cover.frame} /></div>}
  </AbsoluteFill>;
}

const emptyProps: DemoProps = { segments: [], duration: outroFrames, demoUrl: "", cover: null };
const emptyFilm: FilmProps = { shots: [], subtitles: [], duration: 30, image: "" };

function Root() {
  return <>
    <Composition id="ROACLAW-Demo" component={Demo} width={1920} height={1080} fps={fps} durationInFrames={outroFrames}
      defaultProps={emptyProps} calculateMetadata={({ props }) => ({ durationInFrames: props.duration })} />
    <Composition id="ROACLAW-Thumbnail" component={Thumbnail} width={1280} height={720} fps={fps} durationInFrames={1}
      defaultProps={emptyProps} />
    <Composition id="ROACLAW-Submission-Film" component={SubmissionFilm} width={1920} height={1080} fps={fps}
      durationInFrames={30} defaultProps={emptyFilm} calculateMetadata={({ props }) => ({ durationInFrames: props.duration })} />
  </>;
}

registerRoot(Root);

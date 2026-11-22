import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import { AbsoluteFill, Composition, Html5Audio, Img, OffthreadVideo, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "remotion";
import type { CSSProperties } from "react";
import { beats, fps, outroFrames } from "./edit.mjs";

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
};

const tokens = {
  canvas: "#F4F7FB",
  surface: "#FFFFFF",
  ink: "#14243D",
  navy: "#132642",
  signal: "#1853D8",
  border: "#CBD8E5",
  muted: "#4C5B70",
  text: "IBM Plex Sans, sans-serif",
  mono: "IBM Plex Mono, monospace",
};

function Wordmark({ size = 34 }: { size?: number }) {
  return <div style={{ display: "flex", alignItems: "center", gap: size * 0.315 }}>
    <span style={{ display: "grid", placeContent: "center", width: size, height: size, gap: size * 0.105, background: tokens.signal }} aria-hidden="true">
      {[0, 0.11, -0.07].map((offset) => <i key={offset} style={{ width: size * 0.5, height: size * 0.075, background: tokens.surface, transform: `translateX(${size * offset}px) skewX(-30deg)` }} />)}
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

  return <AbsoluteFill style={{ background: tokens.canvas, color: tokens.ink, fontFamily: tokens.text }}>
    <header style={{ position: "absolute", inset: "0 54px auto", height: 71, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Wordmark size={25} />
      <div style={{ fontFamily: tokens.mono, fontSize: 23, display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ width: 10, height: 10, background: tokens.signal }} />{beat.label}{segment.still && " · QA still"}
      </div>
    </header>
    <div style={{ position: "absolute", inset: "71px 54px 137px", overflow: "hidden", border: `1px solid ${tokens.border}`, background: tokens.surface }}>
      {narrow ? <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
        <div style={{ padding: "0 90px", fontSize: 76, fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.04em", textWrap: "balance" }}>{beat.title}</div>
        <div style={{ height: "100%", overflow: "hidden" }}><RecordedMedia segment={segment} /></div>
      </div> : <RecordedMedia segment={segment} />}
    </div>
    <div style={{ position: "absolute", inset: "auto 111px 30px", display: "grid", placeItems: "center", height: 84, textAlign: "center" }}>
      <span style={{ maxWidth: 1620, fontSize: 37, lineHeight: 1.16, fontWeight: 600, textWrap: "balance" }}>{beat.caption}</span>
    </div>
    {segment.narration && <Html5Audio src={staticFile(segment.narration)} />}
  </AbsoluteFill>;
}

function Chapter({ heading }: { heading: string }) {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [0, 9], [10, 104], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: tokens.navy, color: tokens.surface, justifyContent: "center", padding: "0 175px", fontFamily: tokens.text }}>
    <div style={{ width, height: 5, background: tokens.signal, marginBottom: 46 }} />
    <div style={{ fontSize: 104, lineHeight: 1.03, fontWeight: 600, letterSpacing: "-0.045em" }}>{heading}</div>
  </AbsoluteFill>;
}

function Outro({ demoUrl }: { demoUrl: string }) {
  return <AbsoluteFill style={{ background: tokens.navy, color: tokens.surface, justifyContent: "center", padding: "0 174px", fontFamily: tokens.text }}>
    <Wordmark size={42} />
    <div style={{ margin: "55px 0 29px", fontSize: 108, lineHeight: 1.03, fontWeight: 600, letterSpacing: "-0.045em" }}>Try the Growth Audit</div>
    <div style={{ margin: "9px 0 35px", width: 111, height: 5, background: tokens.signal }} />
    <div style={{ fontFamily: tokens.mono, fontSize: 30 }}>{demoUrl.replace(/^https:\/\//, "")}</div>
  </AbsoluteFill>;
}

function Demo({ segments, duration, demoUrl }: DemoProps) {
  return <AbsoluteFill style={{ background: tokens.navy }}>
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
  return <AbsoluteFill style={{ background: tokens.canvas, color: tokens.ink, fontFamily: tokens.text }}>
    <div style={{ position: "absolute", top: 56, left: 60 }}><Wordmark size={28} /></div>
    <div style={{ position: "absolute", top: 166, left: 58, width: 420 }}>
      <div style={{ width: 76, height: 5, background: tokens.signal, marginBottom: 29 }} />
      <div style={{ fontSize: 58, lineHeight: 1.03, fontWeight: 600, letterSpacing: "-0.045em", whiteSpace: "nowrap" }}><span style={{ color: tokens.signal }}>$99</span> in the ad<br /><span style={{ color: tokens.signal }}>$119</span> on the page</div>
      <div style={{ marginTop: 31, fontFamily: tokens.mono, fontSize: 22, color: tokens.muted }}>Growth Audit demo</div>
    </div>
    {segment && cover && <div style={{
      position: "absolute", left: 508, top: 123, width: 733, height: 478, overflow: "hidden",
      border: `2px solid ${tokens.border}`, background: tokens.surface,
    }}><RecordedMedia segment={segment} stillFrame={cover.frame} /></div>}
  </AbsoluteFill>;
}

const emptyProps: DemoProps = { segments: [], duration: outroFrames, demoUrl: "", cover: null };

function Root() {
  return <>
    <Composition id="ROACLAW-Demo" component={Demo} width={1920} height={1080} fps={fps} durationInFrames={outroFrames}
      defaultProps={emptyProps} calculateMetadata={({ props }) => ({ durationInFrames: props.duration })} />
    <Composition id="ROACLAW-Thumbnail" component={Thumbnail} width={1280} height={720} fps={fps} durationInFrames={1}
      defaultProps={emptyProps} />
  </>;
}

registerRoot(Root);

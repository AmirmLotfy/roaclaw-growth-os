import { AbsoluteFill, Easing, Html5Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";

export type FilmMedia = {
  file: string;
  sourceWidth: number;
  sourceHeight: number;
  crop?: readonly [number, number, number, number];
  start?: number;
  rate?: number;
};
type Shot = {
  from: number;
  to: number;
  title: string;
  section?: string;
  detail?: string;
  value?: string;
  contrast?: string;
  media?: FilmMedia;
  layout: 'intro' | 'quote' | 'split' | 'wide' | 'panel' | 'numbers' | 'outro';
  light?: boolean;
};
type Subtitle = { from: number; to: number; text: string };
export type FilmProps = {
  shots: Shot[];
  subtitles: Subtitle[];
  duration: number;
  image: string;
  audio?: string;
};

const night = "#171e19";
const paper = "#edf1ec";
const lime = "#d8f479";
const line = "#586c5d";
const darkGreen = "#35614a";
const type = "IBM Plex Sans, sans-serif";
const mono = "IBM Plex Mono, monospace";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const exitCurve = Easing.bezier(.23, 1, .32, 1);

function Logo({ dark = false }: { dark?: boolean }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 12, color: dark ? night : paper }}>
    <div style={{ width: 34, height: 34, background: lime, display: "grid", alignContent: "center", justifyItems: "center", gap: 4 }}>
      {[18, 14, 18].map((width, index) => <span key={index} style={{ width, height: 3, background: night, transform: `translateX(${index === 1 ? 3 : 0}px) skewX(-28deg)` }} />)}
    </div>
    <strong style={{ fontSize: 30, letterSpacing: "0.12em" }}>ROACLAW</strong>
  </div>;
}

function Screen({ media, width, height }: { media: FilmMedia; width: number; height: number }) {
  const frame = useCurrentFrame();
  const [x, y, w, h] = media.crop ?? [0, 0, media.sourceWidth, media.sourceHeight];
  const scale = Math.max(width / w, height / h);
  const camera = interpolate(frame, [0, 95], [1.025, 1], { ...clamp, easing: exitCurve });
  const mediaStyle = {
    position: "absolute" as const, width: media.sourceWidth * scale, height: media.sourceHeight * scale,
    left: -(x * scale) + (width - w * scale) / 2, top: -(y * scale) + (height - h * scale) / 2,
    display: "block", objectFit: "fill" as const,
  };
  const src = staticFile(media.file);
  return <div style={{ width, height, background: paper, overflow: "hidden", position: "relative" }}>
    <div style={{ width, height, position: "relative", transform: `scale(${camera})` }}>
      {media.file.endsWith(".png") || media.file.endsWith(".webp")
        ? <Img src={src} style={mediaStyle} />
        : <OffthreadVideo src={src} trimBefore={Math.round((media.start ?? 0) * 30)} playbackRate={media.rate ?? 1} style={mediaStyle} muted />}
    </div>
  </div>;
}

function ScreenReveal({ media, width, height }: { media: FilmMedia; width: number; height: number }) {
  const frame = useCurrentFrame();
  const crop = interpolate(frame, [0, 15], [18, 0], { ...clamp, easing: exitCurve });
  const offset = interpolate(frame, [0, 20], [48, 0], { ...clamp, easing: exitCurve });
  return <div style={{ border: "1px solid #829484", lineHeight: 0, clipPath: `inset(0 0 ${crop}% 0)`, transform: `translateY(${offset}px)` }}>
    <Screen {...{ media, width, height }} />
  </div>;
}

function FilmShot({ shot, image }: { shot: Shot; image: string }) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: exitCurve });
  const compact = shot.layout === "wide";
  const dark = !shot.light;
  const color = dark ? paper : night;
  const accent = dark ? lime : darkGreen;
  const stageText = { opacity: Math.max(.15, progress), transform: `translateY(${(1 - progress) * 25}px)` };

  if (shot.layout === "outro") return <AbsoluteFill style={{ background: lime, color: night, padding: "85px 94px" }}>
    <Logo dark />
    <div style={{ marginTop: 143, ...stageText }}>
      <div style={{ fontSize: 124, fontWeight: 600, lineHeight: .94, letterSpacing: "-0.07em", maxWidth: 1480 }}>{shot.title}</div>
      <p style={{ margin: "34px 0 18px", fontSize: 45, fontWeight: 600 }}>{shot.detail}</p>
      <p style={{ margin: 0, fontFamily: mono, fontSize: 35 }}>{shot.value}</p>
    </div>
    <div style={{ position: "absolute", bottom: 180, left: 94, right: 94, height: 2, background: night, transform: `scaleX(${progress})`, transformOrigin: "left" }} />
  </AbsoluteFill>;

  if (shot.layout === "intro" || shot.layout === "quote") {
    const artScale = interpolate(frame, [0, 79], [1.09, 1], { ...clamp, easing: exitCurve });
    return <AbsoluteFill style={{ background: dark ? night : paper, color }}>
      <div style={{ position: "absolute", inset: "0 0 138px 48%", overflow: "hidden" }}>
        <Img src={staticFile(image)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", transform: `scale(${artScale})` }} />
        <div style={{ position: "absolute", left: 0, right: 0, height: 2, bottom: 122, background: lime, transformOrigin: "left", transform: `scaleX(${progress})` }} />
        <div style={{ position: "absolute", bottom: 78, left: 28, background: night, color: paper, fontFamily: mono, fontSize: 18, padding: "7px 12px" }}>Sable &amp; Stem · Demo campaign</div>
      </div>
      <div style={{ position: "absolute", top: 61, left: 72 }}><Logo dark={!dark} /></div>
      <div style={{ position: "absolute", top: shot.value ? 238 : 247, left: 72, width: 795, ...stageText }}>
        <div style={{ color: accent, fontFamily: mono, fontSize: 25, marginBottom: 25 }}>{shot.section}</div>
        {shot.value && <div style={{ color: accent, fontSize: 213, lineHeight: .93, letterSpacing: "-0.095em", fontWeight: 600 }}>{shot.value}</div>}
        <div style={{ fontSize: shot.value ? 78 : 105, fontWeight: 600, lineHeight: .95, letterSpacing: "-0.055em", whiteSpace: "pre-line" }}>{shot.title}</div>
      </div>
    </AbsoluteFill>;
  }

  if (shot.layout === "numbers") return <AbsoluteFill style={{ background: paper, color: night, padding: "60px 73px" }}>
    <Logo dark />
    <div style={{ marginTop: 106, ...stageText }}>
      <div style={{ fontFamily: mono, fontSize: 26, color: darkGreen }}>{shot.section}</div>
      <div style={{ fontSize: 77, fontWeight: 600, letterSpacing: "-0.055em", marginTop: 18 }}>{shot.title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 46, borderTop: `2px solid ${darkGreen}`, borderBottom: `2px solid ${darkGreen}`, paddingBlock: 30 }}>
        <div><span style={{ fontFamily: mono, fontSize: 24 }}>Observed</span><div style={{ fontSize: 132, fontWeight: 600, lineHeight: .96, letterSpacing: "-0.075em" }}>{shot.value}</div></div>
        <div><span style={{ fontFamily: mono, fontSize: 24 }}>Target</span><div style={{ fontSize: 132, fontWeight: 600, lineHeight: .96, letterSpacing: "-0.075em" }}>{shot.contrast}</div></div>
      </div>
      <p style={{ fontSize: 32, color: darkGreen }}>{shot.detail}</p>
    </div>
  </AbsoluteFill>;

  const panel = shot.layout === "panel";
  const mediaWidth = panel ? 370 : compact ? 1580 : 1102;
  const mediaHeight = panel ? 747 : compact ? 628 : 675;
  return <AbsoluteFill style={{ color, background: dark ? night : paper }}>
    <div style={{ position: "absolute", top: 53, left: 72, right: 72, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Logo dark={!dark} />
      <span style={{ fontFamily: mono, fontSize: 23, color: accent }}>{shot.section}</span>
    </div>
    <div style={{ position: "absolute", top: 120, left: 72, right: 72, height: 1, background: dark ? line : "#9ead9d" }} />
    <div style={{ position: "absolute", top: compact ? 143 : panel ? 145 : 188, left: compact ? 170 : panel ? 1136 : 745, right: compact ? 170 : 70 }}>
      {compact && <div style={{ fontSize: 47, marginBottom: 20, letterSpacing: "-0.035em", fontWeight: 600, ...stageText }}>{shot.title}</div>}
      {shot.media && <ScreenReveal media={shot.media} width={mediaWidth} height={mediaHeight} />}
    </div>
    {!compact && <div style={{ position: "absolute", top: panel ? 299 : 269, left: 72, width: panel ? 906 : 630, ...stageText }}>
      <div style={{ height: 5, width: 87, background: accent, marginBottom: 25 }} />
      <div style={{ fontSize: panel ? 103 : 92, fontWeight: 600, lineHeight: .97, letterSpacing: "-0.059em", whiteSpace: "pre-line" }}>{shot.title}</div>
      {shot.detail && <p style={{ marginTop: 25, maxWidth: 630, fontSize: 32, lineHeight: 1.26, color: dark ? "#c5d3c6" : "#354e3e" }}>{shot.detail}</p>}
    </div>}
  </AbsoluteFill>;
}

export function SubmissionFilm({ shots, subtitles, image, audio }: FilmProps) {
  const frame = useCurrentFrame();
  const subtitle = subtitles.find(({ from, to }) => frame >= from && frame < to);
  return <AbsoluteFill style={{ fontFamily: type, background: night }}>
    {shots.map((shot) => <Sequence key={shot.from} name={shot.title} from={shot.from} durationInFrames={shot.to - shot.from}>
      <FilmShot shot={shot} image={image} />
    </Sequence>)}
    {audio && <Html5Audio src={staticFile(audio)} />}
    {subtitle && <div style={{
      position: "absolute", left: 185, right: 185, bottom: 33, textAlign: "center",
      fontSize: 35, lineHeight: 1.18, fontWeight: 600, color: paper,
    }}><span style={{ display: "inline-block", maxWidth: 1420, padding: "11px 23px", background: "#151c17", whiteSpace: "pre-line" }}>{subtitle.text}</span></div>}
  </AbsoluteFill>;
}

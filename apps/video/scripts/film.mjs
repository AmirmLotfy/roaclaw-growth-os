import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { captions, duration, insertDuration, narrationCut, shots } from '../../../video/film-edit.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const packageDir = resolve(root, 'apps/video');
const source = resolve(root, '.local/film');
const mediaDir = resolve(source, 'media');
const out = resolve(root, '.local/video');
const prefix = resolve(out, 'ROACLAW_CAMPAIGN_PREFLIGHT_FILM');
const props = resolve(source, 'film-props.json');
const assets = {
  'ceramic-vase-set.webp': 'apps/web/public/ceramic-vase-set.webp',
  'growth-web.webm': '.local/footage/roaclaw-web.webm',
  'growth-chrome.mp4': '.local/footage/roaclaw-chrome-panel.mp4',
  'growth-pair.png': 'qa/evidence/g3-web/01-pairing.png',
  'growth-receipt.png': '.local/footage/picture-dashboard-receipt.png',
  'growth-lead.png': '.local/footage/picture-lead-audit.png',
  'growth-memory.png': 'qa/evidence/g3-web/07-web-memory.png',
  'preflight-web.webm': '.local/film/preflight-web.webm',
  'preflight-panel.mp4': '.local/film/preflight-panel.mp4',
  'preflight-proof.png': '.local/film/03-preflight-result.png',
};
const runtimeAssets = ['narration.wav', 'music.mp3'].map((filename) => resolve(source, filename));
if (runtimeAssets.some((path) => !existsSync(path))) throw new Error('Place the supplied narration.wav and music.mp3 in .local/film.');
mkdirSync(mediaDir, { recursive: true });
mkdirSync(out, { recursive: true });
for (const [name, from] of Object.entries(assets)) copyFileSync(resolve(root, from), resolve(mediaDir, name));

function run(command, args, cwd = root) {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

const left = narrationCut + insertDuration;
const gain =
  `[0:a]asplit=2[earlier][later];` +
  `[earlier]atrim=end=${narrationCut},asetpts=PTS-STARTPTS[a];` +
  `[later]atrim=start=${narrationCut},asetpts=PTS-STARTPTS,adelay=${Math.round(left * 1000)}:all=1[b];` +
  `[a][b]amix=inputs=2:normalize=0,apad=whole_dur=${duration},atrim=end=${duration},highpass=f=70,acompressor=threshold=0.12:ratio=2:attack=8:release=120,aformat=channel_layouts=stereo,asplit=2[voice][key];` +
  `[1:a]atrim=end=${duration},highpass=f=40,volume=0.22,afade=t=in:st=0:d=0.35,afade=t=out:st=${duration - 2.8}:d=2.8[music];` +
  `[music][key]sidechaincompress=threshold=0.022:ratio=9:attack=15:release=360[bed];` +
  `[voice][bed]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.6:LRA=9[mix]`;
run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', runtimeAssets[0], '-i', runtimeAssets[1],
  '-filter_complex', gain, '-map', '[mix]', '-t', String(duration), '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', resolve(mediaDir, 'mix.wav')]);

if (shots[0]?.from !== 0 || shots.at(-1)?.to !== duration * 30 ||
  shots.some((shot, index) => shot.to <= shot.from || (index > 0 && shots[index - 1].to !== shot.from))) {
  throw new Error('The film timeline must cover the full runtime without gaps or overlaps.');
}
const subtitles = captions.map(([from, to, text]) => ({ from: Math.round(from * 30), to: Math.round(to * 30), text }));
if (subtitles.some(({ from, to }, index) => to <= from || (index > 0 && subtitles[index - 1].to > from))) {
  throw new Error('Review the caption timing overlaps.');
}
function timestamp(frame) {
  const ms = Math.round(frame * 1000 / 30);
  return new Date(ms).toISOString().slice(11, 23).replace('.', ',');
}
writeFileSync(prefix + '.srt', subtitles.map(({ from, to, text }, index) =>
  `${index + 1}\n${timestamp(from)} --> ${timestamp(to)}\n${text}\n`).join('\n'));
writeFileSync(props, JSON.stringify({ duration: duration * 30, shots, subtitles, image: 'ceramic-vase-set.webp', audio: 'mix.wav' }, null, 2));
const remotion = resolve(packageDir, 'node_modules/.bin/remotion');
const composition = ['src/Root.tsx', 'ROACLAW-Submission-Film'];
const shared = [`--public-dir=${mediaDir}`, `--props=${props}`,
  ...(process.env.ROACLAW_VIDEO_CHROME ? [`--browser-executable=${process.env.ROACLAW_VIDEO_CHROME}`] : [])];

if (process.argv.includes('--stills')) {
  for (const position of [2, 14, 25, 62, 108, 114, 122]) {
    run(remotion, ['still', ...composition, resolve(source, `preview-${position}.png`), `--frame=${position * 30}`, ...shared], packageDir);
  }
} else {
  run(remotion, ['render', ...composition, prefix + '.mp4', '--codec=h264', '--audio-codec=aac', '--crf=18', '--concurrency=3', ...shared], packageDir);
  run('ffmpeg', ['-hide_banner', '-v', 'error', '-xerror', '-i', prefix + '.mp4', '-f', 'null', '-']);
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', '2.8', '-i', prefix + '.mp4', '-vf', 'scale=1280:-2', '-frames:v', '1', '-update', '1', prefix + '_THUMBNAIL.png']);
}

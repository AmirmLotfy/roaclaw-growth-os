import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Run with ImageMagick 7 after installing the workspace's web dependencies.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, '.local/video');
const photo = join(root, 'apps/web/public/ceramic-vase-set.webp');
const fonts = join(root, 'apps/web/node_modules/@fontsource');
const display = join(fonts, 'archivo-black/files/archivo-black-latin-400-normal.woff');
const sans = join(fonts, 'ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff');
const mono = join(fonts, 'ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff');

const graphite = '#18191b';
const white = '#f1f1f0';
const orange = '#ff6749';
const grey = '#b6b6b5';
const rule = '#4a4a49';

const work = mkdtempSync(join(tmpdir(), 'roaclaw-thumbnails-'));
let layerNumber = 0;
const layerPath = () => join(work, `layer-${++layerNumber}.png`);

function magick(...args) {
  return execFileSync('magick', args, { encoding: 'utf8' }).trim();
}

class Layout {
  constructor(width, height) {
    this.args = ['-size', `${width}x${height}`, `xc:${graphite}`];
  }

  place(path, x, y) {
    this.args.push(path, '-gravity', 'NorthWest', '-geometry', `+${x}+${y}`, '-composite');
  }

  type(label, font, size, x, y, color = white) {
    const path = layerPath();
    magick('-background', 'none', '-fill', color, '-font', font, '-pointsize', `${size}`,
      `label:${label}`, '-trim', '+repage', path);
    this.place(path, x, y);
  }

  image(source, width, height, x, y, crop = null) {
    const path = layerPath();
    const cropArgs = crop ? ['-crop', crop, '+repage'] : [];
    magick(source, ...cropArgs, '-colorspace', 'gray', '-contrast-stretch', '0.4%x0.4%',
      '-colorspace', 'sRGB', '-filter', 'Lanczos', '-resize', `${width}x${height}^`,
      '-gravity', 'center', '-extent', `${width}x${height}`, path);
    this.place(path, x, y);
  }

  draw(color, geometry) {
    this.args.push('-fill', color, '-stroke', 'none', '-draw', geometry);
  }

  export(name, ...options) {
    const destination = join(output, name);
    magick(...this.args, '-strip', '-colorspace', 'sRGB', ...options, destination);
    return destination;
  }
}

function devpostCover() {
  const art = new Layout(1800, 1200);
  art.image(photo, 730, 922, 970, 100);
  art.type('SABLE & STEM  /  DEMO STORE', mono, 29, 970, 1059, grey);

  art.type('ROACLAW', display, 145, 106, 134);
  art.type('Campaign', sans, 119, 110, 334);
  art.type('Preflight', sans, 119, 110, 451);

  art.draw(rule, 'rectangle 108,751 899,753');
  art.type('IN THE AD', mono, 44, 111, 802, grey);
  art.type('ON THE PAGE', mono, 44, 518, 802, grey);
  art.type('$99', display, 144, 106, 879);
  art.type('$119', display, 144, 512, 879, orange);
  art.draw(white, 'polygon 410,937 460,937 447,924 453,918 477,942 453,966 447,960 460,947 410,947');
  return art.export('ROACLAW_DEVPOST_3X2.png', '-define', 'png:color-type=2');
}

function youtubeCover() {
  const art = new Layout(3840, 2160);
  art.image(photo, 1062, 1740, 2778, 0, '820x925+58+57');
  art.type('ROACLAW', display, 102, 218, 185);
  art.type('CAMPAIGN PREFLIGHT', mono, 62, 834, 204, grey);

  art.type('$99', display, 580, 208, 449);
  art.type('IN THE AD', mono, 132, 1790, 655);
  art.draw(rule, 'rectangle 218,1058 2651,1063');
  art.type('$119', display, 580, 208, 1180, orange);
  art.type('ON THE PAGE', mono, 132, 1790, 1386);

  return art.export('ROACLAW_YOUTUBE_16X9.jpg', '-sampling-factor', '4:4:4', '-quality', '91');
}

function checkImage(path, width, height, byteLimit = Infinity) {
  const pixels = magick('identify', '-format', '%wx%h', path);
  const bytes = statSync(path).size;
  if (pixels !== `${width}x${height}` || bytes >= byteLimit) {
    throw new Error(`Unexpected export ${path} at ${pixels}, ${bytes} bytes`);
  }
  const name = basename(path, extname(path));
  for (const previewWidth of [width === 1800 ? 900 : 960, 320]) {
    magick(path, '-resize', `${previewWidth}x`, join(output, `${name}_${previewWidth}_PREVIEW.png`));
  }
  console.log(`${path} (${pixels}, ${bytes} bytes)`);
}

try {
  mkdirSync(output, { recursive: true });
  checkImage(devpostCover(), 1800, 1200);
  checkImage(youtubeCover(), 3840, 2160, 2_000_000);
} finally {
  rmSync(work, { recursive: true, force: true });
}

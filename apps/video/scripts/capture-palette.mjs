import { writeFileSync } from 'node:fs';

const clamp = (value) => Math.min(1, Math.max(0, value));

export function writeCapturePalette(path) {
  const size = 32;
  const lines = ['TITLE "ROACLAW capture color grade"', `LUT_3D_SIZE ${size}`];
  for (let blue = 0; blue < size; blue += 1) {
    for (let green = 0; green < size; green += 1) {
      for (let red = 0; red < size; red += 1) {
        const [r, g, b] = [red, green, blue].map((channel) => channel / (size - 1));
        const light = r * .2126 + g * .7152 + b * .0722;
        // Keep captured values, layout, and pixels spatially intact. Neutralize cool
        // colors and carry the previous lime action treatment into the new brand.
        const oldAction = clamp((g - b - .12) / .28) * clamp((r - .45) / .3) * clamp((g - r + .03) / .10);
        const warm = clamp((r - g) * 18) * clamp((r - b) * 15);
        const base = [r, g, b].map((channel) => light + (channel - light) * warm);
        const accent = [.998, .404, .286];
        lines.push(base.map((channel, index) => (channel + (accent[index] - channel) * oldAction).toFixed(6)).join(' '));
      }
    }
  }
  writeFileSync(path, lines.join('\n') + '\n');
}

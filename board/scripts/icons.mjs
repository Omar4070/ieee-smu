/**
 * Draws the board app's icons into board/public/: the browser tab icon, the phone home-screen
 * icons (Android and iPhone) and the "maskable" one Android crops to a circle or a squircle.
 * The mark is the chapter's three-phase wave on the chapter's navy (never black: owner's rule).
 *
 * Run from the repository root after `npm install` there (it uses the website's `sharp`):
 *   node board/scripts/icons.mjs
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const navy = '#0f1c2e';
// lighter tints of the society colours, so thin lines read on navy (logo order)
const colours = ['#2fae55', '#ff7a2f', '#5b8fd6'];
const segment = (x) => `M${x} 4C${x + 5} 4 ${x + 5} 20 ${x + 8} 20C${x + 11} 20 ${x + 11} 4 ${x + 16} 4`;
const waves = colours
  .map((c, i) => `<path d="${segment(i * 16)}" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"/>`)
  .join('');

/** The wave (48 × 24 units) centred on a navy square, `share` of the width. */
const icon = (size, share) => {
  const scale = (60 * share) / 48;
  const x = (60 - 48 * scale) / 2;
  const y = (60 - 24 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 60 60">
  <rect width="60" height="60" fill="${navy}"/>
  <g transform="translate(${x} ${y}) scale(${scale})">${waves}</g>
</svg>`;
};

mkdirSync(join(out, 'icons'), { recursive: true });
writeFileSync(join(out, 'favicon.svg'), icon(32, 0.8) + '\n');
const png = (svg, file) => sharp(Buffer.from(svg)).png().toFile(join(out, file));
await png(icon(192, 0.7), 'icons/icon-192.png');
await png(icon(512, 0.7), 'icons/icon-512.png');
// Android may crop up to a circle: keep the wave inside the middle 80% (the "safe zone")
await png(icon(512, 0.56), 'icons/icon-maskable-512.png');
// iPhone rounds the corners itself
await png(icon(180, 0.66), 'icons/apple-touch-icon.png');
console.log('Icons written to board/public/');

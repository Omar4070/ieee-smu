/**
 * Cuts tall full-page screenshots into readable sheets for reviewing them.
 * Narrow (phone/tablet) pages are laid out as side-by-side columns.
 * Usage: node scripts/slice-screenshots.mjs screenshots/home-1440-light.png [...]
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { basename } from 'node:path';

mkdirSync('screenshots/slices', { recursive: true });
for (const file of process.argv.slice(2)) {
  const { width, height } = await sharp(file).metadata();
  const name = basename(file, '.png');
  const cols = width <= 500 ? 4 : width <= 900 ? 2 : 1;
  const colH = cols === 1 ? Math.round(width * 1.25) : 1800;
  const segments = [];
  for (let top = 0; top < height; top += colH) segments.push({ top, h: Math.min(colH, height - top) });
  for (let p = 0; p * cols < segments.length; p++) {
    const group = segments.slice(p * cols, p * cols + cols);
    const gap = 16;
    const sheetW = cols * width + (cols - 1) * gap;
    const tiles = await Promise.all(
      group.map(async (s, i) => ({
        input: await sharp(file).extract({ left: 0, top: s.top, width, height: s.h }).toBuffer(),
        left: i * (width + gap),
        top: 0,
      })),
    );
    const out = `screenshots/slices/${name}-${p}.jpg`;
    // sharp resizes before compositing, so composite into a buffer first.
    const sheet = await sharp({ create: { width: sheetW, height: colH, channels: 3, background: '#ff00ff' } })
      .composite(tiles)
      .png()
      .toBuffer();
    await sharp(sheet)
      .resize(Math.min(sheetW, 1400))
      .jpeg({ quality: 72 })
      .toFile(out);
    console.log(out);
  }
}

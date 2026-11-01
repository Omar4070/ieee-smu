/**
 * Generates the favicon, Apple touch icon and default social image in /public
 * from the chapter's three-colour wave and white logo.
 * Run with `node scripts/generate-icons.mjs` after changing the logo or colours.
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

// Lighter tints of the IAS green, IES orange and PES blue so all three read on black.
const colours = ['#2fae55', '#ff7a2f', '#5b8fd6'];
const segment = (x) => `M${x} 4C${x + 5} 4 ${x + 5} 20 ${x + 8} 20C${x + 11} 20 ${x + 11} 4 ${x + 16} 4`;
const waves = colours
  .map((c, i) => `<path d="${segment(i * 16)}" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"/>`)
  .join('');

// Square icon: black tile, the wave centred.
const mark = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 60 60">
  <rect width="60" height="60" fill="#000000"/>
  <g transform="translate(6 18)">${waves}</g>
</svg>`;

writeFileSync('public/favicon.svg', mark(32).trim() + '\n');
await sharp(Buffer.from(mark(180))).png().toFile('public/apple-touch-icon.png');

// favicon.ico holding a single 32×32 PNG (supported by every current browser)
const png32 = await sharp(Buffer.from(mark(32))).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png32.length, 14); // size of image data
header.writeUInt32LE(22, 18); // offset of image data
writeFileSync('public/favicon.ico', Buffer.concat([header, png32]));

// 1200×630 social preview: the white chapter logo on black.
const logo = await sharp('public/logos/chapter-logo-white.png').resize({ width: 960 }).toBuffer();
const { height: logoH } = await sharp(logo).metadata();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000000' } })
  .composite([{ input: logo, left: 120, top: Math.round((630 - logoH) / 2) }])
  .png()
  .toFile('public/og-default.png');
console.log('Icons and social image written to /public');

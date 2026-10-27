/**
 * Generates the favicon, Apple touch icon and default social image in /public.
 * Run with `node scripts/generate-icons.mjs` after changing the chapter mark or name.
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const mark = (size, pad = 0, bg = '#002855') => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-pad} ${-pad} ${32 + pad * 2} ${32 + pad * 2}">
  <rect x="${-pad}" y="${-pad}" width="${32 + pad * 2}" height="${32 + pad * 2}" fill="${bg}"/>
  <rect x="5" y="9" width="6" height="18" fill="#78BE20"/>
  <rect x="13" y="5" width="6" height="22" fill="#00B5E2"/>
  <rect x="21" y="12" width="6" height="15" fill="#FFC72C"/>
</svg>`;

writeFileSync('public/favicon.svg', mark(32).trim() + '\n');
await sharp(Buffer.from(mark(180, 4))).png().toFile('public/apple-touch-icon.png');

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

// 1200×630 social preview: navy field, the mark, the chapter name.
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#002855"/>
  <rect x="0" y="560" width="400" height="70" fill="#78BE20"/>
  <rect x="400" y="560" width="400" height="70" fill="#00B5E2"/>
  <rect x="800" y="560" width="400" height="70" fill="#FFC72C"/>
  <g transform="translate(72 72) scale(3)">
    <rect x="2" y="6" width="8" height="24" fill="#78BE20"/>
    <rect x="12" y="2" width="8" height="28" fill="#00B5E2"/>
    <rect x="22" y="10" width="8" height="20" fill="#FFC72C"/>
  </g>
  <text x="72" y="330" fill="#ffffff" font-family="IBM Plex Sans, Helvetica Neue, Arial, sans-serif" font-size="104" font-weight="300" letter-spacing="-3">IES · IAS · PES</text>
  <text x="76" y="420" fill="#ffffff" font-family="IBM Plex Sans, Helvetica Neue, Arial, sans-serif" font-size="40">IEEE Joint Student Chapter</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og-default.png');
console.log('Icons and social image written to /public');

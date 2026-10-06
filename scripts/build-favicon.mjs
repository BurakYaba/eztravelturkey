// Builds the browser icons from the emblem (compass, sails and open book) at the top of public/mtlogo.png.
// The wordmark is too fine to read at 16-32 px, so only the emblem is used.
// Outputs: src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico. Run: npm run favicon
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const root = join(import.meta.dirname, '..');
const source = join(root, 'public', 'mtlogo.png');
const out = join(root, 'src', 'app');
mkdirSync(out, { recursive: true });

// Bounds of the emblem in the 612x408 logo (measured from the alpha channel), above the "MAGNIFICENT" wordmark.
const emblem = await sharp(source).extract({ left: 179, top: 69, width: 259, height: 164 }).toBuffer();
const meta = await sharp(emblem).metadata();

/** Emblem centered on a rounded cream square, with a little breathing room. */
async function icon(size, radiusRatio) {
  const pad = Math.round(size * 0.12);
  const inner = size - pad * 2;
  const art = await sharp(emblem).resize({ width: inner, height: inner, fit: 'inside' }).toBuffer();
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.round(size * radiusRatio)}" fill="#fbf8f2"/></svg>`,
  );
  return sharp(bg)
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toBuffer();
}

writeFileSync(join(out, 'icon.png'), await icon(512, 0.18));
writeFileSync(join(out, 'apple-icon.png'), await icon(180, 0));

// favicon.ico with PNG payloads (16, 32 and 48 px), which every current browser reads.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => icon(s, 0.18)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + sizes.length * 16;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});
writeFileSync(join(out, 'favicon.ico'), Buffer.concat([header, ...entries, ...images]));
console.log(`emblem ${meta.width}x${meta.height} -> icon.png, apple-icon.png, favicon.ico`);

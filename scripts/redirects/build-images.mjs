// Builds src/data/old-images.json: the addresses of the pictures of the old English site (/public/thumbs/... and
// /public/uploads/...) and the address of the same picture on Sanity's CDN (docs/project-plan.md P7.13). Google lists pictures
// by their address (the five "Map of X" posts alone had thousands of impressions), so an old picture address answers a
// permanent redirect to the picture that replaced it instead of a 404 (`src/app/public/[...path]/route.ts`).
//
//   node scripts/redirects/build-images.mjs
//
// Reads the archive of the old site (every picture address its pages used), content/scraped/image-manifest.json (which picture
// file each downloaded source is) and data/sanity/assets-production.json (which Sanity asset it became). A picture is matched
// by its file name (the old site made thumbnails of several sizes of one upload); the widest copy we have is the target.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const manifest = JSON.parse(readFileSync(path.join(root, 'content/scraped/image-manifest.json'), 'utf8'));
const assets = JSON.parse(readFileSync(path.join(root, 'data/sanity/assets-production.json'), 'utf8'));

const baseName = (p) =>
  decodeURIComponent(p.split('/').pop())
    .replace(/^\d+x\d+-(?:thumbnail|bestFit|resize|crop)-/i, '')
    .toLowerCase();

// file name -> best (widest) Sanity asset
const best = new Map();
for (const [src, entry] of Object.entries(manifest.sources)) {
  if (!/magnificenttravel\.com\/public\//.test(src)) continue;
  const asset = assets[entry.sha1];
  const file = manifest.files[entry.sha1];
  if (!asset || !file) continue;
  const match = /^image-([0-9a-f]+)-(\d+x\d+)-(\w+)$/.exec(asset);
  if (!match) continue;
  const key = baseName(new URL(src).pathname);
  if (!best.has(key) || (file.width ?? 0) > best.get(key).width) {
    best.set(key, { width: file.width ?? 0, url: `https://cdn.sanity.io/images/aj0pbi0w/production/${match[1]}-${match[2]}.${match[3]}` });
  }
}

const archive = path.join(root, 'data/archive/en');
const referenced = new Set();
for (const file of readdirSync(archive).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(path.join(archive, file), 'utf8');
  for (const m of html.matchAll(/(?:https?:\/\/(?:www\.)?magnificenttravel\.com)?(\/public\/(?:thumbs|uploads)\/[^"'\s)<>]+\.(?:jpg|jpeg|png|webp|gif))/gi)) {
    referenced.add(decodeURIComponent(m[1]));
  }
}

const map = {};
for (const old of [...referenced].sort()) {
  const target = best.get(baseName(old));
  if (target) map[old] = target.url;
}
writeFileSync(path.join(root, 'src/data/old-images.json'), `${JSON.stringify(map, null, 1)}\n`);
console.log(`${Object.keys(map).length} of ${referenced.size} old picture addresses have a new picture`);

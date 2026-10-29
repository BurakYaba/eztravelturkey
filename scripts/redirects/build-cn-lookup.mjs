// Builds src/data/redirects-cn.json: where each address of the old Simplified Chinese pages (eztravelturkey.com/cn/...) goes on
// magnificenttravel.com, which now holds the Simplified Chinese site. Reads data/mapping/redirects-cn.csv (not in git; written by
// build-cn.mjs from the scrape of the old site).
//
//   node scripts/redirects/build-cn-lookup.mjs
//
// The key is the old path without the `/cn/` prefix, in the same form `src/lib/old-cn.ts` looks it up: every part decoded,
// trimmed and lowercased, without slashes at the ends. The value is the path on magnificenttravel.com (with its `/cn/` prefix).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const lines = readFileSync(path.join(root, 'data/mapping/redirects-cn.csv'), 'utf8')
  .replace(/^﻿/, '')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean);

const normalize = (value) =>
  value
    .split('/')
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    })
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join('/');

const map = {};
for (const line of lines) {
  const cells = line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1));
  const [, oldPath, , , , newPath] = cells;
  if (!newPath.startsWith('/cn/')) {
    throw new Error(`unexpected target: ${newPath}`);
  }
  map[normalize(oldPath)] = newPath;
}

// magnificenttravel.com sends this one address on (308) to the 6-9 day folder, where the client kept the tour (2026-10-26); point
// straight at the final address so a visitor does not make an extra hop.
const moved = {
  '/cn/destinations/turkey-tours/02-to-05-days-tours/istanbul-cappadocia-tour-06-days/':
    '/cn/destinations/turkey-tours/06-to-09-days-tours/istanbul-cappadocia-06-days/',
};
for (const [from, value] of Object.entries(map)) {
  if (moved[value]) {
    map[from] = moved[value];
  }
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(path.join(root, 'src/data/redirects-cn.json'), `${JSON.stringify(sorted, null, 1)}\n`);
console.log(`${lines.length} rows -> ${Object.keys(sorted).length} addresses`);

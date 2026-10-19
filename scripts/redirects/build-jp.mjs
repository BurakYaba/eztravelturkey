// Builds src/data/redirects-jp.json: every address of the old Japanese site (torukoryoko.com) and where it goes on this
// site (docs/project-plan.md P7.5). The list comes from data/mapping/redirects-jp.csv, which `scripts/scrape/redirect-map.mjs`
// wrote from the archive of the old site: the page moved or merged (301), the page was deleted by the client and goes to the
// nearest page above it, or it stays at the same address on the new domain.
//
//   node scripts/redirects/build-jp.mjs
//
// The key is the old path in the form `normalizeOldPath` (src/lib/old-hosts.ts) gives, so both sides must stay the same.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const normalize = (pathname) =>
  pathname
    .split('/')
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean)
    .join('/');

const rows = readFileSync(path.join(root, 'data/mapping/redirects-jp.csv'), 'utf8')
  .replace(/^﻿/, '')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1)));

const map = {};
for (const [oldUrl, , , , , newPath] of rows) {
  const key = normalize(new URL(oldUrl).pathname);
  if (key in map && map[key] !== newPath) throw new Error(`Two targets for ${key}: ${map[key]} and ${newPath}`);
  map[key] = newPath;
}
const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(path.join(root, 'src/data/redirects-jp.json'), `${JSON.stringify(sorted, null, 1)}\n`);
console.log(`${Object.keys(sorted).length} addresses of ${rows.length} rows`);

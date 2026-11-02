// Builds src/data/redirects-zh.json: where the old eztravelturkey.com /zh/ addresses that no longer exist as pages go (the tabs of a
// tour page: itinerary, reviews, inclusion-rate ...; their misspelled twins; the old search page). Reads data/mapping/redirects-zh.csv
// (not in git). The rows of `/cn/` pages in that file are handled elsewhere (build-cn-lookup.mjs).
//
//   node scripts/redirects/build-zh-lookup.mjs
//
// The key is the old path without the `/zh/` prefix, in the form `src/lib/old-zh.ts` looks it up: every part decoded, trimmed and
// lowercased, without slashes at the ends. The value is the new path (with its `/zh/` prefix).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const rows = readFileSync(path.join(root, 'data/mapping/redirects-zh.csv'), 'utf8')
  .replace(/^﻿/, '')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1)));

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
for (const [, oldPath, , , action, newPath] of rows) {
  if (!oldPath.startsWith('zh/') || action === 'same') {
    continue;
  }
  if (!newPath.startsWith('/zh/')) {
    throw new Error(`unexpected target: ${newPath}`);
  }
  map[normalize(oldPath.slice(3))] = newPath;
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(path.join(root, 'src/data/redirects-zh.json'), `${JSON.stringify(sorted, null, 1)}\n`);
console.log(`${Object.keys(sorted).length} old /zh/ addresses`);

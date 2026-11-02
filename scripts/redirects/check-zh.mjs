// Checks every address of the old eztravelturkey.com `/zh/` pages (data/mapping/redirects-zh.csv, not in git) against this site:
// a page that kept its address answers 200 (or a 301 to the same page), a tab of a tour page, a misspelled twin or the old search page
// answers 301 to the page that holds the content, and each of those targets answers 200.
//
//   node scripts/redirects/check-zh.mjs [base]          default base: http://localhost:3100
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '');
const rows = readFileSync(path.join(root, 'data/mapping/redirects-zh.csv'), 'utf8')
  .replace(/^﻿/, '')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1)))
  .filter((r) => r[1].startsWith('zh') || r[1] === '');

const decoded = (value) => decodeURIComponent(value);
const bad = [];
let ok = 0;
let next = 0;
const worker = async () => {
  while (next < rows.length) {
    const [oldUrl, , , , action, newPath] = rows[next++];
    const p = new URL(oldUrl).pathname;
    const response = await fetch(base + p, { redirect: 'manual' });
    const location = response.headers.get('location');
    const goesTo = location ? decoded(new URL(location, base).pathname) : null;
    const good =
      action === 'same'
        ? (response.status === 200 && decoded(p) === decoded(newPath)) || (response.status === 301 && goesTo === decoded(newPath))
        : response.status === 301 && goesTo === decoded(newPath);
    if (good) {
      ok++;
    } else {
      bad.push(`${decoded(p)} (${action}) -> ${response.status} ${goesTo ?? ''}`);
    }
  }
};
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`old /zh/ addresses that behave as the map says: ${ok} of ${rows.length}`);
bad.slice(0, 15).forEach((b) => console.log('  BAD', b));

const targets = [...new Set(rows.map((r) => r[5]))];
const badTargets = [];
for (const target of targets) {
  const response = await fetch(base + target.split('/').map(encodeURIComponent).join('/'), { redirect: 'manual' });
  if (response.status !== 200) {
    badTargets.push(`${target}: ${response.status}`);
  }
}
console.log(badTargets.length === 0 ? `All ${targets.length} targets answer 200.` : `${badTargets.length} of ${targets.length} targets do not:\n${badTargets.join('\n')}`);
process.exit(bad.length === 0 && badTargets.length === 0 ? 0 : 1);

// Checks that every place the old Simplified Chinese addresses go to answers 200 on this site (docs/project-plan.md D43, P7.7).
// Reads data/mapping/redirects-cn.csv (written by build-cn.mjs). The redirects themselves are made by the eztravelturkey.com site.
//
//   node scripts/redirects/check-cn.mjs [http://localhost:3100]
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '');
const targets = new Set(
  readFileSync(path.join(root, 'data/mapping/redirects-cn.csv'), 'utf8')
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1))[5]),
);
const bad = [];
for (const target of targets) {
  const response = await fetch(base + target.split('/').map((part) => encodeURIComponent(decodeURIComponent(part))).join('/'), { redirect: 'manual' });
  if (response.status !== 200) bad.push(`${target}: ${response.status}`);
}
console.log(bad.length === 0 ? `All ${targets.size} targets answer 200.` : `${bad.length} of ${targets.size} do not:\n${bad.join('\n')}`);
process.exit(bad.length === 0 ? 0 : 1);

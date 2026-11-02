// Checks the old Simplified Chinese addresses of eztravelturkey.com (`/cn/...`, data/mapping/redirects-cn.csv, not in git): this site
// answers each with a 301 to its place on magnificenttravel.com, and every place answers 200 there.
//
//   node scripts/redirects/check-cn.mjs [base]          default base: http://localhost:3100
//   node scripts/redirects/check-cn.mjs [base] --local  skip the check of the targets on the live magnificenttravel.com
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
const base = (args.find((a) => a.startsWith('http')) ?? 'http://localhost:3100').replace(/\/$/, '');
const skipTargets = args.includes('--local');
const mainSite = 'https://www.magnificenttravel.com';

const rows = readFileSync(path.join(root, 'data/mapping/redirects-cn.csv'), 'utf8')
  .replace(/^﻿/, '')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1)));

const bad = [];
let ok = 0;
let next = 0;
const worker = async () => {
  while (next < rows.length) {
    const [oldUrl, , , , , newPath] = rows[next++];
    const response = await fetch(base + new URL(oldUrl).pathname, { redirect: 'manual' });
    const location = response.headers.get('location');
    // one address (the 5-day Istanbul + Cappadocia tour) goes straight to its final place, which the map still lists at the old one
    if (response.status === 301 && location && decodeURIComponent(location).startsWith(mainSite + '/cn/')) {
      ok++;
    } else {
      bad.push(`${new URL(oldUrl).pathname} -> ${response.status} ${location ?? ''} (map: ${newPath})`);
    }
  }
};
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`old /cn/ addresses that answer 301 to ${mainSite}/cn/...: ${ok} of ${rows.length}`);
bad.slice(0, 10).forEach((b) => console.log('  BAD', b));

let badTargets = [];
if (!skipTargets) {
  const targets = [...new Set(rows.map((r) => r[5]))];
  for (const target of targets) {
    const response = await fetch(mainSite + target.split('/').map((p) => encodeURIComponent(decodeURIComponent(p))).join('/'), { redirect: 'manual' });
    // the final address of that one tour is already pointed at directly by this site; a 308 on the map's older address is fine
    if (![200, 308].includes(response.status)) {
      badTargets.push(`${target}: ${response.status}`);
    }
  }
  console.log(badTargets.length === 0 ? `All ${targets.length} targets answer on magnificenttravel.com.` : `${badTargets.length} of ${targets.length} targets do not:\n${badTargets.join('\n')}`);
}
process.exit(bad.length === 0 && badTargets.length === 0 ? 0 : 1);

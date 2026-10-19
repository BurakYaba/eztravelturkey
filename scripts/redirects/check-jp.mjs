// Asks the site what it answers for every address of the old Japanese site (docs/project-plan.md P7.7), as if the request
// came to torukoryoko.com (the Host header is set). Each address must answer one redirect to the new site and the target must
// answer 200 there. Reads data/mapping/redirects-jp.csv; only reads.
//
//   node scripts/redirects/check-jp.mjs [http://localhost:3100]
import { readFileSync } from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const root = path.resolve(import.meta.dirname, '../..');
const base = new URL(process.argv[2] ?? 'http://localhost:3100');

const rows = readFileSync(path.join(root, 'data/mapping/redirects-jp.csv'), 'utf8')
  .replace(/^﻿/, '')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1)));

/** fetch() does not let a script choose the Host header, so the request is made with node's own client. */
const ask = (pathname, host) =>
  new Promise((resolve, reject) => {
    const request = http.request({ host: base.hostname, port: base.port, path: pathname, method: 'GET', headers: { host } }, (response) => {
      response.resume();
      resolve({ status: response.statusCode, location: response.headers.location ?? '' });
    });
    request.on('error', reject);
    request.end();
  });

const problems = [];
const summary = {};
for (const [oldUrl, , , what, action, newPath] of rows) {
  const url = new URL(oldUrl);
  const first = await ask(url.pathname.replace(/ /g, '%20'), url.host);
  const key = `${action} | ${first.status}`;
  summary[key] = (summary[key] ?? 0) + 1;
  const expected = new URL(newPath, 'https://www.magnificenttravel.com').href;
  if (first.status !== 301 || new URL(first.location, 'https://x').href !== expected) {
    problems.push(`${oldUrl}: answered ${first.status} ${first.location}, expected 301 ${expected}`);
    continue;
  }
  const target = await ask(newPath.split('/').map((part) => encodeURIComponent(decodeURIComponent(part))).join('/'), base.host);
  if (target.status !== 200) problems.push(`${oldUrl}: the target ${newPath} answers ${target.status}`);
}
for (const [key, count] of Object.entries(summary).sort()) console.log(String(count).padStart(5), key);
console.log(problems.length === 0 ? `\nAll ${rows.length} addresses redirect to a page that answers 200.` : `\n${problems.length} problem(s):\n${problems.slice(0, 20).join('\n')}`);
process.exit(problems.length === 0 ? 0 : 1);

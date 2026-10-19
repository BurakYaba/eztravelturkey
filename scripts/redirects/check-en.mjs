// Asks the site what it answers for every address of the old English site (docs/project-plan.md P7.7).
//
//   node scripts/redirects/check-en.mjs [http://localhost:3100]
//
// Reads data/inventory/en.csv (the old site's addresses, kept on the developer's computer). For each address it records the
// status, where a redirect goes and whether that target answers 200 in one step, then prints a table by kind. Writes
// data/qa/p7-en.csv. Only reads.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '');

const rows = readFileSync(path.join(root, 'data/inventory/en.csv'), 'utf8')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1)))
  .map(([url, , , kind, , , israel]) => ({ url, kind, israel: israel === 'true' }));

const ask = async (pathname) => {
  const response = await fetch(base + pathname, { redirect: 'manual' });
  return { status: response.status, location: response.headers.get('location') ?? '' };
};

const out = [];
for (const row of rows) {
  const { pathname, search } = new URL(row.url);
  const first = await ask(pathname + search);
  let final = first.status;
  let target = '';
  if (first.status >= 300 && first.status < 400) {
    target = first.location.replace(base, '');
    final = (await ask(target)).status;
  }
  out.push({ ...row, pathname, status: first.status, target, targetStatus: first.status >= 300 && first.status < 400 ? final : '' });
}

const summary = {};
for (const r of out) {
  const key = `${r.kind}${r.israel ? ' (Israel)' : ''} | ${r.status}${r.target ? ` -> ${r.targetStatus}` : ''}`;
  summary[key] = (summary[key] ?? 0) + 1;
}
for (const [key, count] of Object.entries(summary).sort()) console.log(String(count).padStart(5), key);

mkdirSync(path.join(root, 'data/qa'), { recursive: true });
writeFileSync(
  path.join(root, 'data/qa/p7-en.csv'),
  ['url,kind,israel,status,target,targetStatus', ...out.map((r) => [r.url, r.kind, r.israel, r.status, r.target, r.targetStatus].map((v) => `"${v}"`).join(','))].join('\n'),
);

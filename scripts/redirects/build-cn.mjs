// Works out where every address of the old Simplified Chinese site (eztravelturkey.com/cn/...) goes on this site and writes
// data/mapping/redirects-cn.csv (docs/project-plan.md D43). The redirects themselves are made by the eztravelturkey.com site,
// which takes over that domain; this file is the list it needs, in the format of redirects-jp.csv.
//
//   node scripts/redirects/build-cn.mjs
//
// Rule: a page that exists in Simplified Chinese on this site keeps its path; the empty tab pages of a tour (the old theme's
// /inclusion-rate/, /itinerary/ ...) go to the tour; a page that does not exist goes to the nearest page above it, at last the
// Simplified Chinese home page. Reads the old address list (data/mapping/redirects-zh.csv, which holds the /cn/ rows) and the
// parsed pages (content/scraped/cn).
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.json') ? [full] : [];
  });

// the pages that exist in Simplified Chinese on this site (paths without the language)
const existing = new Set(['', 'destinations', 'blog']);
for (const dir of ['tours', 'pages']) {
  for (const file of walk(path.join(root, 'content/scraped/cn', dir))) {
    const page = JSON.parse(readFileSync(file, 'utf8'));
    if (page.kind !== 'home' && !['search'].includes(page.path)) existing.add(page.path.toLowerCase());
  }
}

const rows = readFileSync(path.join(root, 'data/mapping/redirects-zh.csv'), 'utf8')
  .replace(/^﻿/, '')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1)))
  .filter(([url]) => /\/cn(\/|$)/.test(url));

const subpages = new Set(['tour-itinerary', 'tour-itenary', 'tour-initerary', 'inclusion-rate', 'inclution-rate', 'incllusion-rate', 'inclusions-rate', 'includes-rate', 'tour-inclusion', 'review', 'reviews', 'itinerary']);
const out = [];
for (const [oldUrl, , listed, what] of rows) {
  const parts = decodeURIComponent(new URL(oldUrl).pathname).split('/').filter(Boolean).slice(1).map((s) => s.trim());
  let candidate = parts.map((s) => s.toLowerCase());
  let action = 'same';
  if (candidate.length && subpages.has(candidate.at(-1))) {
    candidate = candidate.slice(0, -1);
    action = '301-page';
  }
  let key = candidate.join('/');
  if (!existing.has(key)) {
    action = '301-parent';
    while (candidate.length && !existing.has(candidate.join('/'))) candidate = candidate.slice(0, -1);
    key = candidate.join('/');
  }
  // the path on this site keeps the case of the old address (a few slugs have capital letters)
  const newPath = `/cn/${key ? `${parts.slice(0, key.split('/').length).join('/')}/` : ''}`;
  out.push([oldUrl, parts.join('/'), listed, what, action, newPath]);
}
const header = 'old_url,old_path,listed,what,action,new_path';
writeFileSync(path.join(root, 'data/mapping/redirects-cn.csv'), `﻿${header}\n${out.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')}\n`);
const summary = {};
for (const r of out) summary[r[4]] = (summary[r[4]] ?? 0) + 1;
console.log(`${out.length} addresses`, summary);

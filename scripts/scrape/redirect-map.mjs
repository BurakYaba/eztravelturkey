// What happens to every address of the old Chinese and Japanese sites (docs/project-plan.md P5 "done" rule, D10, D11).
//
//   node scripts/scrape/redirect-map.mjs
//
// Reads data/inventory/<zh|jp>.csv (the addresses the old sites list today) and removed-2026-10-12.csv (tours the client
// deleted since 7 October), and the pages that were parsed (content/scraped/<lang>). Writes data/mapping/redirects-<site>.csv
// with one row per address: what it is, what the new site does with it and where it points.
//
// Actions:
//   same        the page has the same address on the new site (only the domain changes: one redirect for the whole domain)
//   301-page    the page moved or was merged: permanent redirect to the page named in `target`
//   301-parent  the page is gone: permanent redirect to the nearest page above it (category, country, hub)
//   301-hub     no page above it either: the destinations hub of that language
//   zh-twin     /cn/ (simplified Chinese, not carried over, D10): redirect to the same address under /zh/
// Israel addresses have no page (D4); where they go is decision D27 (default: the hub), so they are marked.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './lib/csv.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.json') ? [join(dir, e.name)] : []))
    : [];

const SUBPAGES = new Set(['tour-itinerary', 'inclusion-rate', 'incllusion-rate', 'inclusions-rate', 'includes-rate', 'review', 'reviews', 'itinerary']);
const hub = { zh: 'destinations', jp: '目的地' };
/** Code pages that exist on the new site next to the CMS pages. */
const codePages = new Map([
  ['zh', new Set(['', 'search'])],
  ['jp', new Set(['', 'search'])],
]);

const clean = (url) => new URL(url).pathname.split('/').filter(Boolean).map((s) => decodeURIComponent(s));
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const removed = parseCsv(readFileSync(join(root, 'data/inventory/removed-2026-10-12.csv'), 'utf8'));

for (const site of ['zh', 'jp']) {
  const have = new Set([...walk(join(root, 'content/scraped', site)).map((f) => JSON.parse(readFileSync(f, 'utf8')).path), ...codePages.get(site)]);
  const rows = [
    ...parseCsv(readFileSync(join(root, 'data/inventory', `${site}.csv`), 'utf8')).map((r) => ({ url: r.url, listed: 'now' })),
    ...removed.filter((r) => r.site === site).map((r) => ({ url: r.url, listed: 'deleted by the client 2026-10-12' })),
  ];
  const out = ['old_url,old_path,listed,what,action,new_path'];
  const counts = {};
  for (const { url, listed } of rows) {
    const raw = clean(url);
    const trimmed = raw.map((s) => s.trim());
    const lang = raw[0] ?? '';
    let segs = trimmed.slice(1);
    let action;
    let target = '';
    let what = segs.length === 0 ? 'home' : SUBPAGES.has((segs[segs.length - 1] ?? '').toLowerCase()) ? 'tab of a tour' : 'page';
    if (/israel|イスラエル|以色列/i.test(decodeURIComponent(url))) {
      action = '301-hub (Israel, D27 pending)';
      target = hub[site];
    } else {
      if (lang === 'cn') {
        what = `${what} (simplified Chinese)`;
      }
      if (segs.length > 0 && SUBPAGES.has((segs[segs.length - 1] ?? '').toLowerCase())) segs = segs.slice(0, -1);
      let path = segs.join('/');
      if (lang === 'cn') {
        action = have.has(path) ? 'zh-twin' : null;
      } else if (have.has(path) && raw.slice(1).join('/') === path && what !== 'tab of a tour') {
        action = 'same';
      } else if (have.has(path)) {
        action = '301-page';
      } else {
        action = null;
      }
      if (action) {
        target = path;
      } else {
        // the nearest page above it
        const up = [...segs];
        while (up.length > 0 && !have.has(up.join('/'))) up.pop();
        if (up.length > 0) {
          action = '301-parent';
          target = up.join('/');
        } else {
          action = '301-hub';
          target = hub[site];
        }
      }
      if (action === 'same' && raw.slice(1).some((s, i) => s !== trimmed[i + 1])) action = '301-page';
    }
    counts[action] = (counts[action] ?? 0) + 1;
    const prefix = action === 'zh-twin' || action.startsWith('301') ? (lang === 'cn' ? 'zh' : site) : site;
    out.push([q(url), q(raw.join('/')), q(listed), q(what), q(action), q(`/${prefix}${target ? `/${target}` : ''}/`)].join(','));
  }
  mkdirSync(join(root, 'data/mapping'), { recursive: true });
  writeFileSync(join(root, 'data/mapping', `redirects-${site}.csv`), `﻿${out.join('\n')}\n`);
  console.log(`${site}: ${rows.length} addresses`, counts);
}

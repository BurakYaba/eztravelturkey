// Native-editor worksheet for search-result titles and descriptions (docs/project-plan.md P8.14).
//
//   node --env-file-if-exists=.env.local scripts/sanity/meta-worksheet.mjs export --lang=jp [--out=docs/editor/meta-jp.csv]
//   node --env-file-if-exists=.env.local scripts/sanity/meta-worksheet.mjs import --file=docs/editor/meta-jp.csv [--write]
//
// export: writes one row per page of the language: the address, the current title and description with their lengths, flags
// (too long, shared with another page, still carries the old site's brand) and two empty columns, `new_title` and `new_description`,
// for the editor. The file is UTF-8 with a byte-order mark so Excel shows Japanese and Chinese correctly.
// import: reads the same file back. Only rows with a filled `new_title` or `new_description` are touched, and only the fields
// `metaTitle` and `metaDescription`. Without --write it shows what would change. With --write it first saves the old values to
// data/backups/meta-<date>.json, so the change can be undone.
import { createClient } from '@sanity/client';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const [mode] = process.argv.slice(2);
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w',
  dataset: process.env.SANITY_DATASET ?? 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
});

const quote = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
};

if (mode === 'export') {
  const lang = arg('lang');
  if (!lang) { console.error('Use --lang=jp or --lang=cn'); process.exit(1); }
  const docs = await client.fetch(
    '*[language == $lang && defined(path) && !(_id in path("drafts.**"))]{ _id, _type, path, title, metaTitle, metaDescription } | order(_type, path)',
    { lang },
  );
  const count = (key) => {
    const m = new Map();
    for (const d of docs) if (d[key]) m.set(d[key], (m.get(d[key]) ?? 0) + 1);
    return m;
  };
  const titles = count('metaTitle');
  const descriptions = count('metaDescription');
  const header = ['id', 'type', 'path', 'page_title', 'current_title', 'title_length', 'current_description', 'description_length', 'flags', 'new_title', 'new_description'];
  const lines = [header.join(',')];
  for (const d of docs) {
    const flags = [];
    if ((d.metaTitle ?? '').length > 40) flags.push('title over 40 characters');
    if ((d.metaTitle ?? '').length === 0) flags.push('no title');
    if ((d.metaDescription ?? '').length === 0) flags.push('no description');
    if ((d.metaDescription ?? '').length > 0 && (d.metaDescription ?? '').length < 30) flags.push('description very short');
    if (titles.get(d.metaTitle) > 1) flags.push('title shared with another page');
    if (descriptions.get(d.metaDescription) > 1) flags.push('description shared with another page');
    if (/eztravel/i.test(`${d.metaTitle} ${d.metaDescription}`)) flags.push('old brand Eztravel Turkey');
    if (/トルコ旅行専門/.test(d.metaTitle ?? '')) flags.push('old site title pattern');
    lines.push(
      [d._id, d._type, `/${d.path}`, d.title, d.metaTitle, (d.metaTitle ?? '').length, d.metaDescription, (d.metaDescription ?? '').length, flags.join('; '), '', '']
        .map(quote)
        .join(','),
    );
  }
  const out = path.resolve(root, arg('out') ?? `docs/editor/meta-${lang}.csv`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, `﻿${lines.join('\r\n')}\r\n`, 'utf8');
  console.log(`${docs.length} pages written to ${out}`);
} else if (mode === 'import') {
  const file = arg('file');
  if (!file) { console.error('Use --file=<csv>'); process.exit(1); }
  const write = process.argv.includes('--write');
  if (write && !process.env.SANITY_WRITE_TOKEN) { console.error('Set SANITY_WRITE_TOKEN in .env.local.'); process.exit(1); }
  const [header, ...rows] = parseCsv(readFileSync(path.resolve(root, file), 'utf8').replace(/^﻿/, ''));
  const col = (name) => header.indexOf(name);
  const changes = rows
    .map((r) => ({ id: r[col('id')], newTitle: (r[col('new_title')] ?? '').trim(), newDescription: (r[col('new_description')] ?? '').trim(), path: r[col('path')] }))
    .filter((c) => c.newTitle || c.newDescription);
  console.log(`${changes.length} rows have a new title or description`);
  const backup = [];
  for (const c of changes) {
    const old = await client.getDocument(c.id);
    if (!old) { console.log(`  skipped, no such document: ${c.id}`); continue; }
    const set = {};
    if (c.newTitle) set.metaTitle = c.newTitle;
    if (c.newDescription) set.metaDescription = c.newDescription;
    console.log(`  ${c.path}: ${Object.keys(set).join(' + ')}`);
    backup.push({ id: c.id, metaTitle: old.metaTitle ?? null, metaDescription: old.metaDescription ?? null });
    if (write) await client.patch(c.id).set(set).commit();
  }
  if (write && backup.length) {
    const dir = path.join(root, 'data/backups');
    mkdirSync(dir, { recursive: true });
    const name = path.join(dir, `meta-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`);
    writeFileSync(name, JSON.stringify(backup, null, 1), 'utf8');
    console.log(`written. The old values are in ${name}`);
  } else if (!write) console.log('Nothing was written (add --write).');
} else {
  console.error('Use: export --lang=jp | import --file=<csv> [--write]');
  process.exit(1);
}

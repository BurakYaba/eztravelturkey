// Replaces the text sections of one page with the ones in a JSON file (used for the Chinese privacy policy, docs/project-plan.md P8.15).
//
//   node --env-file-if-exists=.env.local scripts/sanity/set-page-sections.mjs --id=staticpage-cn-privacy-policy --file=data/drafts/cn-privacy-policy.json [--write]
//
// The file is a list of { heading, level, blocks: [{ type: 'paragraph', text } | { type: 'list', ordered, items }] }. Nothing else on the
// page changes. Without --write it only prints what would happen. With --write the old sections are saved first to
// data/backups/sections-<id>-<time>.json, so the change can be undone.
import { createClient } from '@sanity/client';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const write = process.argv.includes('--write');
const id = arg('id');
const file = arg('file');
if (!id || !file) {
  console.error('Use --id=<document id> --file=<json>');
  process.exit(1);
}
if (write && !process.env.SANITY_WRITE_TOKEN) {
  console.error('Set SANITY_WRITE_TOKEN in .env.local.');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w',
  dataset: process.env.SANITY_DATASET ?? 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
});

const key = (prefix, i, j = '') => `${prefix}${i}${j === '' ? '' : `-${j}`}`;
const sections = JSON.parse(readFileSync(path.resolve(root, file), 'utf8')).map((s, i) => ({
  _type: 'section',
  _key: key('s', i),
  level: s.level ?? 2,
  heading: s.heading ?? '',
  blocks: s.blocks.map((b, j) =>
    b.type === 'list'
      ? { _type: 'list', _key: key('b', i, j), ordered: Boolean(b.ordered), items: b.items }
      : { _type: 'paragraph', _key: key('b', i, j), text: b.text },
  ),
}));

const old = await client.getDocument(id);
if (!old) {
  console.error(`No document ${id}`);
  process.exit(1);
}
console.log(`${id}: ${old.sections?.length ?? 0} section(s) now, ${sections.length} in the file`);
if (!write) {
  console.log('Nothing was written (add --write).');
  process.exit(0);
}
const dir = path.join(root, 'data/backups');
mkdirSync(dir, { recursive: true });
const backup = path.join(dir, `sections-${id}-${Date.now()}.json`);
writeFileSync(backup, JSON.stringify(old.sections ?? [], null, 1), 'utf8');
await client.patch(id).set({ sections }).commit();
console.log(`written. The old sections are in ${backup}`);

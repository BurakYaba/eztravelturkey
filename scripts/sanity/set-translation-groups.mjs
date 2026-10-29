// Sets `translationGroup` on documents that already exist, touching nothing else (docs/project-plan.md P5.4).
//
//   node --env-file-if-exists=.env.local scripts/sanity/set-translation-groups.mjs [--lang=en] [--dry]
//
// The English documents are edited by the client in Studio (texts, blog authors, prices); a full import would write them again from
// the scraped files. This only adds the code that links a page to its counterparts in the other languages, taken from
// data/mapping/translations.json (tours) and data/mapping/pages.json (country, category, about, FAQ ...).
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const dry = process.argv.includes('--dry');
const lang = process.argv.find((a) => a.startsWith('--lang='))?.slice(7) ?? 'en';
const dataset = process.env.SANITY_DATASET ?? 'production';
const read = (f) => JSON.parse(readFileSync(path.join(root, 'data/mapping', f), 'utf8'));

const groups = new Map(Object.entries(read('translations.json')).map(([key, group]) => [key, group]));
for (const [group, byLang] of Object.entries(read('pages.json'))) {
  for (const [l, p] of Object.entries(byLang)) groups.set(`${l}:${p}`, group);
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? '91izz3mt',
  dataset,
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
});
if (!dry && !process.env.SANITY_WRITE_TOKEN) {
  console.error('Set SANITY_WRITE_TOKEN in .env.local.');
  process.exit(1);
}

const docs = await client.fetch('*[defined(path) && language == $lang && !(_id in path("drafts.**"))]{ _id, path, translationGroup }', { lang });
const todo = docs.flatMap((d) => {
  const group = groups.get(`${lang}:${d.path}`);
  return group && d.translationGroup !== group ? [{ id: d._id, group }] : [];
});
console.log(`${dataset}: ${docs.length} ${lang} documents, ${todo.length} to set`);
if (dry) process.exit(0);
for (let i = 0; i < todo.length; i += 25) {
  const tx = client.transaction();
  for (const { id, group } of todo.slice(i, i + 25)) tx.patch(id, (p) => p.set({ translationGroup: group }));
  await tx.commit();
}
console.log('done');

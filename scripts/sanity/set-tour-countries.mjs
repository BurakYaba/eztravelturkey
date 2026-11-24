// Fills the "Ülkeler" (countries) field of every tour that has none, once, with what the site already works out for it today
// (its folder, or else its title and route), so the field starts out equal to what visitors see and no list changes.
//
//   node --env-file-if-exists=.env.local scripts/sanity/set-tour-countries.mjs            dry run: writes nothing, prints the plan
//   node --env-file-if-exists=.env.local scripts/sanity/set-tour-countries.mjs --write    does it
//
// What keeps the editors' work safe:
// - a full copy of every tour document (published and drafts) is saved to data/backups/ BEFORE anything is written;
// - only the `countries` field is written, and only on documents where it is missing or empty; nothing else in a document is touched;
// - every patch carries the revision the script read (`ifRevisionID`), so a document an editor changed in the meantime is skipped, not overwritten;
// - drafts are NOT touched (they are the editors' work in progress; the Studio asks for the countries when a draft is published);
// - tours for which no country can be found are listed and left alone: a person chooses them in the Studio;
// - after writing, every tour is read again and compared with the copy: all fields except `countries` must be identical, and `countries`
//   must be exactly what was planned. Any difference prints FAIL and exits with an error.
//
// SANITY_DATASET picks the dataset (default production). Needs SANITY_WRITE_TOKEN (Editor).
import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import { countriesOfTour } from './tour-countries.mjs';

const write = process.argv.includes('--write');
const dataset = process.env.SANITY_DATASET ?? 'production';

if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('SANITY_WRITE_TOKEN is not set (the token also shows the drafts).');
  process.exit(1);
}
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? '91izz3mt',
  dataset,
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
  perspective: 'raw',
});

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.resolve('data/backups');
const fetchTours = () => client.fetch('*[_type == "tour"] | order(_id asc)');

const before = await fetchTours();
const isDraft = (doc) => doc._id.startsWith('drafts.');
console.log(`Dataset ${dataset}: ${before.length} tour documents (${before.filter(isDraft).length} drafts).`);

// ---- the plan
const hasCountries = (doc) => Array.isArray(doc.countries) && doc.countries.length > 0;
const plan = [];
const skippedHave = [];
const skippedDrafts = [];
const needPerson = [];
for (const doc of before) {
  if (isDraft(doc)) {
    skippedDrafts.push(doc);
    continue;
  }
  if (hasCountries(doc)) {
    skippedHave.push(doc);
    continue;
  }
  const { ids, source } = countriesOfTour(doc);
  if (ids.length === 0) {
    needPerson.push(doc);
  } else {
    plan.push({ doc, ids, source });
  }
}

const byFolder = {};
for (const { doc, ids, source } of plan) {
  const row = (byFolder[doc.parent] ??= { docs: 0, folder: 0, title: 0, countries: new Set() });
  row.docs++;
  row[source]++;
  ids.forEach((id) => row.countries.add(id));
}
console.log('\nWould fill the field on:');
console.table(Object.fromEntries(Object.entries(byFolder).map(([folder, row]) => [folder, { ...row, countries: [...row.countries].join(', ') }])));
console.log(`Already have countries (left alone): ${skippedHave.length}`);
console.log(`Drafts (left alone, never touched): ${skippedDrafts.length}`);
for (const doc of skippedDrafts) {console.log(`  ${doc._id}  ${doc.title ?? '(no title)'}  updated ${doc._updatedAt}`);}
console.log(`No country found, a person must choose (left alone): ${needPerson.length}`);
for (const doc of needPerson) {console.log(`  ${doc._id}  ${doc.title}  (folder: ${doc.parent})`);}

console.log('\nFrom the title or route, not from the folder (please look at these):');
for (const { doc, ids } of plan.filter((p) => p.source === 'title')) {
  console.log(`  ${doc._id}  ${doc.title}  ->  ${ids.join(', ')}`);
}

fs.mkdirSync(backupDir, { recursive: true });
const csv = ['id,draft,folder,category,title,countries,source'];
for (const { doc, ids, source } of plan) {
  csv.push([doc._id, isDraft(doc), doc.parent, doc.category ?? '', JSON.stringify(doc.title ?? ''), ids.join('|'), source].join(','));
}
const planFile = path.join(backupDir, `tour-countries-plan-${stamp}.csv`);
fs.writeFileSync(planFile, '﻿' + csv.join('\n'));
console.log(`\nPlan saved: ${planFile}`);

if (!write) {
  console.log('\nDry run: nothing was written. Add --write to do it.');
  process.exit(0);
}

// ---- the copy, then the write
const backupFile = path.join(backupDir, `tour-countries-before-${stamp}.json`);
fs.writeFileSync(backupFile, JSON.stringify(before, null, 1));
const reread = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
if (reread.length !== before.length) {
  console.error('The backup file does not hold every document. Stopping.');
  process.exit(1);
}
console.log(`Backup of ${before.length} documents saved and read back: ${backupFile}`);

let written = 0;
const failed = [];
for (let i = 0; i < plan.length; i += 20) {
  const batch = plan.slice(i, i + 20);
  const transaction = client.transaction();
  for (const { doc, ids } of batch) {
    transaction.patch(doc._id, { ifRevisionID: doc._rev, set: { countries: ids } });
  }
  try {
    await transaction.commit();
    written += batch.length;
  } catch {
    // The whole batch is refused when one document changed since it was read: do those one by one, so only the changed ones are skipped.
    for (const { doc, ids } of batch) {
      try {
        await client.patch(doc._id).ifRevisionId(doc._rev).set({ countries: ids }).commit();
        written++;
      } catch (single) {
        failed.push(`${doc._id}: ${single.message}`);
      }
    }
  }
}
console.log(`Written: ${written} of ${plan.length}. Skipped because they changed meanwhile or failed: ${failed.length}`);
for (const line of failed) {console.log('  ' + line);}

// ---- the proof
const after = await fetchTours();
const planned = new Map(plan.map((p) => [p.doc._id, p.ids]));
const strip = (doc) => {
  const { countries, _rev, _updatedAt, ...rest } = doc;
  return JSON.stringify(rest);
};
const beforeById = new Map(before.map((d) => [d._id, d]));
const problems = [];
if (after.length !== before.length) {problems.push(`document count changed: ${before.length} -> ${after.length}`);}
for (const doc of after) {
  const old = beforeById.get(doc._id);
  if (!old) {problems.push(`new document appeared: ${doc._id}`); continue;}
  if (strip(doc) !== strip(old)) {problems.push(`${doc._id}: a field other than countries differs (an editor may have changed it meanwhile)`);}
  const want = planned.get(doc._id);
  const stillWanted = failed.every((f) => !f.startsWith(doc._id));
  if (want && stillWanted && JSON.stringify(doc.countries) !== JSON.stringify(want)) {problems.push(`${doc._id}: countries is ${JSON.stringify(doc.countries)}, planned ${JSON.stringify(want)}`);}
  if (!want && JSON.stringify(doc.countries ?? null) !== JSON.stringify(old.countries ?? null)) {problems.push(`${doc._id}: countries changed although it was not planned`);}
}
for (const id of beforeById.keys()) {
  if (!after.some((d) => d._id === id)) {problems.push(`document missing now: ${id}`);}
}
if (problems.length === 0) {
  console.log(`\nPASS: ${after.length} documents, none missing, nothing but "countries" differs from the backup, every planned value is in place.`);
} else {
  console.log('\nFAIL:');
  for (const line of problems) {console.log('  ' + line);}
  process.exitCode = 1;
}

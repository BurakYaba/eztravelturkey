// Fills the "Ülkeler" (countries) field of the blog, once, with what the site works out for it today, so the field starts out equal to what
// visitors see, plus the few posts that are about more countries than the category they sit in.
//
//   node --env-file-if-exists=.env.local scripts/sanity/set-blog-countries.mjs            dry run: writes nothing, prints the plan
//   node --env-file-if-exists=.env.local scripts/sanity/set-blog-countries.mjs --write    does it
//
// What it fills:
// - every published blog CATEGORY without countries: the countries its folder names (blog/turkey -> turkey, blog/turkey-greece -> turkey and
//   greece). A category whose folder names no country is listed and left for a person.
// - a published blog POST without countries only when the country names in its own address (the last part) are not all among the ones of its
//   category: "blog/turkey/can-i-do-turkey-and-greece-together" gets turkey and greece. Every other post is left empty on purpose: it follows
//   its category. The list is printed so a person can check it.
//
// What keeps the editors' work safe (same rules as set-tour-countries.mjs):
// - a full copy of every blog category and post (published and drafts) is saved to data/backups/ BEFORE anything is written;
// - only the `countries` field is written, only where it is missing or empty, with the revision the script read (`ifRevisionID`): a document
//   an editor changed in the meantime is skipped, not overwritten;
// - drafts are never touched (they are the editors' work in progress); a published document that has a draft is skipped too, so the
//   editor's draft and the published copy do not drift apart;
// - afterwards everything is read again and compared with the copy: all fields except `countries` must be identical.
//
// SANITY_DATASET picks the dataset (default production). Needs SANITY_WRITE_TOKEN (Editor).
import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import { countriesOfFolder, countryIds } from './tour-countries.mjs';

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
const fetchDocs = () => client.fetch('*[_type in ["blogCategory", "blogPost"]] | order(_id asc)');

const before = await fetchDocs();
const isDraft = (doc) => doc._id.startsWith('drafts.');
const siteLanguages = ['zh'];
const has = (doc) => Array.isArray(doc.countries) && doc.countries.length > 0;
const ordered = (ids) => countryIds.filter((id) => ids.includes(id));
console.log(`Dataset ${dataset}: ${before.length} blog documents (${before.filter(isDraft).length} drafts).`);

const draftsOf = new Set(before.filter(isDraft).map((d) => d._id.replace(/^drafts\./, '')));
const categories = new Map(before.filter((d) => d._type === 'blogCategory' && !isDraft(d)).map((d) => [`${d.language} ${d.path}`, d]));

// ---- the plan
const plan = [];
const left = [];
const needPerson = [];
for (const doc of before) {
  if (isDraft(doc) || !siteLanguages.includes(doc.language)) {continue;}
  if (has(doc)) {left.push(`${doc._id} (has countries)`); continue;}
  if (draftsOf.has(doc._id)) {left.push(`${doc._id} (has a draft: left alone)`); continue;}
  const [, folder = '', ...rest] = (doc.path ?? '').split('/');
  if (doc._type === 'blogCategory') {
    const ids = ordered(countriesOfFolder(folder));
    if (ids.length === 0) {needPerson.push(doc);} else {plan.push({ doc, ids, why: 'category folder' });}
    continue;
  }
  // a post: only when its own address names a country its category does not
  const category = categories.get(`${doc.language} blog/${folder}`);
  const ofCategory = ordered(category && has(category) ? category.countries : countriesOfFolder(folder));
  const named = ordered(countriesOfFolder(rest.join('/')));
  if (named.length > 0 && !named.every((id) => ofCategory.includes(id))) {
    plan.push({ doc, ids: ordered([...ofCategory, ...named]), why: `address names ${named.join(', ')}; category has ${ofCategory.join(', ') || 'none'}` });
  }
}

console.log(`\nWould fill ${plan.length} documents:`);
for (const { doc, ids, why } of plan) {console.log(`  ${doc._type === 'blogCategory' ? 'CATEGORY' : 'post    '} ${doc.path}  ->  ${ids.join(', ')}   (${why})`);}
console.log(`\nLeft alone: ${left.length}`);
for (const line of left.filter((l) => l.includes('draft'))) {console.log('  ' + line);}
console.log(`No country found, a person must choose: ${needPerson.length}`);
for (const doc of needPerson) {console.log(`  ${doc.path}`);}

if (!write) {
  console.log('\nDry run: nothing was written. Add --write to do it.');
  process.exit(0);
}

// ---- the copy, then the write
fs.mkdirSync(backupDir, { recursive: true });
const backupFile = path.join(backupDir, `blog-countries-before-${stamp}.json`);
fs.writeFileSync(backupFile, JSON.stringify(before, null, 1));
if (JSON.parse(fs.readFileSync(backupFile, 'utf8')).length !== before.length) {
  console.error('The backup file does not hold every document. Stopping.');
  process.exit(1);
}
console.log(`\nBackup of ${before.length} documents saved and read back: ${backupFile}`);

let written = 0;
const failed = [];
for (const { doc, ids } of plan) {
  try {
    await client.patch(doc._id).ifRevisionId(doc._rev).set({ countries: ids }).commit();
    written++;
  } catch (error) {
    failed.push(`${doc._id}: ${error.message}`);
  }
}
console.log(`Written: ${written} of ${plan.length}. Skipped because they changed meanwhile or failed: ${failed.length}`);
for (const line of failed) {console.log('  ' + line);}

// ---- the proof
const after = await fetchDocs();
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
  if (want && failed.every((f) => !f.startsWith(doc._id)) && JSON.stringify(doc.countries) !== JSON.stringify(want)) {
    problems.push(`${doc._id}: countries is ${JSON.stringify(doc.countries)}, planned ${JSON.stringify(want)}`);
  }
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

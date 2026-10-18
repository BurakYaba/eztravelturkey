// Checks that what is in Sanity is what was scraped (docs/project-plan.md P6.8): the number of tours and pages per language,
// then 20 random tours field by field, then that their pictures really load.
//
//   node --env-file-if-exists=.env.local scripts/sanity/verify-import.mjs [--seed=1] [--sample=20]
//
// Reads only. SANITY_DATASET picks the dataset (default production). Exits with 1 when anything differs.
import { createClient } from '@sanity/client';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const option = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const sample = Number(option('sample', 20));
let seed = Number(option('seed', 1));
const random = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const dataset = process.env.SANITY_DATASET ?? 'production';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w',
  dataset,
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
  // What visitors see: an unpublished draft in the Studio does not count.
  perspective: 'published',
});

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.json') ? [path.join(dir, e.name)] : [],
      )
    : [];
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const israel = /israel|以色列|イスラエル/i;
const without = (items) => (items ?? []).filter((item) => !israel.test(item));

const problems = [];
const note = (message) => {
  problems.push(message);
  console.log(`  ✗ ${message}`);
};

console.log(`Dataset ${dataset}`);
for (const lang of ['en', 'zh', 'jp']) {
  const tours = walk(path.join(root, 'content/scraped', lang, 'tours')).map(readJson);
  const pages = walk(path.join(root, 'content/scraped', lang, 'pages')).map(readJson);
  const stored = await client.fetch(
    `{ "tours": count(*[_type == "tour" && language == $lang]), "paths": *[_type in ["destinationPage","blogPost","blogCategory","author","staticPage","hubPage"] && language == $lang].path }`,
    { lang },
  );
  const toursOk = stored.tours === tours.length;
  console.log(`${lang}: tours ${stored.tours}/${tours.length}${toursOk ? '' : ' ✗'}, pages ${stored.paths.length} (scraped ${pages.length})`);
  if (!toursOk) {note(`${lang}: ${stored.tours} tours in Sanity, ${tours.length} scraped`);}
  // Pages can be more than scraped (the editors add pages, the import adds categories) but none may be missing. The home page
  // is a document of its own; the site search page is not kept in the CMS and /videos/ redirects to the blog (D18).
  const have = new Set(stored.paths);
  for (const page of pages) {
    if (page.kind !== 'home' && !['search', 'videos'].includes(page.path) && !have.has(page.path)) {note(`${lang}: page "${page.path}" is not in Sanity`);}
  }
}

console.log(`\n${sample} random tours, field by field`);
const checked = [];
for (const lang of ['en', 'zh', 'jp']) {
  const files = walk(path.join(root, 'content/scraped', lang, 'tours'));
  const take = Math.round((sample * files.length) / 234) || 1; // 118 + 53 + 63 tours, shared out evenly
  const picked = new Set();
  while (picked.size < Math.min(take, files.length)) {picked.add(Math.floor(random() * files.length));}
  for (const index of picked) {
    const t = readJson(files[index]);
    const doc = await client.fetch(
      `*[_type == "tour" && language == $lang && path == $path][0]{ title, metaTitle, metaDescription, summary, days, nights, "eur": price.eur, itinerary[]{ dayLabel, title, text }, included, excluded, importantNotes, highlights, route, faqs, "gallery": gallery[]{ "src": asset->url, "ok": defined(asset->_id) } }`,
      { lang, path: t.path },
    );
    const label = `${lang} ${t.path.split('/').pop()}`;
    if (!doc) {
      note(`${label}: missing in Sanity`);
      continue;
    }
    const same = (name, a, b) => JSON.stringify(a) === JSON.stringify(b) || note(`${label}: ${name} differs`);
    same('title', doc.title, t.title);
    same('metaTitle', doc.metaTitle, t.metaTitle);
    same('metaDescription', doc.metaDescription, t.metaDescription);
    same('summary', doc.summary, t.summary);
    same('itinerary', (doc.itinerary ?? []).map((d) => [d.dayLabel, d.title, d.text]), t.itinerary.map((d) => [d.dayLabel, d.title, d.text]));
    same('included', doc.included ?? [], without(t.included));
    same('excluded', doc.excluded ?? [], without(t.excluded));
    same('importantNotes', doc.importantNotes ?? [], without(t.importantNotes));
    same('route', doc.route ?? [], t.route);
    if (t.price.currency === 'EUR' && t.price.amount > 0) {same('price (EUR)', doc.eur, t.price.amount);}
    if ((doc.faqs ?? []).length !== t.faqs.length) {note(`${label}: ${doc.faqs?.length ?? 0} questions, scraped ${t.faqs.length}`);}
    const pictures = (doc.gallery ?? []).filter((g) => g.ok);
    if (pictures.length !== t.gallery.length) {note(`${label}: ${pictures.length} pictures, scraped ${t.gallery.length}`);}
    for (const g of pictures) {
      const response = await fetch(g.src, { method: 'HEAD' });
      if (!response.ok) {note(`${label}: picture ${g.src} answers ${response.status}`);}
    }
    checked.push(label);
  }
}
console.log(`checked ${checked.length} tours`);
console.log(problems.length === 0 ? '\nAll equal.' : `\n${problems.length} problem(s).`);
process.exit(problems.length === 0 ? 0 : 1);

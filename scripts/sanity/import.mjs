// Imports the scraped content of one language into the Sanity dataset (docs/project-plan.md P6.4).
//
//   node --env-file-if-exists=.env.local scripts/sanity/import.mjs --dry      build the documents and check them
//   node --env-file-if-exists=.env.local scripts/sanity/import.mjs            upload pictures, then write documents
//   ... --lang=en                                                             language folder under content/scraped
//   ... --prune                                                               delete documents of that language that are no longer in the import
//
// Safe to run again: document ids are fixed, pictures are uploaded once (a local cache maps their content hash to the
// Sanity asset), so a second run changes nothing. Needs SANITY_PROJECT_ID, SANITY_DATASET (default "production") and, for a
// real run, SANITY_WRITE_TOKEN (a token with the Editor role) in .env.local.
import { createClient } from '@sanity/client';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;

const lang = option('lang', 'en');
const dry = flag('dry');
const prune = flag('prune');
const dataset = process.env.SANITY_DATASET ?? 'production';

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.json') ? [path.join(dir, e.name)] : [],
      )
    : [];

const manifest = readJson(path.join(root, 'content/scraped/image-manifest.json'));
const cacheDir = path.join(root, 'data/sanity');
mkdirSync(cacheDir, { recursive: true });
const cachePath = path.join(cacheDir, `assets-${dataset}.json`);
/** content hash of the downloaded picture -> Sanity asset id */
const assetIds = existsSync(cachePath) ? readJson(cachePath) : {};

// ---- Israel is not on the site (docs/project-plan.md D4): no unit that mentions it is imported.

const mentionsIsrael = (text) => /israel/i.test(text ?? '');
const withoutIsrael = (items) => (items ?? []).filter((item) => !mentionsIsrael(item));
/** The one search description that listed Israel as a destination: "Jordan, Morocco and Israel" becomes "Jordan and Morocco". */
const scrubMeta = (text) => text.replace(/, Morocco and Israel/i, ' and Morocco');
const faqsWithoutIsrael = (faqs) => (faqs ?? []).filter((f) => !mentionsIsrael(f.q) && !mentionsIsrael(f.a));

// ---- small helpers

/** Ids without a dot: Sanity hides documents whose id contains one from public reads. Long ids get a hash suffix. */
function docId(type, locale, key) {
  const base = `${type}-${locale}-${key || 'home'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '');
  if (base.length <= 110) return base;
  return `${base.slice(0, 100)}-${createHash('sha1').update(base).digest('hex').slice(0, 8)}`;
}

const keyed = (items, make) => items.map((item, i) => ({ _key: `k${i.toString(36)}`, ...make(item, i) }));

const siteHosts = new Set(['www.magnificenttravel.com', 'magnificenttravel.com']);
/** `https://www.magnificenttravel.com/en/destinations/x/` becomes `/destinations/x/`. */
function internalHref(url) {
  try {
    const u = new URL(url);
    if (!siteHosts.has(u.hostname)) return url;
    const p = u.pathname.replace(/^\/(en|zh|jp)(?=\/|$)/, '') || '/';
    return p.endsWith('/') ? p : `${p}/`;
  } catch {
    return url;
  }
}

function durationOf(tour) {
  if (tour.days !== null && tour.nights !== null) return { days: tour.days, nights: tour.nights };
  const m = /(\d+)\s*nights?\s*\/\s*(\d+)/i.exec(tour.facts.duration);
  return m ? { nights: Number(m[1]), days: Number(m[2]) } : {};
}

/** A picture field, or null when the scraped source was never downloaded or not uploaded yet. */
function picture(src, alt) {
  const source = manifest.sources[src];
  const ref = source ? (assetIds[source.sha1] ?? (dry ? `image-${source.sha1}-dry` : null)) : null;
  return ref ? { _type: 'picture', asset: { _type: 'reference', _ref: ref }, alt: alt ?? '' } : null;
}

const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k, clean(v)]),
    );
  }
  return value;
};

// ---- documents

const tourIds = new Map(); // path -> id, for the related-tour references
const tourFiles = walk(path.join(root, 'content/scraped', lang, 'tours')).map(readJson);
for (const t of tourFiles) tourIds.set(t.path, docId('tour', lang, t.path));

function tourDoc(t) {
  const gallery = t.gallery.map((g) => picture(g.src, g.alt)).filter(Boolean);
  const related = t.related
    .filter((r) => !mentionsIsrael(r.title) && !mentionsIsrael(r.url))
    .map((r) => tourIds.get(internalHref(r.url).replace(/^\/|\/$/g, '')))
    .filter(Boolean);
  return clean({
    _id: tourIds.get(t.path),
    _type: 'tour',
    language: lang,
    path: t.path,
    parent: t.parent,
    category: t.category,
    title: t.title,
    metaTitle: t.metaTitle,
    metaDescription: t.metaDescription,
    summary: t.summary,
    ...durationOf(t),
    price: { eur: t.price.currency === 'EUR' && t.price.amount > 0 ? t.price.amount : null, unit: t.price.unit, note: t.price.note },
    facts: t.facts,
    extraFacts: keyed(Object.entries(t.extraFacts), ([label, value]) => ({ _type: 'fact', label, value })),
    route: t.route,
    highlights: withoutIsrael(t.highlights),
    routeMap: { image: t.routeMap.image ? picture(t.routeMap.image.src, t.routeMap.image.alt) : null, intro: t.routeMap.intro },
    itinerary: keyed(t.itinerary, (d) => ({ _type: 'day', ...d })),
    included: withoutIsrael(t.included),
    excluded: withoutIsrael(t.excluded),
    importantNotes: withoutIsrael(t.importantNotes),
    cancellationPolicy: withoutIsrael(t.cancellationPolicy),
    faqs: keyed(faqsWithoutIsrael(t.faqs), (f) => ({ _type: 'faq', ...f })),
    related: related.map((id, i) => ({ _key: `k${i.toString(36)}`, _type: 'reference', _ref: id, _weak: true })),
    gallery: gallery.map((g, i) => ({ _key: `k${i.toString(36)}`, ...g })),
  });
}

const typeOfKind = {
  country: 'destinationPage',
  combo: 'destinationPage',
  category: 'destinationPage',
  'blog-post': 'blogPost',
  'blog-category': 'blogCategory',
  author: 'author',
  static: 'staticPage',
  'destinations-hub': 'hubPage',
  'blog-hub': 'hubPage',
  home: 'homePage',
};

/** Scraped pages that are not content: the search page is code and /videos/ redirects to the blog (D18). */
const skippedPaths = new Set(['search', 'videos']);

function sectionsOf(sections) {
  const kept = sections.flatMap((section) => {
    if (mentionsIsrael(section.heading)) return [];
    const blocks = section.blocks.flatMap((b) => {
      switch (b.type) {
        case 'p':
          return mentionsIsrael(b.text) ? [] : [{ _type: 'paragraph', text: b.text }];
        case 'list': {
          const items = withoutIsrael(b.items);
          return items.length > 0 ? [{ _type: 'list', ordered: b.ordered, items }] : [];
        }
        case 'table': {
          const rows = b.rows.filter((row) => !row.some(mentionsIsrael));
          return rows.length > 0 ? [{ _type: 'table', rows: keyed(rows, (cells) => ({ _type: 'tableRow', cells })) }] : [];
        }
        default: {
          if (mentionsIsrael(b.src) || mentionsIsrael(b.alt)) return [];
          const image = picture(b.src, b.alt);
          return image ? [{ _type: 'imageBlock', image }] : [];
        }
      }
    });
    // A section whose text was all about Israel goes with it; a heading that never had text stays.
    return section.blocks.length > 0 && blocks.length === 0
      ? []
      : [{ _type: 'section', level: section.level, heading: section.heading, blocks: keyed(blocks, (b) => b) }];
  });
  return keyed(kept, (s) => s);
}

function pageDoc(p) {
  const type = typeOfKind[p.kind];
  const sections = sectionsOf(p.sections);
  const cards = p.cards
    .filter((c) => !mentionsIsrael(c.title) && !mentionsIsrael(c.url))
    .map((c) => ({
      _type: 'card',
      title: c.title,
      href: internalHref(c.url),
      meta: c.meta,
      price: c.price,
      image: c.image ? picture(c.image.src, c.image.alt) : null,
    }));
  const firstImage = sections.flatMap((s) => s.blocks).find((b) => b._type === 'imageBlock');
  const mainImage = firstImage?.image ?? cards.find((c) => c.image)?.image ?? null;
  return clean({
    _id: docId(type, lang, p.path),
    _type: type,
    language: lang,
    kind: p.kind,
    ...(type === 'homePage' ? {} : { path: p.path }),
    title: p.h1,
    metaTitle: p.metaTitle,
    metaDescription: scrubMeta(p.metaDescription),
    mainImage,
    sections,
    ...(type === 'homePage' ? { cards: keyed(cards, (c) => c) } : {}),
    faqs: keyed(faqsWithoutIsrael(p.faqs), (f) => ({ _type: 'faq', ...f })),
  });
}

// ---- pictures

const projectId = process.env.SANITY_PROJECT_ID;
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && (!projectId || !token)) {
  console.error('Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in .env.local.');
  process.exit(1);
}
const client = dry ? null : createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

/** Sanity sometimes answers 5xx for a single request (for example when its image worker restarts). Try again a few times. */
async function retry(label, action) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await action();
    } catch (error) {
      const status = error?.statusCode ?? 0;
      if (attempt >= 5 || (status !== 0 && status < 500 && status !== 429)) throw error;
      console.warn(`  ${label} failed (${status || error.message}), try ${attempt + 1} of 5`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function uploadPictures() {
  const needed = new Set();
  const note = (src) => manifest.sources[src] && needed.add(manifest.sources[src].sha1);
  for (const t of tourFiles) {
    t.gallery.forEach((g) => note(g.src));
    if (t.routeMap.image) note(t.routeMap.image.src);
  }
  for (const file of walk(path.join(root, 'content/scraped', lang, 'pages'))) {
    const p = readJson(file);
    p.sections.forEach((s) => s.blocks.forEach((b) => b.type === 'image' && note(b.src)));
    p.cards.forEach((c) => c.image && note(c.image.src));
  }
  const pending = [...needed].filter((sha1) => !assetIds[sha1]);
  console.log(`Pictures: ${needed.size} used, ${pending.length} to upload.`);
  let done = 0;
  async function worker() {
    for (let sha1 = pending.shift(); sha1; sha1 = pending.shift()) {
      const file = manifest.files[sha1];
      const asset = await retry(`picture ${sha1.slice(0, 8)}`, () =>
        client.assets.upload('image', createReadStream(path.join(root, 'data/images', `${sha1}${file.ext}`)), {
          filename: `${sha1}${file.ext}`,
        }),
      );
      assetIds[sha1] = asset._id;
      if (++done % 50 === 0) {
        writeFileSync(cachePath, JSON.stringify(assetIds));
        console.log(`  ${done} uploaded`);
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  writeFileSync(cachePath, JSON.stringify(assetIds));
}

if (!dry) await uploadPictures();

// ---- build, check and write

const pageFiles = walk(path.join(root, 'content/scraped', lang, 'pages')).map(readJson);
const docs = [
  ...tourFiles.map(tourDoc),
  ...pageFiles.filter((p) => !skippedPaths.has(p.path) && typeOfKind[p.kind]).map(pageDoc),
];

const ids = docs.map((d) => d._id);
if (new Set(ids).size !== ids.length) {
  console.error('Duplicate document ids:', ids.filter((id, i) => ids.indexOf(id) !== i).slice(0, 5));
  process.exit(1);
}
const leaking = docs.filter((d) => mentionsIsrael(JSON.stringify(d)));
if (leaking.length > 0) {
  for (const d of leaking.slice(0, 10)) {
    const text = JSON.stringify(d);
    const at = text.search(/israel/i);
    console.error(`${d._id}: ...${text.slice(Math.max(0, at - 60), at + 60)}...`);
  }
  console.error(`${leaking.length} document(s) still mention Israel. Nothing was written.`);
  process.exit(1);
}

const count = (type) => docs.filter((d) => d._type === type).length;
const report = {
  language: lang,
  dataset,
  documents: docs.length,
  tours: count('tour'),
  destinationPages: count('destinationPage'),
  blogPosts: count('blogPost'),
  blogCategories: count('blogCategory'),
  authors: count('author'),
  staticPages: count('staticPage'),
  hubPages: count('hubPage'),
  homePages: count('homePage'),
  pictures: Object.keys(assetIds).length,
};

if (dry) {
  console.log('Dry run, nothing sent:', report);
  process.exit(0);
}

// Fields the client types into Studio (USD price, hotels, departure options) are not in the scraped files, so a
// replace would erase them. Carry them over from the document that is already there.
const keepFields = await client.fetch(
  '*[_type == "tour" && language == $lang]{ _id, "usd": price.usd, hotels, departures }',
  { lang },
);
const kept = new Map(keepFields.map((k) => [k._id, k]));
for (const d of docs) {
  const old = kept.get(d._id);
  if (d._type !== 'tour' || !old) continue;
  if (old.usd != null) d.price = { ...d.price, usd: old.usd };
  if (old.hotels) d.hotels = old.hotels;
  if (old.departures) d.departures = old.departures;
}

for (let i = 0; i < docs.length; i += 25) {
  const tx = client.transaction();
  docs.slice(i, i + 25).forEach((d) => tx.createOrReplace(d));
  await retry('documents', () => tx.commit());
  console.log(`Documents ${Math.min(i + 25, docs.length)}/${docs.length}`);
}

if (prune) {
  const types = ['tour', 'destinationPage', 'blogPost', 'blogCategory', 'author', 'staticPage', 'hubPage', 'homePage'];
  const existing = await client.fetch('*[_type in $types && language == $lang]._id', { types, lang });
  const stale = existing.filter((id) => !ids.includes(id));
  for (let i = 0; i < stale.length; i += 50) {
    const tx = client.transaction();
    stale.slice(i, i + 50).forEach((id) => tx.delete(id));
    await tx.commit();
  }
  console.log(`Pruned ${stale.length} documents that are no longer in the import.`);
}

console.log('Done.', report);

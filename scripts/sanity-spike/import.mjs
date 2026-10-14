// Spike: imports all scraped English content into a throwaway Sanity dataset to measure documents, assets and
// attributes against the Free plan limits (docs/project-plan.md P6.15). It is not the final importer (P6.4).
//
//   node --env-file-if-exists=.env.local scripts/sanity-spike/import.mjs --dry     build documents, count attributes
//   node --env-file-if-exists=.env.local scripts/sanity-spike/import.mjs           upload images and documents
//
// Needs SANITY_PROJECT_ID, SANITY_DATASET (default "spike") and SANITY_WRITE_TOKEN in .env.local for a real run.
import { createClient } from '@sanity/client';
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const outDir = path.join(root, 'data/sanity-spike');
const dry = process.argv.includes('--dry');
const skipImages = process.argv.includes('--no-images');

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.json') ? [path.join(dir, e.name)] : [],
  );

const manifest = readJson(path.join(root, 'content/scraped/image-manifest.json'));
mkdirSync(outDir, { recursive: true });
const assetCachePath = path.join(outDir, 'assets.json');
/** sha1 of the downloaded file → Sanity asset id, so a re-run uploads nothing twice. */
const assetIds = existsSync(assetCachePath) ? readJson(assetCachePath) : {};

const fakeAssetId = (sha1) => {
  const f = manifest.files[sha1];
  return `image-${sha1}-${f.width}x${f.height}-${f.ext.slice(1)}`;
};

function imageField(src, alt) {
  const source = manifest.sources[src];
  if (!source) {
    return null;
  }
  const ref = assetIds[source.sha1] ?? (dry ? fakeAssetId(source.sha1) : null);
  if (!ref) {
    return null;
  }
  return { _type: 'image', asset: { _type: 'reference', _ref: ref }, ...(alt ? { alt } : {}) };
}

let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}`;
const withKey = (value) => ({ _key: key(), ...value });
const clean = (value) => {
  if (Array.isArray(value)) {
    return value.map(clean);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k, clean(v)]),
    );
  }
  return value;
};
const safeId = (value) => value.replace(/[^a-zA-Z0-9._-]+/g, '-');

function tourDoc(t) {
  const gallery = t.gallery.map((g) => imageField(g.src, g.alt)).filter(Boolean).map(withKey);
  const mapImage = t.routeMap.image ? imageField(t.routeMap.image.src, t.routeMap.image.alt) : null;
  return clean({
    _id: `tour.${t.locale}.${safeId(t.path)}`,
    _type: 'tour',
    language: t.locale,
    slug: { _type: 'slug', current: t.slug },
    sourceUrl: t.sourceUrl,
    path: t.path,
    parent: t.parent,
    category: t.category,
    title: t.title,
    metaTitle: t.metaTitle,
    metaDescription: t.metaDescription,
    canonical: t.canonical,
    breadcrumb: t.breadcrumb,
    summary: t.summary,
    facts: t.facts,
    // Old pages sometimes show facts the schema has no name for. A list keeps the attribute count flat.
    extraFacts: Object.entries(t.extraFacts).map(([label, value]) => withKey({ label, value })),
    nights: t.nights,
    days: t.days,
    price: t.price,
    route: t.route,
    routeMap: { image: mapImage, intro: t.routeMap.intro },
    highlights: t.highlights,
    itinerary: t.itinerary.map(withKey),
    included: t.included,
    excluded: t.excluded,
    importantNotes: t.importantNotes,
    cancellationPolicy: t.cancellationPolicy,
    gallery,
    related: t.related.map(withKey),
    faqs: t.faqs.map(withKey),
  });
}

function block(b) {
  switch (b.type) {
    case 'p':
      return withKey({ _type: 'paragraph', text: b.text });
    case 'list':
      return withKey({ _type: 'list', ordered: b.ordered, items: b.items });
    case 'table':
      // Sanity does not allow an array inside an array, so each row becomes an object.
      return withKey({ _type: 'table', rows: b.rows.map((cells) => withKey({ cells })) });
    default:
      return withKey({ _type: 'imageBlock', image: imageField(b.src, b.alt), alt: b.alt });
  }
}

function pageDoc(p) {
  return clean({
    _id: `page.${p.locale}.${safeId(p.path || 'home')}`,
    _type: 'page',
    language: p.locale,
    kind: p.kind,
    sourceUrl: p.sourceUrl,
    path: p.path,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    canonical: p.canonical,
    robots: p.robots,
    h1: p.h1,
    breadcrumb: p.breadcrumb,
    sections: p.sections.map((s) => withKey({ level: s.level, heading: s.heading, blocks: s.blocks.map(block) })),
    cards: p.cards.map((c) =>
      withKey({
        title: c.title,
        url: c.url,
        image: c.image ? imageField(c.image.src, c.image.alt) : null,
        meta: c.meta,
        price: c.price,
      }),
    ),
    faqs: p.faqs.map(withKey),
  });
}

/** Attribute names and paths in the documents, as a rough stand-in for Sanity's own count (checked on its Usage page). */
function attributeStats(docs) {
  const names = new Set();
  const paths = new Set();
  const visit = (value, prefix) => {
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, prefix));
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        names.add(k);
        paths.add(`${prefix}.${k}`);
        visit(v, `${prefix}.${k}`);
      }
    }
  };
  docs.forEach((d) => visit(d, d._type));
  return { distinctNames: names.size, distinctPaths: paths.size };
}

const buildDocs = () => [
  ...walk(path.join(root, 'content/scraped/en/tours')).map((f) => tourDoc(readJson(f))),
  ...walk(path.join(root, 'content/scraped/en/pages')).map((f) => pageDoc(readJson(f))),
];
const makeReport = (docs) => {
  const sizes = docs.map((d) => JSON.stringify(d).length);
  return {
    documents: docs.length,
    tours: docs.filter((d) => d._type === 'tour').length,
    pages: docs.filter((d) => d._type === 'page').length,
    uniqueImages: Object.keys(manifest.files).length,
    largestDocBytes: Math.max(...sizes),
    totalDocBytes: sizes.reduce((a, b) => a + b, 0),
    ...attributeStats(docs),
  };
};

if (dry) {
  console.log('Dry run (nothing sent):', makeReport(buildDocs()));
  process.exit(0);
}

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? 'spike';
const token = process.env.SANITY_WRITE_TOKEN;
if (!projectId || !token) {
  console.error('Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in .env.local.');
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

async function uploadImages() {
  const pending = Object.entries(manifest.files).filter(([sha1]) => !assetIds[sha1]);
  console.log(`Uploading ${pending.length} images (${Object.keys(assetIds).length} already done)...`);
  let done = 0;
  const queue = [...pending];
  async function worker() {
    for (let next = queue.shift(); next; next = queue.shift()) {
      const [sha1, f] = next;
      const file = path.join(root, 'data/images', `${sha1}${f.ext}`);
      const asset = await client.assets.upload('image', createReadStream(file), { filename: `${sha1}${f.ext}` });
      assetIds[sha1] = asset._id;
      if (++done % 50 === 0) {
        writeFileSync(assetCachePath, JSON.stringify(assetIds));
        console.log(`  ${done}/${pending.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  writeFileSync(assetCachePath, JSON.stringify(assetIds));
}

if (!skipImages) {
  await uploadImages();
}
// Documents are built after the upload so every image field has its asset reference.
const final = buildDocs();
for (let i = 0; i < final.length; i += 25) {
  const tx = client.transaction();
  final.slice(i, i + 25).forEach((d) => tx.createOrReplace(d));
  await tx.commit();
  console.log(`Documents ${Math.min(i + 25, final.length)}/${final.length}`);
}
writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({ ...makeReport(final), importedAt: new Date().toISOString() }, null, 2));
console.log('Done.', makeReport(final));

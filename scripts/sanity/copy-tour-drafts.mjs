// Copies tours of magnificenttravel.com into this site as DRAFTS (documents whose id starts with `drafts.`), so nothing shows on the
// site until an editor publishes them. The text stays English (a draft to be translated). It reads the old project's public dataset and
// never writes to it.
//
//   node --env-file-if-exists=.env.local scripts/sanity/copy-tour-drafts.mjs            dry run: prints what it would do
//   node --env-file-if-exists=.env.local scripts/sanity/copy-tour-drafts.mjs --write    uploads the pictures and creates the drafts
//
// What changes on the way:
//   - the address is `destinations/greece-tours/<slug>` (this site has no sub-folder under a country), language `zh`;
//   - the price is left empty (this site's tours have none; the client enters prices), also the "starting price" fact;
//   - `related` (references to other tours of the old project), `category` and `translationGroup` are dropped;
//   - the pictures are downloaded from the old project's CDN and uploaded to this project, and their references rewritten;
//   - "Magnificent Travel" becomes "Eztravel Turkey" in the text.
// A draft that already exists is never replaced. Israel must not appear: a text that names it stops the run.
import path from 'node:path';
import { createClient } from '@sanity/client';

const sourceProject = 'aj0pbi0w';
const targetProject = process.env.SANITY_PROJECT_ID ?? '91izz3mt';
const dataset = process.env.SANITY_DATASET ?? 'production';
const write = process.argv.includes('--write');
if (targetProject === sourceProject) {
  throw new Error(`Refusing to run: the target project is ${sourceProject}, the project of magnificenttravel.com.`);
}

const slugs = [
  '12-days-athens-mykonos-santorini-and-crete-tour',
  '12-days-greece-trip-package',
  '8-days-athens-delphi-meteora-and-santorini-tour',
  '9-days-greece-tour',
];
const sourcePaths = slugs.map((s) => `destinations/greece-tours/greece-travel-packages/${s}`);

const source = createClient({ projectId: sourceProject, dataset, apiVersion: '2025-01-01', useCdn: false });
const sources = await source.fetch('*[_type == "tour" && language == "en" && path in $paths]', { paths: sourcePaths });
if (sources.length !== slugs.length) {
  throw new Error(`Found ${sources.length} of ${slugs.length} tours in the old project.`);
}

// ---- pictures

const refs = new Set();
const collect = (node) => {
  if (Array.isArray(node)) {
    node.forEach(collect);
  } else if (node && typeof node === 'object') {
    if (typeof node._ref === 'string' && node._ref.startsWith('image-')) {
      refs.add(node._ref);
    }
    Object.values(node).forEach(collect);
  }
};
// `related` is dropped, so its references are not pictures; collect only from what is kept
const kept = sources.map(({ related, ...rest }) => rest);
kept.forEach(collect);

const cdnUrl = (ref) => {
  const m = /^image-([0-9a-f]{40})-(\d+x\d+)-([a-z]+)$/.exec(ref);
  if (!m) {
    throw new Error(`Unexpected image reference: ${ref}`);
  }
  return `https://cdn.sanity.io/images/${sourceProject}/production/${m[1]}-${m[2]}.${m[3]}`;
};

// ---- the drafts

const brand = (value) => (typeof value === 'string' ? value.replace(/Magnificent Travel/g, 'Eztravel Turkey') : value);
const walk = (node, fn) => {
  if (Array.isArray(node)) {
    return node.map((n) => walk(n, fn));
  }
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v, fn)]));
  }
  return fn(node);
};

const drafts = kept.map((doc, i) => {
  const slug = slugs[i];
  const { _rev, _createdAt, _updatedAt, _system, category, translationGroup, price, ...rest } = doc;
  const facts = { ...(rest.facts ?? {}) };
  delete facts.startingPrice;
  const draft = walk(
    {
      ...rest,
      _id: `drafts.tour-zh-destinations-greece-tours-${slug}`,
      language: 'zh',
      path: `destinations/greece-tours/${slug}`,
      parent: 'greece-tours',
      facts,
      // the same as the other tours of this site: no price, and the note that asks for an offer
      price: { note: '提出請求', unit: '' },
    },
    brand,
  );
  if (/israel|以色列/i.test(JSON.stringify(draft))) {
    throw new Error(`${slug} names Israel.`);
  }
  return draft;
});

console.log(`source tours: ${sources.length}; pictures to move: ${refs.size}`);
for (const d of drafts) {
  console.log(`  ${d._id}  (${d.days} days, ${d.faqs?.length ?? 0} FAQs, ${d.itinerary?.length ?? 0} itinerary days)`);
}
if (!write) {
  console.log('Dry run: nothing was written. Add --write to create the drafts.');
  process.exit(0);
}

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  throw new Error('SANITY_WRITE_TOKEN is not set (an Editor token of project 91izz3mt, kept in .env.local).');
}
const target = createClient({ projectId: targetProject, dataset, apiVersion: '2025-01-01', token, useCdn: false });

const newAsset = new Map();
for (const ref of refs) {
  let buffer;
  for (let attempt = 1; attempt <= 4 && !buffer; attempt++) {
    try {
      const response = await fetch(cdnUrl(ref), { signal: AbortSignal.timeout(90000) });
      if (response.ok) {
        buffer = Buffer.from(await response.arrayBuffer());
      }
    } catch {
      // try again
    }
    if (!buffer) {
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt * attempt));
    }
  }
  if (!buffer) {
    throw new Error(`Could not download ${cdnUrl(ref)}`);
  }
  // The same file uploaded again gives the same asset, so a run that stopped halfway can simply be started again.
  const asset = await target.assets.upload('image', buffer, { filename: path.basename(cdnUrl(ref)) });
  newAsset.set(ref, asset._id);
}
console.log(`uploaded ${newAsset.size} pictures`);

const withNewAssets = (node) => {
  if (Array.isArray(node)) {
    return node.map(withNewAssets);
  }
  if (node && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).map(([k, v]) => [k, k === '_ref' && newAsset.has(v) ? newAsset.get(v) : withNewAssets(v)]),
    );
  }
  return node;
};

for (const draft of drafts) {
  await target.createIfNotExists(withNewAssets(draft));
  console.log(`created ${draft._id} (left alone if it already existed)`);
}
console.log('Done.');

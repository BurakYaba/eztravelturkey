// Imports the corrected Traditional Chinese documents of the old eztravelturkey.com into the Sanity project of THIS site.
//
//   node scripts/sanity/import-zh.mjs            dry run: reads the file, downloads nothing, writes nothing, reports what it would do
//   node scripts/sanity/import-zh.mjs --check    dry run that also checks every picture can be fetched from the old project's CDN
//   node scripts/sanity/import-zh.mjs --write    uploads the pictures and writes the documents (needs SANITY_WRITE_TOKEN, Editor role)
//
// The 72 documents come from data/zh-documents-fixed-2026-10-29.ndjson (the production export of 2026-10-19 with the character
// fixes of 2026-10-29). 282 pictures in them belong to the Sanity project of magnificenttravel.com (`aj0pbi0w`). A picture cannot be
// moved between projects, so each is downloaded from that project's public CDN, uploaded to this project, and its `_ref` rewritten
// to the new asset; the alt text stays where it is. Nothing is ever written to or deleted from the old project.
//
// Safety: it writes only to project 91izz3mt, and only into an empty dataset unless --allow-existing is given.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const root = path.resolve(import.meta.dirname, '../..');
const file = path.join(root, 'data/zh-documents-fixed-2026-10-29.ndjson');
const sourceProject = 'aj0pbi0w';
const targetProject = process.env.SANITY_PROJECT_ID ?? '91izz3mt';
const dataset = process.env.SANITY_DATASET ?? 'production';
const args = new Set(process.argv.slice(2));
const write = args.has('--write');
const check = args.has('--check') || write;

if (targetProject === sourceProject) {
  throw new Error(`Refusing to run: the target project is ${sourceProject}, the project of magnificenttravel.com.`);
}

const docs = readFileSync(file, 'utf8')
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line));

// ---- the pictures

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
docs.forEach(collect);

/** `image-<hash>-768x500-jpg` is the file `<hash>-768x500.jpg` of the old project's CDN. */
const cdnUrl = (ref) => {
  const m = /^image-([0-9a-f]{40})-(\d+x\d+)-([a-z]+)$/.exec(ref);
  if (!m) {
    throw new Error(`Unexpected image reference: ${ref}`);
  }
  return `https://cdn.sanity.io/images/${sourceProject}/production/${m[1]}-${m[2]}.${m[3]}`;
};

console.log(`documents: ${docs.length}  (${[...new Set(docs.map((d) => d._type))].sort().join(', ')})`);
console.log(`pictures: ${refs.size} different asset references`);
console.log(`target: project ${targetProject}, dataset ${dataset}${write ? '  [WRITE]' : '  [dry run]'}`);

const pool = async (items, size, worker) => {
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await worker(items[i], i);
      }
    }),
  );
  return results;
};

const fetchOk = async (url, tries = 4) => {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (response.ok) {
        return response;
      }
      if (response.status < 500 && response.status !== 429) {
        throw new Error(`${response.status} for ${url}`);
      }
    } catch (error) {
      if (attempt >= tries) {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt * attempt));
  }
};

if (check && !write) {
  let ok = 0;
  const bad = [];
  await pool([...refs], 8, async (ref) => {
    try {
      const response = await fetchOk(cdnUrl(ref));
      await response.body?.cancel();
      ok++;
    } catch (error) {
      bad.push(`${ref}: ${error.message}`);
    }
  });
  console.log(`pictures reachable on the old CDN: ${ok} of ${refs.size}`);
  bad.slice(0, 10).forEach((b) => console.log('  UNREACHABLE', b));
}

if (!write) {
  console.log('Dry run finished: nothing was written.');
  process.exit(0);
}

// ---- writing

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  throw new Error('SANITY_WRITE_TOKEN is not set (an Editor token of project 91izz3mt, kept in .env.local).');
}
const client = createClient({ projectId: targetProject, dataset, apiVersion: '2025-01-01', token, useCdn: false });

const existing = await client.fetch('count(*[!(_type match "system.*")])');
if (existing > 0 && !args.has('--allow-existing')) {
  throw new Error(`The dataset already holds ${existing} documents. Nothing was written. Use --allow-existing to overwrite documents with the same id.`);
}

const newAsset = new Map();
let done = 0;
await pool([...refs], 6, async (ref) => {
  const response = await fetchOk(cdnUrl(ref));
  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = cdnUrl(ref).split('/').pop();
  const asset = await client.assets.upload('image', buffer, { filename });
  newAsset.set(ref, asset._id);
  if (++done % 25 === 0) {
    console.log(`  uploaded ${done} of ${refs.size}`);
  }
});
console.log(`uploaded ${newAsset.size} pictures`);

const rewrite = (node) => {
  if (Array.isArray(node)) {
    return node.map(rewrite);
  }
  if (node && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [
        key,
        key === '_ref' && typeof value === 'string' && newAsset.has(value) ? newAsset.get(value) : rewrite(value),
      ]),
    );
  }
  return node;
};

const clean = ({ _rev, _createdAt, _updatedAt, ...rest }) => rewrite(rest);
const batches = [];
for (let i = 0; i < docs.length; i += 10) {
  batches.push(docs.slice(i, i + 10));
}
for (const batch of batches) {
  const tx = client.transaction();
  batch.forEach((doc) => tx.createOrReplace(clean(doc)));
  await tx.commit();
}
console.log(`wrote ${docs.length} documents.`);

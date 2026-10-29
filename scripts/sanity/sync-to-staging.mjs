// Makes the `staging` dataset an exact copy of the published documents of `production`, so tests that write test content (marker
// texts, removed items, cleared fields) never touch what the client edits. `sanity datasets copy` cannot write into a dataset that
// exists, hence this script. It reads production and writes only to staging; it refuses anything else.
//
//   node --env-file-if-exists=.env.local scripts/sanity/sync-to-staging.mjs
//
// Drafts of production are not copied (the site shows published content only). Pictures (asset documents) are copied too; their
// `url` still points at the production file, so pictures show in the staging site.
import { createClient } from '@sanity/client';

const token = process.env.SANITY_WRITE_TOKEN;
const make = (dataset) => createClient({ projectId: '91izz3mt', dataset, apiVersion: '2025-01-01', token, useCdn: false, perspective: 'raw' });
const production = make('production');
const staging = make('staging');
if (!token) {throw new Error('SANITY_WRITE_TOKEN is missing');}

const isPublished = (doc) => !doc._id.startsWith('drafts.') && !doc._id.startsWith('_.') && !doc._type.startsWith('system.');
const source = (await production.fetch('*[!(_type match "system.*")]')).filter(isPublished);
const wanted = new Set(source.map((doc) => doc._id));
console.log(`production: ${source.length} documents`);

// remove what staging has and production does not (old copies, test documents, drafts)
const existing = await staging.fetch('*[!(_type match "system.*") && !(_id match "_.*")]{ _id }');
const extra = existing.map((doc) => doc._id).filter((id) => !wanted.has(id));
for (let i = 0; i < extra.length; i += 100) {
  const tx = staging.transaction();
  extra.slice(i, i + 100).forEach((id) => tx.delete(id));
  await tx.commit();
}
console.log(`staging: ${extra.length} documents removed that production does not have`);

// A document can only point at one that exists: pictures first, then the authors the posts point at, then everything else.
const rank = (doc) => (doc._type.startsWith('sanity.') ? 0 : doc._type === 'author' ? 1 : 2);
const ordered = [...source].sort((a, b) => rank(a) - rank(b));
let written = 0;
for (let i = 0; i < ordered.length; i += 40) {
  const tx = staging.transaction();
  const batch = ordered.slice(i, i + 40);
  for (const { _rev, _updatedAt, ...doc } of batch) {tx.createOrReplace(doc);}
  await tx.commit();
  written += batch.length;
}
console.log(`staging: ${written} documents written`);

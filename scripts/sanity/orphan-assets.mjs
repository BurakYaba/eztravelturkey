// Finds pictures and files in Sanity that no document uses any more and, only when asked, deletes them
// (docs/project-plan.md P6.16). Sanity never deletes an asset by itself, and the free plan counts the storage.
//
//   node --env-file-if-exists=.env.local scripts/sanity/orphan-assets.mjs            report only
//   node --env-file-if-exists=.env.local scripts/sanity/orphan-assets.mjs --delete   report, then delete what was listed
//
// Safety rules: an asset younger than 7 days is never listed (someone may have uploaded it and not placed it yet);
// drafts count as users, so a picture in an unpublished draft is kept; the report always comes first, and the weekly
// workflow only reports. Deleting needs SANITY_WRITE_TOKEN (Editor). SANITY_DATASET picks the dataset (default production).
// Nothing outside Sanity is checked: a picture address typed into the code or into another site would break.
import { createClient } from '@sanity/client';
import { appendFileSync } from 'node:fs';

const dataset = process.env.SANITY_DATASET ?? 'production';
const token = process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_CLEANUP_TOKEN;
const remove = process.argv.includes('--delete');
// 7 days unless ORPHAN_GRACE_DAYS says otherwise (only for trying the script on a test dataset).
const graceDays = Number(process.env.ORPHAN_GRACE_DAYS ?? 7);

if (!token) {
  console.error('Set SANITY_WRITE_TOKEN (or SANITY_CLEANUP_TOKEN) to read the assets.');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w',
  dataset,
  token,
  apiVersion: '2025-01-01',
  useCdn: false,
  // `raw` shows drafts as well, so a picture used only by a draft is not called unused.
  perspective: 'raw',
});

const orphans = await client.fetch(
  `*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && dateTime(_createdAt) < dateTime(now()) - 60*60*24*$days && count(*[references(^._id)]) == 0]{ _id, _type, url, size, originalFilename, _createdAt } | order(_createdAt asc)`,
  { days: graceDays },
);
const total = await client.fetch('count(*[_type in ["sanity.imageAsset", "sanity.fileAsset"]])');
const megabytes = orphans.reduce((sum, a) => sum + (a.size ?? 0), 0) / 1024 / 1024;

const lines = [
  `Dataset ${dataset}: ${total} assets, ${orphans.length} unused for more than ${graceDays} days (${megabytes.toFixed(1)} MB).`,
  ...orphans.slice(0, 200).map((a) => `- ${a._id}  ${a.originalFilename ?? ''}  ${((a.size ?? 0) / 1024).toFixed(0)} KB  ${a._createdAt.slice(0, 10)}`),
  ...(orphans.length > 200 ? [`... and ${orphans.length - 200} more`] : []),
];
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Unused Sanity assets\n\n${lines.join('\n')}\n`);
}

if (!remove || orphans.length === 0) {
  if (!remove && orphans.length > 0) {
    console.log('\nReport only. Run with --delete to remove them (make a backup first: scripts/sanity/backup.mjs).');
  }
  process.exit(0);
}

for (let i = 0; i < orphans.length; i += 100) {
  const transaction = client.transaction();
  for (const asset of orphans.slice(i, i + 100)) {
    transaction.delete(asset._id);
  }
  // A picture that became used between the report and now is refused by Sanity (it is still referenced): skip those.
  await transaction.commit().catch((error) => console.error(`Batch ${i / 100 + 1} not fully deleted: ${error.message}`));
}
console.log(`Deleted ${orphans.length} assets (those still referenced were refused).`);

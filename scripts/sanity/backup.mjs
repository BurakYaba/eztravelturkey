// Saves every document of the dataset as one compressed NDJSON file (docs/project-plan.md P6.7). Sanity does not back up
// Free projects, so this is the copy that can bring the content back.
//
//   node --env-file-if-exists=.env.local scripts/sanity/backup.mjs [output.ndjson.gz]
//
// SANITY_BACKUP_TOKEN (a Viewer token) makes the export include drafts; without it only published documents are saved.
// SANITY_DATASET picks the dataset (default production). The picture and file themselves are not in this file: the weekly
// workflow also exports them (`sanity dataset export`), and the pictures that came from the old site are in data/.
// Restore: docs/backup-restore.md.
import { createReadStream, createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGunzip, createGzip } from 'node:zlib';

const projectId = process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w';
const dataset = process.env.SANITY_DATASET ?? 'production';
const token = process.env.SANITY_BACKUP_TOKEN ?? process.env.SANITY_WRITE_TOKEN;
const stamp = new Date().toISOString().slice(0, 10);
const output = process.argv[2] ?? `${dataset}-${stamp}.ndjson.gz`;

const response = await fetch(`https://${projectId}.api.sanity.io/v2025-01-01/data/export/${dataset}`, {
  headers: token ? { authorization: `Bearer ${token}` } : {},
});
if (!response.ok || !response.body) {
  console.error(`Export failed: ${response.status} ${await response.text()}`);
  process.exit(1);
}

let bytes = 0;
const counter = async function* (source) {
  for await (const chunk of source) {
    bytes += chunk.length;
    yield chunk;
  }
};
await pipeline(Readable.fromWeb(response.body), counter, createGzip(), createWriteStream(output));

// A backup that cannot be read back is worth nothing: count the documents in what was written.
let text = '';
for await (const chunk of createReadStream(output).pipe(createGunzip())) {
  text += chunk;
}
const documents = text.split('\n').filter((line) => line.trim()).length;
if (documents === 0) {
  console.error('The backup file holds no documents.');
  process.exit(1);
}
console.log(`${output}: ${documents} documents, ${(bytes / 1024 / 1024).toFixed(1)} MB before compression.`);

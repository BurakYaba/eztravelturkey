// Creates the team members shown on the About and Contact pages (docs/project-plan.md P3.9).
//
//   node --env-file-if-exists=.env.local scripts/sanity/import-team.mjs --dry
//   node --env-file-if-exists=.env.local scripts/sanity/import-team.mjs
//
// The text comes from scripts/sanity/team.json (what the client sent on 2026-10-12). The portraits are in
// data/client-inputs/ (not in git); they are uploaded as Sanity assets. A person who already exists is left alone, so
// edits made in Studio are never overwritten. SANITY_DATASET picks the dataset (default production).
import { createClient } from '@sanity/client';
import { existsSync, readFileSync, createReadStream } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const dry = process.argv.includes('--dry');
const dataset = process.env.SANITY_DATASET ?? 'production';
const people = JSON.parse(readFileSync(path.join(import.meta.dirname, 'team.json'), 'utf8'));

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w',
  dataset,
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
});

if (!dry && !process.env.SANITY_WRITE_TOKEN) {
  console.error('Set SANITY_WRITE_TOKEN in .env.local.');
  process.exit(1);
}

for (const person of people) {
  const file = path.join(root, 'data/client-inputs', person.photo);
  if (!existsSync(file)) {
    console.error(`Missing portrait ${file}`);
    process.exit(1);
  }
  const exists = !dry && (await client.fetch('count(*[_id == $id]) > 0', { id: person.id }));
  if (exists) {
    console.log(`${person.name}: already there, left alone.`);
    continue;
  }
  if (dry) {
    console.log(`${person.name}: would be created in ${dataset}.`);
    continue;
  }
  const asset = await client.assets.upload('image', createReadStream(file), { filename: person.photo });
  await client.createIfNotExists({
    _id: person.id,
    _type: 'teamMember',
    language: person.language,
    name: person.name,
    role: person.role,
    email: person.email,
    hours: person.hours,
    timezone: person.timezone,
    order: person.order,
    photo: { _type: 'picture', asset: { _type: 'reference', _ref: asset._id }, alt: person.alt },
  });
  console.log(`${person.name}: created in ${dataset}.`);
}

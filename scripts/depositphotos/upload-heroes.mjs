// Puts the chosen Depositphotos pictures into Sanity as the "Main picture" (heroImage) of each tour.
//
//   node --env-file-if-exists=.env.local scripts/depositphotos/upload-heroes.mjs --dry
//   node --env-file-if-exists=.env.local scripts/depositphotos/upload-heroes.mjs
//
// Reads data/depositphotos/proposal.json and the files in data/depositphotos/originals/. Each picture is scaled down to
// at most 2400 px wide (the originals are 2000 to 6000 px), uploaded once, and set on its tour. SANITY_DATASET picks the
// dataset (default production). A tour that already has a main picture keeps it unless --replace is given.
import { createClient } from '@sanity/client';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '../..');
const dir = path.join(root, 'data/depositphotos');
const dry = process.argv.includes('--dry');
const replace = process.argv.includes('--replace');
const dataset = process.env.SANITY_DATASET ?? 'production';

const proposal = JSON.parse(readFileSync(path.join(dir, 'proposal.json'), 'utf8'));
const originals = new Map(readdirSync(path.join(dir, 'originals')).map((f) => [f.match(/Depositphotos_(\d+)_/)?.[1], f]));
const cachePath = path.join(dir, `assets-${dataset}.json`);
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};

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

const tours = await client.fetch('*[_type == "tour" && language == "en"]{ _id, path, "has": defined(heroImage) }');
const byPath = new Map(tours.map((t) => [t.path, t]));
const alt = (title) => title.replace(/\s+/g, ' ').replace(/^\d{1,2} \w{3} \d{4},? ?/, '').trim().slice(0, 140);

const plan = proposal.filter((p) => p.pick && byPath.has(p.path) && (replace || !byPath.get(p.path).has));
const missing = plan.filter((p) => !originals.has(p.pick.id));
console.log(`${proposal.length} tours in the proposal, ${plan.length} to set in ${dataset}, ${missing.length} without a downloaded file`);
if (dry) process.exit(0);

let n = 0;
for (const item of plan) {
  const file = originals.get(item.pick.id);
  if (!file) continue;
  if (!cache[item.pick.id]) {
    const buffer = await sharp(path.join(dir, 'originals', file))
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
    const asset = await client.assets.upload('image', buffer, { filename: `depositphotos-${item.pick.id}.jpg` });
    cache[item.pick.id] = asset._id;
    writeFileSync(cachePath, JSON.stringify(cache));
  }
  await client
    .patch(byPath.get(item.path)._id)
    .set({ heroImage: { _type: 'picture', asset: { _type: 'reference', _ref: cache[item.pick.id] }, alt: alt(item.pick.title) } })
    .commit();
  n++;
  if (n % 10 === 0) console.log(`${n}/${plan.length}`);
}
console.log(`done: ${n} tours set in ${dataset}`);

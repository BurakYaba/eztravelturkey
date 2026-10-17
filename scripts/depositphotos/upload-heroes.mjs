// Puts the chosen Depositphotos pictures into Sanity as the "Main picture" (heroImage) of each tour.
//
//   node --env-file-if-exists=.env.local scripts/depositphotos/upload-heroes.mjs --dry
//   node --env-file-if-exists=.env.local scripts/depositphotos/upload-heroes.mjs
//
// Reads data/depositphotos/proposal.json and the files in data/depositphotos/originals/. Each picture is scaled down to
// at most 2400 px wide (the originals are 2000 to 6000 px), uploaded once, and set on its tour. SANITY_DATASET picks the
// dataset (default production). A tour that already has a main picture keeps it unless --replace is given.
//
// --lang=zh|jp --file=proposal-zh.json sets the heroes of the Chinese or Japanese tours (match-heroes-cjk.mjs): a tour that has the same
// tour in English takes that tour's picture (`copyFrom`), the others take the picture chosen for them.
import { createClient } from '@sanity/client';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '../..');
const dir = path.join(root, 'data/depositphotos');
const dry = process.argv.includes('--dry');
const replace = process.argv.includes('--replace');
const lang = process.argv.find((a) => a.startsWith('--lang='))?.slice(7) ?? 'en';
const dataset = process.env.SANITY_DATASET ?? 'production';

// --file=destination-proposal.json sets the main picture of destination pages instead of the hero of tours.
const file = process.argv.find((a) => a.startsWith('--file='))?.slice(7) ?? 'proposal.json';
const forPages = file.startsWith('destination');
const docType = forPages ? 'destinationPage' : 'tour';
const field = forPages ? 'mainImage' : 'heroImage';
const proposal = JSON.parse(readFileSync(path.join(dir, file), 'utf8'));
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

const tours = await client.fetch(`*[_type == $type && language == $lang]{ _id, path, title, "has": defined(${field}.asset) }`, { type: docType, lang });
const byPath = new Map(tours.map((t) => [t.path, t]));
// the English tours' pictures, for the tours that copy one
const englishHeroes = new Map(
  (await client.fetch(`*[_type == "tour" && language == "en" && defined(heroImage.asset)]{ path, "ref": heroImage.asset._ref }`)).map((t) => [t.path, t.ref]),
);
const alt = (title) => title.replace(/\s+/g, ' ').replace(/^\d{1,2} \w{3} \d{4},? ?/, '').trim().slice(0, 140);

const plan = proposal.filter((p) => (p.pick || p.copyFrom) && byPath.has(p.path) && (replace || !byPath.get(p.path).has));
const missing = plan.filter((p) => p.pick && !originals.has(p.pick.id));
console.log(`${proposal.length} in the proposal, ${plan.length} ${docType} documents to set in ${dataset}, ${missing.length} without a downloaded file`);
if (dry) process.exit(0);

let n = 0;
for (const item of plan) {
  if (item.copyFrom) {
    // the same trip shows the same picture in every language; the description is the tour's own title
    const ref = englishHeroes.get(item.copyFrom);
    if (!ref) continue;
    await client
      .patch(byPath.get(item.path)._id)
      .set({ [field]: { _type: 'picture', asset: { _type: 'reference', _ref: ref }, alt: byPath.get(item.path).title.slice(0, 140) } })
      .commit();
    n++;
    continue;
  }
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
    .set({ [field]: { _type: 'picture', asset: { _type: 'reference', _ref: cache[item.pick.id] }, alt: lang === 'en' ? alt(item.pick.title) : byPath.get(item.path).title.slice(0, 140) } })
    .commit();
  n++;
  if (n % 10 === 0) console.log(`${n}/${plan.length}`);
}
console.log(`done: ${n} ${docType} documents set in ${dataset}`);

// Downloads every image referenced by the parsed pages and builds content/scraped/image-manifest.json.
// Usage: node scripts/scrape/images.mjs [--limit N]
// Images are de-duplicated by the SHA-1 of the source bytes (the same photo is stored and later uploaded once).
// Files go to data/images/ (git-ignored); the manifest is committed so the CMS import knows what to upload.
// The old site only serves fixed thumbnail sizes (950x700 gallery, 800x600 map): larger variants answer 301 and the
// originals are not linked, so these are the best sources available (docs/project-plan.md P1.6 spike result).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createFetcher } from './lib/fetcher.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const limit = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;

const contentDir = join(root, 'content', 'scraped', 'en');
const imageDir = join(root, 'data', 'images');
mkdirSync(imageDir, { recursive: true });
const manifestFile = join(root, 'content', 'scraped', 'image-manifest.json');
const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : { sources: {}, files: {} };

// Collect source URLs and where they are used.
const uses = new Map();
const note = (src, alt, owner, role) => {
  if (!src || !/^https?:/.test(src) || /logo|icon|favicon/i.test(src)) {
    return;
  }
  const entry = uses.get(src) ?? { alt: '', usedBy: [] };
  entry.alt ||= alt;
  entry.usedBy.push({ owner, role });
  uses.set(src, entry);
};

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
    : [];

for (const file of walk(join(contentDir, 'tours')).filter((f) => f.endsWith('.json'))) {
  const tour = JSON.parse(readFileSync(file, 'utf8'));
  for (const image of tour.gallery) note(image.src, image.alt, tour.path, 'gallery');
  if (tour.routeMap.image) note(tour.routeMap.image.src, tour.routeMap.image.alt, tour.path, 'route-map');
}
for (const file of walk(join(contentDir, 'pages')).filter((f) => f.endsWith('.json'))) {
  const page = JSON.parse(readFileSync(file, 'utf8'));
  for (const section of page.sections) {
    for (const block of section.blocks) {
      if (block.type === 'image') note(block.src, block.alt, page.path, 'page');
    }
  }
  for (const card of page.cards) {
    if (card.image) note(card.image.src, card.image.alt, page.path, 'card');
  }
}

// Drop sources that no current page uses (tours the client deleted, replaced images), then files nobody points to.
for (const src of Object.keys(manifest.sources)) {
  if (!uses.has(src)) delete manifest.sources[src];
}
const keep = new Set(Object.values(manifest.sources).map((entry) => entry.sha1));
for (const sha1 of Object.keys(manifest.files)) {
  if (!keep.has(sha1)) delete manifest.files[sha1];
}
const todo = [...uses.keys()].filter((src) => !manifest.sources[src]).slice(0, limit);
console.log(`${uses.size} image URLs referenced, ${uses.size - todo.length} already in the manifest, downloading ${todo.length}`);

const fetcher = createFetcher({ intervalMs: 600, concurrency: 3 });
const queue = [...todo];
let done = 0;
const failed = [];

async function worker() {
  while (queue.length > 0) {
    const src = queue.shift();
    const res = await fetcher.get(src, { accept: 'image/avif,image/webp,image/*,*/*;q=0.8' });
    if (res.status !== 200 || !/^image\//.test(res.contentType)) {
      failed.push({ src, status: res.status, contentType: res.contentType });
    } else {
      const sha1 = createHash('sha1').update(res.buffer).digest('hex');
      const ext = extname(new URL(src).pathname).toLowerCase() || '.jpg';
      if (!manifest.files[sha1]) {
        writeFileSync(join(imageDir, `${sha1}${ext}`), res.buffer);
        const meta = await sharp(res.buffer).metadata();
        manifest.files[sha1] = { ext, bytes: res.buffer.length, width: meta.width ?? null, height: meta.height ?? null };
      }
      manifest.sources[src] = { sha1 };
    }
    done += 1;
    if (done % 50 === 0 || done === todo.length) {
      console.log(`  ${done}/${todo.length} (failed ${failed.length})`);
    }
  }
}
await Promise.all([worker(), worker(), worker()]);

// Usage information is always rebuilt from the current content.
for (const [src, info] of uses) {
  if (manifest.sources[src]) {
    manifest.sources[src] = { ...manifest.sources[src], alt: info.alt, usedBy: info.usedBy };
  }
}
manifest.generatedAt = new Date().toISOString();
writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 1)}\n`);

const duplicates = Object.keys(manifest.sources).length - Object.keys(manifest.files).length;
console.log(`manifest: ${Object.keys(manifest.sources).length} sources -> ${Object.keys(manifest.files).length} unique files (${duplicates} duplicates collapsed)`);
if (failed.length > 0) {
  console.log('failed downloads (first 10):');
  for (const item of failed.slice(0, 10)) console.log(`  ${item.status} ${item.contentType} ${item.src}`);
}

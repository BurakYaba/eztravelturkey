// Counts unique attribute/datatype combinations in the normalized JSON, the way Sanity's attribute limit counts them
// (docs/project-plan.md P6.15: Free plan limit is 2,000 per dataset). A path counts once however many documents use it;
// array items share one path; an array adds one attribute per distinct item datatype.
// Raw JSON-LD is excluded because it will not be stored in the CMS. Usage: node scripts/scrape/count-attributes.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const base = join(root, 'content', 'scraped', 'en');

const typeOf = (value) => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);

function collect(value, path, set) {
  const type = typeOf(value);
  set.add(`${path}|${type}`);
  if (type === 'array') {
    for (const item of value) {
      const itemType = typeOf(item);
      set.add(`${path}[]|${itemType}`);
      if (itemType === 'object' || itemType === 'array') {
        collect(item, `${path}[]`, set);
      }
    }
  } else if (type === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'jsonLd') continue;
      collect(child, `${path}.${key}`, set);
    }
  }
}

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
    : [];

const groups = { tours: new Set(), pages: new Set() };
let docs = 0;
for (const file of walk(base).filter((f) => f.endsWith('.json'))) {
  const group = file.includes(`${join('en', 'tours')}`) ? 'tours' : 'pages';
  collect(JSON.parse(readFileSync(file, 'utf8')), '', groups[group]);
  docs += 1;
}
const all = new Set([...groups.tours, ...groups.pages]);
console.log(`documents: ${docs}`);
console.log(`unique attributes: tours ${groups.tours.size}, pages ${groups.pages.size}, both combined ${all.size} (shared paths counted once)`);

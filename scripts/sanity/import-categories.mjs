// Creates the length category pages of the countries whose tours sit directly under the country (Egypt, Jordan, Morocco),
// so these country pages look and work like Turkey's and Greece's: a country page of category cards, tours on the
// category pages (docs/project-plan.md D42 and its follow-up, 2026-10-17). The tours keep their own addresses.
//
//   node --env-file-if-exists=.env.local scripts/sanity/import-categories.mjs --dry
//   node --env-file-if-exists=.env.local scripts/sanity/import-categories.mjs
//
// The text is made from the tours themselves (their stops), never invented; it holds no number that would go stale. A
// page that already exists is left alone, so what the client writes in Studio stays. SANITY_DATASET picks the dataset.
import { createClient } from '@sanity/client';

const dry = process.argv.includes('--dry');
const dataset = process.env.SANITY_DATASET ?? 'production';
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

// Which length groups each country gets: every tour is in exactly one, and no page holds fewer than two tours.
const groups = {
  '03-to-05-days-tours': { min: 3, max: 5, label: '3–5 Day', title: (c) => `3–5 Day ${c} Tour Packages` },
  '06-to-09-days-tours': { min: 6, max: 9, label: '6–9 Day', title: (c) => `6–9 Day ${c} Tour Packages` },
  '10-days-and-longer': { min: 10, max: Infinity, label: '10+ Day', title: (c) => `10+ Day ${c} Tours & Itineraries` },
  '06-days-and-longer': { min: 6, max: Infinity, label: '6+ Day', title: (c) => `6+ Day ${c} Tour Packages` },
};
const countries = {
  'egypt-tours': { name: 'Egypt', slugs: ['03-to-05-days-tours', '06-to-09-days-tours', '10-days-and-longer'] },
  'jordan-tours': { name: 'Jordan', slugs: ['03-to-05-days-tours', '06-to-09-days-tours'] },
  'morocco-tours': { name: 'Morocco', slugs: ['03-to-05-days-tours', '06-days-and-longer'] },
};

const tours = await client.fetch(
  '*[_type == "tour" && language == "en" && parent in $parents && !defined(category)]{ parent, days, route }',
  { parents: Object.keys(countries) },
);

const docId = (path) => `destinationpage-en-${path}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '');
const list = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);
const key = (i) => `k${i.toString(36)}`;

const docs = [];
for (const [parent, { name, slugs }] of Object.entries(countries)) {
  const mine = tours.filter((t) => t.parent === parent);
  const covered = new Set();
  for (const slug of slugs) {
    const g = groups[slug];
    const inGroup = mine.filter((t) => t.days >= g.min && t.days <= g.max);
    inGroup.forEach((t) => covered.add(t));
    // the stops of these tours, the most visited first
    const stops = new Map();
    for (const t of inGroup) for (const stop of t.route ?? []) stops.set(stop, (stops.get(stop) ?? 0) + 1);
    const top = [...stops.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s]) => s);
    const title = g.title(name);
    const path = `destinations/${parent}/${slug}`;
    const intro = `Our ${g.label.toLowerCase()} ${name} tour packages visit ${list(top)}. Hotels, guided sightseeing, transfers and transportation vary by tour, so open a tour to see its day-by-day itinerary, what is included and its price.`;
    docs.push({
      _id: docId(path),
      _type: 'destinationPage',
      language: 'en',
      kind: 'category',
      path,
      title,
      metaTitle: `${g.label} ${name} Tours & Packages`,
      metaDescription: `${g.label} ${name} tour packages visiting ${list(top)}. Compare itineraries, inclusions and prices from a licensed local operator.`,
      sections: [
        {
          _key: key(0),
          _type: 'section',
          level: 2,
          heading: `${g.label} ${name} tours`,
          blocks: [{ _key: key(0), _type: 'paragraph', text: intro }],
        },
      ],
      _count: inGroup.length,
    });
  }
  const missed = mine.filter((t) => !covered.has(t));
  if (missed.length > 0) {
    console.error(`${name}: ${missed.length} tour(s) fall in no group`);
    process.exit(1);
  }
}

for (const d of docs) {
  const len = d.metaDescription.length;
  console.log(`${d.path}  (${d._count} tours)  meta ${len} chars${len < 120 || len > 160 ? '  <-- outside 120-160' : ''}`);
}
if (dry) process.exit(0);

for (const { _count, ...doc } of docs) {
  await client.createIfNotExists(doc);
}
console.log(`${docs.length} pages created in ${dataset} (existing ones were left alone).`);

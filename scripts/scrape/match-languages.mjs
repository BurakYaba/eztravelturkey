// Matches the same tour across the three old sites (docs/project-plan.md P5.4, D11).
//
//   node scripts/scrape/match-languages.mjs
//
// A tour is recognised by its length in days and the cities it visits, which are named in all three languages
// (lib/places.mjs). Writes data/mapping/translations.csv (one row per group of tours that are the same product) and
// data/mapping/translations.json (what the Sanity import reads). Only "strong" pairs become a translation group: the
// switcher and hreflang then point at a real counterpart. "possible" pairs are listed for the client to confirm, never used.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { countriesOfPlaces, placesIn } from './lib/places.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const readTours = (lang) =>
  readdirSync(join(root, 'content/scraped', lang, 'tours'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(root, 'content/scraped', lang, 'tours', f), 'utf8')));

const stays = (t) =>
  t.itinerary
    .flatMap((d) => d.text.split('\n'))
    .filter((l) => /^(住宿|宿泊地?)[：:]/.test(l))
    .join(' ');

function features(t) {
  // The title, the route and the places of the "main places" fact say what the tour visits; the stays fill gaps (the
  // Chinese pages have no route line).
  const named = [t.title, t.route.join(' '), Object.values(t.extraFacts).join(' ')].join(' ');
  let cities = placesIn(named);
  if (cities.length < 2) cities = [...new Set([...cities, ...placesIn(stays(t))])];
  return { cities, countries: countriesOfPlaces(cities), days: t.days };
}

const jaccard = (a, b) => {
  const sa = new Set(a);
  const sb = new Set(b);
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : inter / union;
};

function score(a, b) {
  if (a.cities.length === 0 || b.cities.length === 0 || a.days === null || b.days === null) return 0;
  const gap = Math.abs(a.days - b.days);
  if (gap > 1) return 0;
  const sameCountries = jaccard(a.countries, b.countries);
  if (sameCountries < 1) return 0;
  return jaccard(a.cities, b.cities) * (gap === 0 ? 1 : 0.8);
}

const langs = { en: readTours('en'), zh: readTours('zh'), jp: readTours('jp') };
const all = Object.entries(langs).flatMap(([lang, tours]) => tours.map((t) => ({ lang, t, f: features(t), key: `${lang}:${t.path}` })));

const pairs = [];
for (const [la, lb] of [['en', 'zh'], ['en', 'jp'], ['zh', 'jp']]) {
  for (const a of all.filter((x) => x.lang === la)) {
    for (const b of all.filter((x) => x.lang === lb)) {
      const s = score(a.f, b.f);
      if (s >= 0.5) pairs.push({ a, b, s });
    }
  }
}

// A pair is strong when the tours are the same length, each is the other's single best match among that language's tours
// (a tie is not a match) and the score is high.
const best = new Map();
for (const p of pairs) {
  for (const [x, other] of [[p.a, p.b], [p.b, p.a]]) {
    const k = `${x.key}>${other.lang}`;
    const known = best.get(k);
    if (!known || known.s < p.s) best.set(k, { s: p.s, with: other.key, ties: 1 });
    else if (known.s === p.s) known.ties += 1;
  }
}
const strong = pairs.filter((p) => {
  const ab = best.get(`${p.a.key}>${p.b.lang}`);
  const ba = best.get(`${p.b.key}>${p.a.lang}`);
  return p.s >= 0.8 && p.a.f.days === p.b.f.days && ab.with === p.b.key && ba.with === p.a.key && ab.ties === 1 && ba.ties === 1;
});

// Groups: tours connected by strong pairs, at most one tour per language.
const parent = new Map(all.map((x) => [x.key, x.key]));
const find = (k) => (parent.get(k) === k ? k : (parent.set(k, find(parent.get(k))), parent.get(k)));
for (const p of strong) parent.set(find(p.a.key), find(p.b.key));
const groups = new Map();
for (const x of all) groups.set(find(x.key), [...(groups.get(find(x.key)) ?? []), x]);
const rows = [];
let n = 0;
for (const members of groups.values()) {
  const langsIn = members.map((m) => m.lang);
  if (new Set(langsIn).size !== langsIn.length) continue; // two tours of one language in a group: leave all of it to the client
  if (members.length < 2) continue;
  n += 1;
  rows.push({ id: `t${String(n).padStart(3, '0')}`, members });
}

const possible = pairs
  .filter((p) => !strong.includes(p))
  .filter((p) => p.s >= 0.6)
  .sort((x, y) => y.s - x.s);

const outDir = join(root, 'data/mapping');
mkdirSync(outDir, { recursive: true });
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const csv = ['group,confidence,en_path,en_title,zh_path,zh_title,jp_path,jp_title,days,cities'];
for (const g of rows) {
  const m = (lang) => g.members.find((x) => x.lang === lang);
  const f = g.members[0].f;
  csv.push([g.id, 'strong', ...['en', 'zh', 'jp'].flatMap((l) => [q(m(l)?.t.path), q(m(l)?.t.title)]), f.days, q(f.cities.join(' '))].join(','));
}
for (const p of possible) {
  csv.push([`possible`, p.s.toFixed(2), ...['en', 'zh', 'jp'].flatMap((l) => (p.a.lang === l ? [q(p.a.t.path), q(p.a.t.title)] : p.b.lang === l ? [q(p.b.t.path), q(p.b.t.title)] : ['""', '""'])), p.a.f.days, q(p.a.f.cities.join(' '))].join(','));
}
writeFileSync(join(outDir, 'translations.csv'), `﻿${csv.join('\n')}\n`);
writeFileSync(
  join(outDir, 'translations.json'),
  JSON.stringify(Object.fromEntries(rows.flatMap((g) => g.members.map((m) => [`${m.lang}:${m.t.path}`, g.id]))), null, 1),
);

const per = (lang) => all.filter((x) => x.lang === lang).length;
const grouped = (lang) => rows.filter((g) => g.members.some((m) => m.lang === lang)).length;
console.log(`tours: en ${per('en')}, zh ${per('zh')}, jp ${per('jp')}`);
console.log(`groups of the same tour: ${rows.length} (with zh: ${grouped('zh')}, with jp: ${grouped('jp')}, with en: ${grouped('en')}); possible pairs for the client: ${possible.length}`);
console.log(`tours with no cities found: ${all.filter((x) => x.f.cities.length === 0).map((x) => x.key).join(' | ') || 'none'}`);

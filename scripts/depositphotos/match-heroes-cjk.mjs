// Hero pictures for the Chinese and Japanese tours (docs/project-plan.md P5.11, D7).
//
//   node scripts/depositphotos/match-heroes-cjk.mjs
//
// Two kinds of tour:
//   * a tour with the same tour in English (data/mapping/translations.json): it takes the English tour's hero, copied by
//     upload-heroes.mjs (`copyFrom`), so the same trip shows the same picture in every language;
//   * a tour without one: the places it visits (named in Chinese or Japanese, scrape/lib/places.mjs) pick a theme, and the
//     tour takes the first picture of that theme that no tour has taken yet (the English picks in proposal.json count),
//     the same way match-heroes.mjs does it for English.
// Writes data/depositphotos/proposal-zh.json and proposal-jp.json. Israel and close-up pictures are never in the pools.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { countriesNamed, placesIn } from '../scrape/lib/places.mjs';
import { cityTheme, country, pool } from './lib.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const groups = JSON.parse(readFileSync(path.join(root, 'data/mapping/translations.json'), 'utf8'));
const english = JSON.parse(readFileSync(path.join(root, 'data/depositphotos/proposal.json'), 'utf8'));
const byGroup = new Map();
for (const [key, group] of Object.entries(groups)) {
  const [lang, ...rest] = key.split(':');
  byGroup.set(group, { ...byGroup.get(group), [lang]: rest.join(':') });
}

// place ids of scrape/lib/places.mjs that are spelled differently in the themes table
const alias = {
  wadirum: 'wadi rum',
  deadsea: 'dead sea',
  sharm: 'sharm el sheikh',
  didyma: 'didyma',
  sanliurfa: 'turkeyInland',
  hattusha: 'turkeyInland',
  nemrut: 'nemrut',
  madaba: 'madaba',
  erfoud: 'erfoud',
  hurghada: 'hurghada',
  mykonos: 'mykonos',
  olympia: 'olympia',
  troy: 'troy',
  fez: 'fez',
};
const themeOf = (id) => cityTheme.get(alias[id] ?? id) ?? (alias[id] && pool[alias[id]] ? alias[id] : undefined);

const used = new Map();
for (const p of english) if (p.pick) used.set(p.pick.id, (used.get(p.pick.id) ?? 0) + 1);

const gateway = new Set(['istanbul', 'athens', 'amman', 'casablanca', 'giza']);
const rank = (k) => (gateway.has(k) ? 1 : 0);

for (const lang of ['zh', 'jp']) {
  const dir = path.join(root, 'content/scraped', lang, 'tours');
  const tours = readdirSync(dir)
    .map((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')))
    .sort((a, b) => a.path.localeCompare(b.path));
  const out = [];
  for (const t of tours) {
    const group = groups[`${lang}:${t.path}`];
    const twin = group ? byGroup.get(group)?.en : undefined;
    if (twin) {
      out.push({ lang, path: t.path, title: t.title, copyFrom: twin, pick: null });
      continue;
    }
    const named = [t.title, t.route.join(' '), Object.values(t.extraFacts).join(' ')].join(' ');
    const ids = placesIn(named.length > 20 ? named : `${named} ${t.itinerary.map((d) => d.text).join(' ')}`);
    let themes = [...new Set(ids.map(themeOf).filter(Boolean))].sort((x, y) => rank(x) - rank(y));
    // No city named: the countries in the title lead to their best-known place.
    if (themes.length === 0) {
      const leading = { turkey: 'cappadocia', greece: 'santorini', egypt: 'giza', jordan: 'petra', morocco: 'marrakech' };
      themes = countriesNamed(t.title).map((c) => leading[c]);
    }
    // The least used picture among the places the tour visits (a picture no tour has taken first, then the tour's first place first),
    // so tours that visit the same places do not all show the same ruins.
    const candidates = themes.flatMap((k, rankOfTheme) => pool[k].map((p, at) => ({ p, rankOfTheme, at })));
    candidates.sort((x, y) => (used.get(x.p.id) ?? 0) - (used.get(y.p.id) ?? 0) || x.rankOfTheme - y.rankOfTheme || x.at - y.at);
    const best = candidates[0];
    const pick = best?.p ?? null;
    const reuse = Boolean(best && used.has(best.p.id));
    if (pick) used.set(pick.id, (used.get(pick.id) ?? 0) + 1);
    out.push({ lang, path: t.path, title: t.title, route: t.route.join(', '), themes, pick: pick ? { ...pick, score: reuse ? 0 : 1 } : null, reuse, others: [] });
  }
  writeFileSync(path.join(root, `data/depositphotos/proposal-${lang}.json`), JSON.stringify(out, null, 1));
  const missing = out.filter((p) => !p.copyFrom && !p.pick);
  console.log(
    `${lang}: ${out.length} tours, ${out.filter((p) => p.copyFrom).length} copy the English hero, ${out.filter((p) => p.pick).length} get a picture of their own (${out.filter((p) => p.reuse).length} reuse one), ${missing.length} without`,
  );
  for (const p of missing) console.log('  NO PICTURE:', p.title);
}

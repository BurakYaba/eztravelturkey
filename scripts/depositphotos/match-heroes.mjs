// Proposes one purchased Depositphotos picture per tour for its hero (docs/project-plan.md D7, P3.14).
//
//   node scripts/depositphotos/match-heroes.mjs
//
// Reads data/depositphotos/catalog.json (the client's download list, saved by the catalog step) and the tours in
// content/scraped/en/tours. Pictures are sorted into themes by the places their titles name (Cappadocia, Petra,
// Mykonos ...). A tour takes its first stop's theme, then its next stops', and gets the first picture of that theme
// that no other tour has taken, so tours that differ get different heroes. Pictures of Israel, of people close up and
// of things that are not travel (a ski resort, a cat) are never chosen. Writes data/depositphotos/proposal.json.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const catalog = JSON.parse(readFileSync(path.join(root, 'data/depositphotos/catalog.json'), 'utf8'));
const toursDir = path.join(root, 'content/scraped/en/tours');
const tours = readdirSync(toursDir).map((f) => JSON.parse(readFileSync(path.join(toursDir, f), 'utf8')));

import { cityTheme, country, pool, themes } from './lib.mjs';

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Tours that say what the hero must show, whatever their route says.
const forced = [
  [/balloon ride/i, ['cappadocia'], /balloon|ballon/i],
  [/pamukkale balloon/i, ['pamukkale'], /balloon|ballon/i],
  [/paragliding/i, ['fethiye'], /oludeniz|lagoon/i],
  [/bosphorus dinner/i, ['istanbul'], /bosphorus|bosporus|galata|maiden|ortakoy/i],
  [/whirling dervish/i, ['turkeyInland'], /dervish/i],
  [/cape sounion/i, ['athens'], /sounion/i],
  [/one-day saronic/i, ['saronic'], /aegina|hydra|poros|spetses|saronic/i],
  [/argolis|corinth/i, ['olympia', 'athens'], /./],
  [/night entertainment/i, ['athens'], /acropolis|plaka|zeus|parthenon/i],
  [/zagora|sahara/i, ['sahara', 'atlas'], /./],
  [/princes/i, ['istanbul'], /maiden|bosphorus|bosporus|istanbul/i],
];

const themesOf = (t) => {
  const forcedHit = forced.find(([re]) => re.test(t.title));
  if (forcedHit) return forcedHit[1];
  const out = [];
  const stops = t.route.length > 0 ? t.route : [t.title];
  for (const stop of stops) {
    const s = norm(stop);
    const key = cityTheme.get(s) ?? [...cityTheme].find(([c]) => s.includes(c))?.[1];
    if (key && !out.includes(key)) out.push(key);
  }
  for (const w of norm(t.title).match(/[a-z]+/g) ?? []) {
    const key = cityTheme.get(w);
    if (key && !out.includes(key)) out.push(key);
  }
  return out;
};

const countriesOf = (t) => ['turkey', 'greece', 'egypt', 'jordan', 'morocco'].filter((c) => t.parent.includes(c));

const used = new Map(); // picture id -> how many tours
const proposal = [];
for (const t of tours.sort((a, b) => a.path.localeCompare(b.path))) {
  const mine = countriesOf(t);
  // A gateway city (Istanbul, Athens, Cairo, Amman, Casablanca) is where most trips start, not what they are about: a tour that
  // also visits a place people travel for (the islands, Cappadocia, Petra) shows that place first.
  const gateway = new Set(['istanbul', 'athens', 'amman', 'casablanca', 'giza']);
  const minor = new Set(['troy', 'bursa', 'pergamon', 'turkeyInland']);
  const aboutIt = (k) => (k === 'troy' ? /gallipoli|troy/i : k === 'bursa' ? /bursa/i : k === 'pergamon' ? /pergam/i : /./).test(t.title);
  const rank = (k) => (gateway.has(k) ? 2 : minor.has(k) && !aboutIt(k) ? 1 : 0);
  const wanted = themesOf(t)
    .filter((k) => mine.length === 0 || mine.includes(country(k)))
    .sort((x, y) => rank(x) - rank(y));
  let pick = null;
  let reuse = false;
  const need = forced.find(([re]) => re.test(t.title))?.[2] ?? /./;
  for (const k of wanted) {
    pick = pool[k].find((p) => !used.has(p.id) && need.test(p.title));
    if (pick) break;
  }
  if (!pick) {
    // every picture of its themes is taken: take the least used one rather than a picture of another place
    for (const k of wanted) {
      const list = pool[k].slice().sort((a, b) => (used.get(a.id) ?? 0) - (used.get(b.id) ?? 0));
      if (list[0]) {
        pick = list[0];
        reuse = true;
        break;
      }
    }
  }
  if (pick) used.set(pick.id, (used.get(pick.id) ?? 0) + 1);
  proposal.push({
    path: t.path,
    title: t.title,
    route: t.route.join(', '),
    themes: wanted,
    pick: pick ? { ...pick, score: reuse ? 0 : 1 } : null,
    reuse,
    others: [],
  });
}
// Pictures the client's account would not let us download again (the download button does nothing): another picture of
// the same theme takes their place, so no other tour's pick changes.
const blocked = new Set(['12606435']);
for (const p of proposal) {
  if (!p.pick || !blocked.has(p.pick.id)) continue;
  const taken = new Set(proposal.map((q) => q.pick?.id));
  const replacement = p.themes.flatMap((k) => pool[k]).find((c) => !taken.has(c.id) && !blocked.has(c.id));
  if (replacement) p.pick = { ...replacement, score: 1 };
}
writeFileSync(path.join(root, 'data/depositphotos/proposal.json'), JSON.stringify(proposal, null, 1));
const missing = proposal.filter((p) => !p.pick);
console.log(`${proposal.length} tours, ${proposal.length - missing.length} with a picture, ${proposal.filter((p) => p.reuse).length} reuse one, ${missing.length} without`);
for (const k of Object.keys(pool)) console.log(k.padEnd(13), String(pool[k].length).padStart(3), 'pictures,', proposal.filter((p) => p.themes[0] === k).length, 'tours lead with it');
for (const p of missing) console.log('NO PICTURE:', p.title, '|', p.route);

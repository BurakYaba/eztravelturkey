// Proposes a Depositphotos picture for the hero of every destination page (country, combination, length category).
//
//   node scripts/depositphotos/match-destination-heroes.mjs
//
// Same themes and filters as the tour heroes (lib.mjs). A destination page never takes a picture a tour already shows,
// and no two pages share one. Writes data/depositphotos/destination-proposal.json, shaped like proposal.json so the
// contact sheets, the download and the upload scripts take it with --file=destination-proposal.json.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pool } from './lib.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const read = (f) => JSON.parse(readFileSync(path.join(root, 'data/depositphotos', f), 'utf8'));
// 12606435: the client's account would not let us download it again.
const used = new Set([...read('proposal.json').map((p) => p.pick.id), '12606435']);

// path of the page (without the language), its title for the sheets, and the themes that suit it, best first
const pages = [
  ['destinations/turkey-tours', 'Turkey', ['cappadocia', 'pamukkale', 'ephesus']],
  ['destinations/greece-tours', 'Greece', ['santorini', 'mykonos', 'athens']],
  ['destinations/egypt-tours', 'Egypt', ['giza', 'luxor', 'aswan']],
  ['destinations/jordan-tours', 'Jordan', ['petra', 'wadiRum']],
  ['destinations/morocco-tours', 'Morocco', ['marrakech', 'sahara', 'chefchaouen']],

  ['destinations/turkey-greece-tours', 'Turkey and Greece', ['santorini', 'mykonos', 'cappadocia']],
  ['destinations/turkey-and-egypt-tours', 'Turkey and Egypt', ['giza', 'luxor', 'cappadocia']],
  ['destinations/turkey-and-jordan-tours', 'Turkey and Jordan', ['petra', 'cappadocia']],
  ['destinations/greece-and-egypt-tours', 'Greece and Egypt', ['giza', 'santorini']],
  ['destinations/greece-and-jordan-tours', 'Greece and Jordan', ['petra', 'santorini']],
  ['destinations/turkey-greece-and-egypt-tours', 'Turkey, Greece and Egypt', ['giza', 'santorini', 'istanbul']],

  ['destinations/turkey-tours/03-to-05-days-tours', 'Turkey 3-5 days', ['ephesus', 'istanbul', 'pamukkale']],
  ['destinations/turkey-tours/06-to-09-days-tours', 'Turkey 6-9 days', ['cappadocia', 'pamukkale']],
  ['destinations/turkey-tours/10-to-14-days-tours', 'Turkey 10-14 days', ['antalya', 'cappadocia', 'aegeanTr']],
  ['destinations/turkey-tours/15-days-and-longer', 'Turkey 15+ days', ['fethiye', 'antalya', 'aegeanTr']],
  ['destinations/turkey-tours/istanbul-travel-packages', 'Istanbul packages', ['istanbul']],
  ['destinations/turkey-tours/adventure-activities', 'Turkey activities', ['cappadocia', 'fethiye', 'pamukkale']],
  ['destinations/greece-tours/day-tours-in-greece', 'Greece day tours', ['delphi', 'athens', 'meteora']],
  ['destinations/greece-tours/greece-cruise-packages', 'Greece cruises', ['mykonos', 'rhodes', 'santorini']],
  ['destinations/greece-tours/greece-escorted-tours', 'Greece escorted', ['meteora', 'delphi', 'olympia']],
  ['destinations/greece-tours/greece-travel-packages', 'Greece packages', ['santorini', 'crete', 'mykonos']],

  ['destinations/egypt-tours/03-to-05-days-tours', 'Egypt 3-5 days', ['giza', 'alexandria']],
  ['destinations/egypt-tours/06-to-09-days-tours', 'Egypt 6-9 days', ['nile', 'aswan', 'luxor']],
  ['destinations/egypt-tours/10-days-and-longer', 'Egypt 10+ days', ['redSea', 'luxor', 'aswan']],
  ['destinations/jordan-tours/03-to-05-days-tours', 'Jordan 3-5 days', ['amman', 'petra', 'deadSea']],
  ['destinations/jordan-tours/06-to-09-days-tours', 'Jordan 6-9 days', ['wadiRum', 'deadSea', 'aqaba']],
  ['destinations/morocco-tours/03-to-05-days-tours', 'Morocco 3-5 days', ['chefchaouen', 'fes', 'marrakech']],
  ['destinations/morocco-tours/06-days-and-longer', 'Morocco 6+ days', ['sahara', 'atlas', 'essaouira']],
];

const proposal = pages.map(([p, title, themes]) => {
  const pick = themes.flatMap((k) => pool[k]).find((c) => !used.has(c.id));
  if (pick) used.add(pick.id);
  return { path: p, title, route: themes.join(', '), themes, pick: pick ? { ...pick, score: 1 } : null, reuse: false, others: [] };
});
writeFileSync(path.join(root, 'data/depositphotos/destination-proposal.json'), JSON.stringify(proposal, null, 1));
for (const p of proposal) console.log(p.title.padEnd(28), '|', p.pick ? `${p.pick.id} ${p.pick.title.slice(0, 60)}` : 'NO PICTURE');

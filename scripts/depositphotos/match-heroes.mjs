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

const israel =
  /israel|jerusalem|nazareth|tower of david|tel aviv|bethlehem|galilee|masada|jaffa|haifa|acre\b|akko|caesarea|tiberias|capernaum|holy land|judea|golan|eilat|dome of the rock|wailing/i;
// Not a hero: people up close, food, animals, winter sport, or too generic.
const notHero =
  /girl|woman|women|man\b|men\b|couple|people|tourists?\b|traveler|portrait|collage|salad|tea\b|food|cat\b|dog|ski|snow|winter|synagogue|horse|dinner|cake|shop|carpet|market stall|skyline of amman|\bnight club|fireplace|ship on sea water|gods from|medusa|relief|fresco|statues?|bust|carved houses/i;

// Themes: the regular expression says which pictures belong to it, `cities` which route stops lead to it.
const themes = {
  istanbul: { re: /istanbul|bosphorus|bosporus|galata|dolmabahce|topkapi|hagia|blue mosque|maiden|ortakoy|sultanahmet|suleymaniye|grand bazaar|sunset in istanbul/i, cities: ['istanbul'] },
  cappadocia: { re: /cappadocia|goreme|uchisar|balloon|ballon|fairy|pigeon valley|kapadokya|rock formation/i, cities: ['cappadocia', 'goreme', 'urgup', 'uchisar'], not: /pamukkale|travertine/i },
  pamukkale: { re: /pamukkale|hierapolis|travertine/i, cities: ['pamukkale', 'hierapolis'] },
  ephesus: { re: /ephesus|celsus|selcuk|efes|medusa/i, cities: ['ephesus', 'selcuk', 'kusadasi'] },
  aegeanTr: { re: /izmir|alacati|cesme|kusadasi|didyma|priene|miletus|aphrodisias|bodrum|ayvalik|assos|ship in kusadasi|pirate castle/i, cities: ['izmir', 'kusadasi', 'didyma', 'priene', 'miletus', 'aphrodisias', 'bodrum', 'cesme', 'alacati', 'ayvalik', 'assos', 'samos'] },
  antalya: { re: /antalya|kaleici|hidirlik|duden|aspendos|perge|olympos|\bkas\b|\bside\b|mediterranean seacoast|mediterranean coast/i, cities: ['antalya', 'side', 'perge', 'aspendos', 'kas', 'olympos', 'kemer'] },
  fethiye: { re: /fethiye|oludeniz|blue lagoon|paraglid|butterfly|gulet|marmaris/i, cities: ['fethiye', 'oludeniz', 'marmaris', 'gocek'] },
  troy: { re: /troy|trojan|canakkale|gallipoli|anzac|dardanelles|martyrs/i, cities: ['troy', 'gallipoli', 'canakkale', 'eceabat'] },
  pergamon: { re: /pergam|bergama|trajan|asklepion/i, cities: ['pergamon', 'bergama'] },
  bursa: { re: /bursa|iznik|yesil|green mausoleum|green mosque/i, cities: ['bursa', 'yalova', 'iznik'], not: /ski|uludag|winter/i },
  blackSea: { re: /rize|trabzon|ayder|sumela|uzungol|pokut|black sea|camlihemsin/i, cities: ['trabzon', 'rize', 'ayder', 'sumela', 'uzungol'] },
  turkeyInland: { re: /konya|ankara|tuz|nemrut|mardin|safranbolu|ani ruins|kars|salt lake|whirling dervish/i, cities: ['konya', 'ankara', 'mardin', 'nemrut', 'safranbolu'] },

  athens: { re: /athens|acropolis|parthenon|plaka|sounion|erechtheion|caryatid|academy of athens|national library|olympic stadium|zappeion|syntagma/i, cities: ['athens', 'sounion', 'piraeus'] },
  delphi: { re: /delphi|tholos|pronaia|castalia/i, cities: ['delphi', 'arachova'] },
  meteora: { re: /meteora/i, cities: ['meteora', 'kalambaka', 'kalabaka'] },
  olympia: { re: /olympia|philippeion|peloponnes/i, cities: ['olympia', 'peloponnese', 'nafplio', 'corinth', 'epidaurus', 'mycenae', 'argolis'] },
  santorini: { re: /santorini|oia\b|fira\b|thira|caldera/i, cities: ['santorini', 'oia', 'fira'] },
  mykonos: { re: /mykonos|paros|naxos|cyclades|portara|naoussa|milos/i, cities: ['mykonos', 'paros', 'naxos', 'cyclades', 'milos', 'delos'] },
  crete: { re: /crete|chania|knossos|heraklion|agios nikolaos|rethymno/i, cities: ['crete', 'chania', 'heraklion', 'knossos', 'rethymno'] },
  rhodes: { re: /rhodes|lindos|symi|dodecanese|\bkos\b|patmos|marmaris/i, cities: ['rhodes', 'lindos', 'symi', 'kos', 'patmos', 'dodecanese'] },
  ionian: { re: /corfu|zakynthos|kefalonia|navagio|ionian|kassiopi|paleokastritsa|palaiokastritsa|kanoni|lefkada/i, cities: ['corfu', 'zakynthos', 'kefalonia', 'ionian', 'lefkada'] },
  saronic: { re: /aegina|hydra|poros\b|spetses|saronic/i, cities: ['aegina', 'hydra', 'poros', 'spetses', 'saronic'] },

  nile: { re: /nile|felucca|cruise ship|sailing/i, cities: ['nile', 'esna'] },
  luxor: { re: /luxor|karnak|thebes|valley of the kings|hatshepsut/i, cities: ['luxor', 'thebes'] },
  aswan: { re: /aswan|philae|abu simbel|kom ombo|edfu/i, cities: ['aswan', 'abu simbel', 'kom ombo', 'edfu'] },
  redSea: { re: /hurghada|red sea|sharm|dahab|resort|parasols/i, cities: ['hurghada', 'sharm el sheikh', 'sharm', 'red sea', 'dahab', 'el gouna', 'marsa alam'] },
  alexandria: { re: /alexandria|qaitbay|pompey/i, cities: ['alexandria'] },
  giza: { re: /giza|pyramid|sphinx|cairo/i, cities: ['cairo', 'giza', 'memphis', 'saqqara'] },

  petra: { re: /petra|treasury|\bsiq\b|monastery.*(carved|petra)|ad deir|khazneh/i, cities: ['petra', 'wadi musa'] },
  wadiRum: { re: /wadi rum|bedouin camp|rum desert|jordan.*desert/i, cities: ['wadi rum', 'wadi'] },
  deadSea: { re: /dead sea/i, cities: ['dead sea'] },
  amman: { re: /amman|jerash|gerasa|hadrian|citadel|umm qais|madaba|nebo|karak|ajloun|king abdullah|roman theatre|amphitheatre|roman road/i, cities: ['amman', 'jerash', 'madaba', 'mount nebo', 'karak', 'ajloun', "king's highway", 'umm qais'] },
  aqaba: { re: /aqaba/i, cities: ['aqaba'] },

  marrakech: { re: /marrakech|marrakesh|koutoubia|jemaa|majorelle|bahia/i, cities: ['marrakech', 'marrakesh'] },
  fes: { re: /\bfez\b|\bfes\b|medersa|kairouan|kairaouine|bou inania|tanneries|souk of fez|rcif/i, cities: ['fez', 'fes'] },
  chefchaouen: { re: /chefchaouen|blue city|blue medina/i, cities: ['chefchaouen'] },
  casablanca: { re: /casablanca|hassan/i, cities: ['casablanca', 'rabat'] },
  essaouira: { re: /essaouira|atlantic|asilah|tangier|tetouan/i, cities: ['essaouira', 'asilah', 'tangier', 'tetouan'] },
  sahara: { re: /sahara|zagora|merzouga|erg chebbi|dunes|desert/i, cities: ['zagora', 'merzouga', 'erfoud', 'sahara', 'tinghir', 'draa', 'erg chebbi'] },
  atlas: { re: /atlas|kasbah|ait ben haddou|ouarzazate|dades|todra|nkob|tamellalt|thousand kasbahs/i, cities: ['ouarzazate', 'ait ben haddou', 'dades', 'atlas', 'nkob', 'tinghir'] },
  imperialMa: { re: /meknes|volubilis|rabat|moulay|bab mansour|mausoleum of mohammed/i, cities: ['meknes', 'volubilis', 'rabat'] },
};

// Which countries a theme belongs to; a tour never takes a picture from a country it does not visit.
const country = (theme) =>
  ['istanbul', 'cappadocia', 'pamukkale', 'ephesus', 'aegeanTr', 'antalya', 'fethiye', 'troy', 'pergamon', 'bursa', 'blackSea', 'turkeyInland'].includes(theme)
    ? 'turkey'
    : ['athens', 'delphi', 'meteora', 'olympia', 'santorini', 'mykonos', 'crete', 'rhodes', 'ionian', 'saronic'].includes(theme)
      ? 'greece'
      : ['giza', 'nile', 'luxor', 'aswan', 'redSea', 'alexandria'].includes(theme)
        ? 'egypt'
        : ['petra', 'wadiRum', 'deadSea', 'amman', 'aqaba'].includes(theme)
          ? 'jordan'
          : 'morocco';

const pictures = catalog
  .filter((p) => !['video', 'icon-size-vector', 'icon-size-s'].includes(p.kind) && !israel.test(p.title) && !notHero.test(p.title))
  .map((p) => ({ id: p.id, title: p.title, size: p.kind.replace('icon-size-', '') }));

// Each picture belongs to the first theme that claims it (order of the table), best (xl) first inside a theme.
const pool = Object.fromEntries(Object.keys(themes).map((k) => [k, []]));
for (const p of pictures) {
  for (const [key, t] of Object.entries(themes)) {
    if (t.re.test(p.title) && !(t.not && t.not.test(p.title))) {
      pool[key].push(p);
      break;
    }
  }
}
// Inside a theme: the pictures that show the place at its best come first (dunes before bare desert), larger first.
const best = { sahara: /sahara|dune|tent|camel|merzouga/i, wadiRum: /sunset|camp|jeep|canyon|rock/i };
for (const [key, list] of Object.entries(pool)) {
  list.sort(
    (a, b) =>
      Number(!(best[key]?.test(a.title) ?? true)) - Number(!(best[key]?.test(b.title) ?? true)) ||
      (a.size === 'xl' ? 0 : 1) - (b.size === 'xl' ? 0 : 1),
  );
}

const cityTheme = new Map();
for (const [key, t] of Object.entries(themes)) for (const c of t.cities) cityTheme.set(c, key);

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

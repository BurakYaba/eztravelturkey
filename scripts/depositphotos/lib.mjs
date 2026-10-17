// Themes and picture pools shared by the hero scripts: which of the client's Depositphotos pictures show which place.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const catalog = JSON.parse(readFileSync(path.join(root, 'data/depositphotos/catalog.json'), 'utf8'));

export const israel =
  /israel|jerusalem|nazareth|tower of david|tel aviv|bethlehem|galilee|masada|jaffa|haifa|acre\b|akko|caesarea|tiberias|capernaum|holy land|judea|golan|eilat|dome of the rock|wailing/i;
// Not a hero: people up close, food, animals, winter sport, or too generic.
const notHero =
  /girl|woman|women|man\b|men\b|couple|people|tourists?\b|traveler|portrait|collage|salad|tea\b|food|cat\b|dog|ski|snow|winter|synagogue|horse|dinner|cake|shop|carpet|market stall|skyline of amman|\bnight club|fireplace|ship on sea water|gods from|medusa|relief|fresco|statues?|bust|carved houses/i;

// Themes: the regular expression says which pictures belong to it, `cities` which route stops lead to it.
export const themes = {
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
  amman: { re: /amman|jerash|gerasa|arch of hadrian|citadel|umm qais|madaba|nebo|karak|ajloun|king abdullah|roman theatre|amphitheatre|roman road/i, cities: ['amman', 'jerash', 'madaba', 'mount nebo', 'karak', 'ajloun', "king's highway", 'umm qais'] },
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
export const country = (theme) =>
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
export const pool = Object.fromEntries(Object.keys(themes).map((k) => [k, []]));
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

export const cityTheme = new Map();
for (const [key, t] of Object.entries(themes)) for (const c of t.cities) cityTheme.set(c, key);


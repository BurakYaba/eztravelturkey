// Downloads curated Pexels photos into public/images/photos and writes src/data/image-credits.json.
// Usage: npm run images   (reads PEXELS_API_KEY from .env.local). Re-running skips files that already exist
// unless --force is passed. The key is only used here, never shipped to the browser.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'images', 'photos');
const creditsPath = join(root, 'src', 'data', 'image-credits.json');
const force = process.argv.includes('--force');

function loadKey() {
  if (process.env.PEXELS_API_KEY) {
    return process.env.PEXELS_API_KEY;
  }
  const env = readFileSync(join(root, '.env.local'), 'utf8');
  const line = env.split(/\r?\n/).find((l) => l.startsWith('PEXELS_API_KEY='));
  return line
    ? line
        .slice('PEXELS_API_KEY='.length)
        .trim()
        .replace(/^["']|["']$/g, '')
    : '';
}

// id: file name and key in src/data/images.ts. query: Pexels search. must: optional regex the photo alt text must match.
// orientation: landscape (default) or portrait.
const manifest = [
  // Destinations
  { id: 'istanbul-skyline', query: 'istanbul blue mosque skyline sunset', must: /istanbul|mosque|bosphorus/i },
  { id: 'istanbul-bosphorus', query: 'bosphorus istanbul ferry', must: /istanbul|bosphorus/i },
  { id: 'hagia-sophia', query: 'hagia sophia istanbul', must: /hagia|sophia|istanbul/i },
  { id: 'istanbul-bazaar', query: 'grand bazaar istanbul lamps', must: /bazaar|istanbul|lamp|turkish/i },
  { id: 'cappadocia-balloons', query: 'cappadocia hot air balloons sunrise', must: /balloon|cappadocia/i },
  { id: 'cappadocia-valley', query: 'cappadocia fairy chimneys valley', must: /cappadocia|goreme|fairy|valley/i },
  { id: 'pamukkale', query: 'pamukkale travertine terraces', must: /pamukkale|travertine|terrace/i },
  { id: 'ephesus', query: 'ephesus library of celsus', must: /ephesus|celsus|library|ruins/i },
  { id: 'turkish-tea', query: 'turkish breakfast spread tea', must: /breakfast|turkish|tea|spread/i },
  { id: 'santorini-domes', query: 'santorini blue domes oia', must: /santorini|oia|dome/i },
  { id: 'santorini-sunset', query: 'santorini caldera sunset', must: /santorini|caldera|sunset|oia/i },
  { id: 'mykonos', query: 'mykonos windmills little venice', must: /mykonos|windmill|venice|greece/i },
  { id: 'athens-acropolis', query: 'acropolis athens parthenon', must: /acropolis|parthenon|athens/i },
  { id: 'greek-island-boat', query: 'aegean sea sailboat greek island', must: /sea|boat|island|greece|aegean/i },
  { id: 'naxos', query: 'naxos greece portara beach', must: /naxos|greece|greek|beach|portara/i },
  { id: 'greek-food', query: 'greek meze table taverna', must: /greek|taverna|meze|salad|food/i },
  { id: 'giza-pyramids', query: 'giza pyramids camel', must: /pyramid|giza|egypt|camel/i },
  { id: 'sphinx', query: 'great sphinx giza', must: /sphinx|pyramid|giza|egypt/i },
  { id: 'nile-cruise', query: 'nile river cruise ship felucca', must: /nile|felucca|cruise|egypt|aswan|luxor/i },
  { id: 'karnak', query: 'karnak temple luxor columns', must: /karnak|luxor|temple|egypt|column/i },
  { id: 'abu-simbel', query: 'abu simbel temple', must: /abu simbel|ramses|temple|egypt/i },
  { id: 'petra-treasury', query: 'petra treasury jordan', must: /petra|treasury|jordan|khazneh/i },
  { id: 'petra-siq', query: 'petra siq canyon jordan', must: /petra|siq|jordan|canyon/i },
  { id: 'wadi-rum', query: 'wadi rum desert jordan', must: /wadi rum|jordan|desert/i },
  { id: 'dead-sea', query: 'dead sea jordan floating', must: /dead sea|jordan|salt|sea/i },
  { id: 'jerash', query: 'jerash roman ruins jordan', must: /jerash|roman|jordan|ruins/i },
  { id: 'marrakech-souk', query: 'morocco colorful lanterns market', must: /color|lantern|morocc|market/i },
  { id: 'marrakech-koutoubia', query: 'marrakech koutoubia mosque', must: /marrakech|koutoubia|morocc|mosque/i },
  { id: 'chefchaouen', query: 'chefchaouen blue city morocco', must: /chefchaouen|morocc|blue/i },
  { id: 'sahara-camels', query: 'sahara camels merzouga dunes', must: /sahara|camel|dune|morocc|desert/i },
  // Lifestyle
  {
    id: 'travelers-couple',
    query: 'couple traveling ancient ruins hat',
    must: /couple|travel|tourist|ruins|man|woman/i,
  },
  { id: 'small-group-tour', query: 'tour group guide ancient site', must: /group|guide|tour|people|tourist/i },
  { id: 'travel-planning', query: 'planning trip map passport desk', must: /map|passport|travel|plan|trip/i },
  {
    id: 'greek-ruins-columns',
    query: 'ancient greek temple columns sunset',
    must: /temple|column|greek|greece|ruins|ancient/i,
  },
];

const key = loadKey();
if (!key) {
  console.error('PEXELS_API_KEY not found in environment or .env.local');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
mkdirSync(dirname(creditsPath), { recursive: true });

const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, 'utf8')) : {};
const missing = [];

async function search(query, orientation) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=30&orientation=${orientation}&size=large`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) {
    throw new Error(`Pexels ${res.status} for "${query}"`);
  }
  return (await res.json()).photos ?? [];
}

for (const item of manifest) {
  const file = join(outDir, `${item.id}.jpg`);
  if (!force && existsSync(file) && credits[item.id]) {
    console.log(`skip   ${item.id}`);
    continue;
  }
  const orientation = item.orientation ?? 'landscape';
  try {
    const photos = await search(item.query, orientation);
    const usable = photos.filter((p) => p.width >= 2400 && p.width / p.height >= 1.3);
    const pool = usable.length ? usable : photos;
    const match = item.must ? pool.find((p) => item.must.test(p.alt ?? '')) : pool[0];
    if (!match) {
      missing.push(item.id);
      console.warn(`MISSING ${item.id} (no result matched, ${photos.length} candidates)`);
      continue;
    }
    const img = await fetch(match.src.large2x ?? match.src.large);
    if (!img.ok) {
      throw new Error(`download ${img.status}`);
    }
    writeFileSync(file, Buffer.from(await img.arrayBuffer()));
    credits[item.id] = {
      alt: (match.alt || item.query).trim(),
      photographer: match.photographer,
      photographerUrl: match.photographer_url,
      pexelsUrl: match.url,
      width: match.width,
      height: match.height,
      avgColor: match.avg_color,
    };
    console.log(`saved  ${item.id}  <- "${match.alt}" by ${match.photographer}`);
  } catch (err) {
    missing.push(item.id);
    console.warn(`FAILED ${item.id}: ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 250));
}

writeFileSync(creditsPath, JSON.stringify(credits, null, 2) + '\n');
console.log(
  `\nDone. ${Object.keys(credits).length} credited, ${missing.length} missing${missing.length ? ': ' + missing.join(', ') : ''}`,
);

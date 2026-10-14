// Compares the tour catalogs of the three old sites: are they the same products or different ones?
// Tours are matched on duration (days) and the set of cities they visit, because names and codes differ per site.
// Usage: node scripts/scrape/compare-sites.mjs        Needs the EN parse (content/scraped/en/tours) and the zh/jp archives.
// The result is approximate (city names are matched against a fixed dictionary) and meant to guide P5.4, not replace it.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// canonical id: [variants in English, Traditional Chinese, Japanese]
const PLACES = {
  istanbul: ['istanbul', '伊斯坦堡', '伊斯坦布爾', 'イスタンブール'],
  cappadocia: ['cappadocia', '卡帕多奇亞', '卡帕多西亞', 'カッパドキア'],
  pamukkale: ['pamukkale', '棉堡', '帕穆卡萊', 'パムッカレ'],
  ephesus: ['ephesus', '以弗所', '艾菲索斯', '艾菲斯', 'エフェソス'],
  antalya: ['antalya', '安塔利亞', 'アンタルヤ'],
  izmir: ['izmir', '伊茲密爾', 'イズミル'],
  troy: ['troy', '特洛伊', 'トロイ'],
  pergamon: ['pergamon', 'pergamum', '帕加馬', '貝加蒙', 'ペルガモン'],
  canakkale: ['canakkale', 'çanakkale', '恰納卡萊', '洽納卡萊', 'チャナッカレ'],
  gallipoli: ['gallipoli', '加里波利', '加利波利', 'ガリポリ'],
  bursa: ['bursa', '布爾薩', 'ブルサ'],
  ankara: ['ankara', '安卡拉', 'アンカラ'],
  konya: ['konya', '孔亞', '科尼亞', 'コンヤ'],
  safranbolu: ['safranbolu', '番紅花城', 'サフランボル'],
  trabzon: ['trabzon', '特拉布宗', 'トラブゾン'],
  kusadasi: ['kusadasi', '庫薩達斯', '庫沙達西', 'クシャダス'],
  athens: ['athens', '雅典', 'アテネ'],
  santorini: ['santorini', '聖托里尼', 'サントリーニ'],
  mykonos: ['mykonos', '米克諾斯', 'ミコノス'],
  delphi: ['delphi', '德爾菲', '德爾斐', 'デルフィ'],
  meteora: ['meteora', '邁泰奧拉', '梅特歐拉', '流星', 'メテオラ'],
  olympia: ['olympia', '奧林匹亞', 'オリンピア'],
  corinth: ['corinth', '科林斯', 'コリントス'],
  nafplio: ['nafplio', '納夫普利翁', 'ナフプリオ'],
  crete: ['crete', '克里特', 'クレタ'],
  rhodes: ['rhodes', '羅德島', 'ロードス'],
  naxos: ['naxos', '納克索斯', 'ナクソス'],
  paros: ['paros', '帕羅斯', 'パロス'],
  cairo: ['cairo', '開羅', 'カイロ'],
  luxor: ['luxor', '路克索', '盧克索', 'ルクソール'],
  aswan: ['aswan', '亞斯文', 'アスワン'],
  abusimbel: ['abu simbel', '阿布辛貝', 'アブシンベル'],
  alexandria: ['alexandria', '亞歷山卓', 'アレクサンドリア'],
  hurghada: ['hurghada', '赫加達', '洪加達', 'ハルガダ'],
  sharm: ['sharm', '沙姆', 'シャルム'],
  amman: ['amman', '安曼', 'アンマン'],
  petra: ['petra', '佩特拉', '培特拉', 'ペトラ'],
  wadirum: ['wadi rum', '瓦地倫', '瓦迪倫', 'ワディラム', 'ワディ・ラム'],
  deadsea: ['dead sea', '死海'],
  jerash: ['jerash', '傑拉什', '傑拉許', 'ジェラシュ'],
  aqaba: ['aqaba', '亞喀巴', 'アカバ'],
  marrakech: ['marrakech', 'marrakesh', '馬拉喀什', 'マラケシュ'],
  casablanca: ['casablanca', '卡薩布蘭卡', 'カサブランカ'],
  fez: ['fez', '非斯', '菲斯', 'フェズ'],
  rabat: ['rabat', '拉巴特', 'ラバト'],
  chefchaouen: ['chefchaouen', '舍夫沙萬', 'シェフシャウエン'],
  sahara: ['sahara', 'merzouga', '撒哈拉', '梅爾祖卡', 'サハラ'],
};
const COUNTRIES = {
  turkey: ['turkey', '土耳其', 'トルコ'],
  greece: ['greece', '希臘', 'ギリシャ'],
  egypt: ['egypt', '埃及', 'エジプト'],
  jordan: ['jordan', '約旦', 'ヨルダン'],
  morocco: ['morocco', '摩洛哥', 'モロッコ'],
};
const PLACE_COUNTRY = {
  turkey: ['istanbul', 'cappadocia', 'pamukkale', 'ephesus', 'antalya', 'izmir', 'troy', 'pergamon', 'canakkale', 'gallipoli', 'bursa', 'ankara', 'konya', 'safranbolu', 'trabzon', 'kusadasi'],
  greece: ['athens', 'santorini', 'mykonos', 'delphi', 'meteora', 'olympia', 'corinth', 'nafplio', 'crete', 'rhodes', 'naxos', 'paros'],
  egypt: ['cairo', 'luxor', 'aswan', 'abusimbel', 'alexandria', 'hurghada', 'sharm'],
  jordan: ['amman', 'petra', 'wadirum', 'deadsea', 'jerash', 'aqaba'],
  morocco: ['marrakech', 'casablanca', 'fez', 'rabat', 'chefchaouen', 'sahara'],
};

const norm = (text) => text.normalize('NFKC').toLowerCase();
const detect = (table, text) => {
  const haystack = norm(text);
  return Object.entries(table)
    .filter(([, variants]) => variants.some((variant) => haystack.includes(variant.toLowerCase())))
    .map(([id]) => id);
};

// ---- English tours
const enDir = join(root, 'content', 'scraped', 'en', 'tours');
const en = readdirSync(enDir)
  .filter((f) => f.endsWith('.json'))
  .map((file) => {
    const tour = JSON.parse(readFileSync(join(enDir, file), 'utf8'));
    const text = [tour.title, tour.route.join(' ')].join(' ');
    const places = detect(PLACES, text);
    const slug = tour.parent;
    const country = /^(turkey|greece|egypt|jordan|morocco)-tours$/.test(slug) ? slug.split('-')[0] : 'combo';
    return { site: 'en', id: tour.path, title: tour.title, days: tour.days, nights: tour.nights, places, country };
  });

// ---- zh and jp tours (from the archived main pages)
function countryFromUrl(site, url) {
  const parts = url.split('/').map(decodeURIComponent);
  if (site === 'zh') {
    const slug = parts[parts.indexOf('destinations') + 1] ?? '';
    return /^(turkey|greece|egypt|jordan|morocco)-tours$/.test(slug) ? slug.split('-')[0] : 'combo';
  }
  const folder = parts[parts.indexOf('目的地') + 1] ?? '';
  const map = { トルコ: 'turkey', ギリシャ: 'greece', エジプト: 'egypt', モロッコ: 'morocco', ヨルダン: 'jordan', コンビネーション: 'combo' };
  return Object.entries(map).find(([key]) => folder.startsWith(key))?.[1] ?? 'other';
}
function loadArchive(site, keep) {
  const dir = join(root, 'data', 'archive', site);
  const out = [];
  for (const line of readFileSync(join(dir, 'manifest.jsonl'), 'utf8').split('\n').filter(Boolean)) {
    const entry = JSON.parse(line);
    if (entry.status !== 200 || !keep(entry.url)) continue;
    const html = new TextDecoder(entry.charset || 'utf-8').decode(readFileSync(join(dir, `${entry.id}.html`)));
    const $ = cheerio.load(html);
    const quoteForm = $('h3,h4').filter((_, h) => /詢價|見積/.test($(h).text())).length > 0;
    if (!quoteForm) continue; // category and information pages have no quote form
    $('header, footer, nav, .modal, script, style, noscript').remove();
    const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
    const title = $('title').first().text().replace(/\s+/g, ' ').trim();
    const body = $('body').text().replace(/\s+/g, ' ');
    const afterH1 = body.slice(Math.max(0, body.indexOf(h1)), Math.max(0, body.indexOf(h1)) + 2500);
    const code = /(?:ツアーコード|Tour Code)\s*([A-Z]{1,3}-?\d+)/i.exec(body)?.[1] ?? '';
    const head = norm(`${h1} ${title}`);
    let days = null;
    let nights = null;
    let m = /(\d+)\s*天\s*(\d+)\s*夜/.exec(head) ?? /(\d+)\s*泊\s*(\d+)\s*日/.exec(head);
    if (m) {
      [nights, days] = /天/.test(m[0]) ? [Number(m[2]), Number(m[1])] : [Number(m[1]), Number(m[2])];
    } else if ((m = /(\d+)\s*(?:日遊|日行|日間|天遊|天行程|日)/.exec(head) ?? /(\d+)\s*days?/.exec(head))) {
      days = Number(m[1]);
    }
    if (days === null && /(?:^|[^\d])(?:一日|1日|半日|一天)/.test(head)) days = 1;
    const headPlaces = detect(PLACES, `${h1} ${title}`);
    const places = headPlaces.length >= 2 ? headPlaces : detect(PLACES, `${h1} ${title} ${afterH1}`);
    out.push({ site, id: decodeURIComponent(entry.url), title: h1, code, days, nights, places, country: countryFromUrl(site, entry.url) });
  }
  return out;
}
const zh = loadArchive('zh', (url) => url.includes('/zh/destinations/'));
const jp = loadArchive('jp', (url) => url.includes('/jp/'));

// ---- statistics and matching
const byCountry = (list) => {
  const counts = {};
  for (const tour of list) counts[tour.country] = (counts[tour.country] ?? 0) + 1;
  return counts;
};
const jaccard = (a, b) => {
  const setB = new Set(b);
  const shared = a.filter((x) => setB.has(x)).length;
  return a.length + b.length - shared === 0 ? 0 : shared / (a.length + b.length - shared);
};
function match(tour, pool) {
  let best = null;
  for (const other of pool) {
    if (tour.days === null || other.days === null) continue;
    const score = jaccard(tour.places, other.places);
    const dayGap = Math.abs(tour.days - other.days);
    if (tour.places.length < 1 || other.places.length < 1) continue;
    if (tour.country !== other.country && tour.country !== 'combo' && other.country !== 'combo') continue;
    const strength = dayGap === 0 && score >= 0.75 ? 'strong' : dayGap <= 1 && score >= 0.5 ? 'partial' : null;
    if (strength && (!best || score > best.score || (strength === 'strong' && best.strength !== 'strong'))) {
      best = { other, score, strength };
    }
  }
  return best;
}
const summarize = (name, list, pool, poolName) => {
  const results = list.map((tour) => ({ tour, found: match(tour, pool) }));
  const strong = results.filter((r) => r.found?.strength === 'strong').length;
  const partial = results.filter((r) => r.found?.strength === 'partial').length;
  console.log(`${name} (${list.length} tours) vs ${poolName}: strong ${strong}, partial ${partial}, no match ${list.length - strong - partial}`);
  return results;
};

console.log('tours per site:', JSON.stringify({ en: en.length, zh: zh.length, jp: jp.length }));
console.log('by country  en:', JSON.stringify(byCountry(en)));
console.log('by country  zh:', JSON.stringify(byCountry(zh)));
console.log('by country  jp:', JSON.stringify(byCountry(jp)));
console.log('duration known: en', en.filter((t) => t.days).length, '| zh', zh.filter((t) => t.days).length, '| jp', jp.filter((t) => t.days).length);
console.log('tours with at least one recognised city: zh', zh.filter((t) => t.places.length).length, '| jp', jp.filter((t) => t.places.length).length);
const zhVsEn = summarize('zh', zh, en, 'en');
const jpVsEn = summarize('jp', jp, en, 'en');
const zhVsJp = summarize('zh', zh, jp, 'jp');
const enHit = new Set([...zhVsEn, ...jpVsEn].filter((r) => r.found).map((r) => r.found.other.id));
console.log(`EN tours that match at least one zh or jp tour: ${enHit.size} of ${en.length}`);

const examples = (results, label) => {
  console.log(`\n${label} examples (strong matches):`);
  for (const r of results.filter((x) => x.found?.strength === 'strong').slice(0, 6)) {
    console.log(`  ${r.tour.title.slice(0, 40)} [${r.tour.days}d ${r.tour.places.join('/')}]  <=>  ${r.found.other.title.slice(0, 45)} [${r.found.other.days}d]`);
  }
  console.log(`${label} examples (no match):`);
  for (const r of results.filter((x) => !x.found).slice(0, 6)) {
    console.log(`  ${r.tour.title.slice(0, 50)} [${r.tour.days ?? '?'}d ${r.tour.places.join('/') || 'no city'}]`);
  }
};
examples(zhVsEn, 'zh vs en');
examples(jpVsEn, 'jp vs en');

writeFileSync(
  join(root, 'data', 'inventory', 'tour-overlap.json'),
  JSON.stringify({ en, zh, jp, zhVsEn: zhVsEn.map((r) => ({ id: r.tour.id, match: r.found && { id: r.found.other.id, strength: r.found.strength, score: r.found.score } })), jpVsEn: jpVsEn.map((r) => ({ id: r.tour.id, match: r.found && { id: r.found.other.id, strength: r.found.strength, score: r.found.score } })) }, null, 1),
);

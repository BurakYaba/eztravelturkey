// Parses the archived Chinese and Japanese pages into content/scraped/<zh|jp>/{tours,pages}/*.json (docs/project-plan.md P5.2).
//
//   node scripts/scrape/parse-cjk.mjs --site zh|jp [--only substring]
//
// Reads data/archive/<site>/manifest.jsonl (run archive.mjs first). The text stays as the old site wrote it; Israel is left
// out; the tab URLs under every tour (/inclusion-rate/, /review/, /itinerary/ ...) are empty pages and are not parsed (the
// tour page itself already holds every tab), they only matter for the redirect map. /cn/ is not parsed (D10).
// Writes data/inventory/parse-<site>-report.json with what could not be read.
import { load } from 'cheerio';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapedPage } from '../../src/lib/schema/page.ts';
import { scrapedTour } from '../../src/lib/schema/tour.ts';
import { blocksOf, flat, lineOf, mentionsIsrael, sectionsOf, squash, textOf } from './lib/cjk.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const site = option('--site');
const only = option('--only');
if (!['zh', 'jp'].includes(site)) throw new Error('Usage: node scripts/scrape/parse-cjk.mjs --site zh|jp');

const origin = site === 'zh' ? 'https://www.eztravelturkey.com' : 'https://www.torukoryoko.com';
const hubSegment = site === 'zh' ? 'destinations' : '目的地';
const archiveDir = join(root, 'data', 'archive', site);
const latest = new Map();
for (const line of readFileSync(join(archiveDir, 'manifest.jsonl'), 'utf8').split('\n').filter(Boolean)) {
  const entry = JSON.parse(line);
  latest.set(entry.url, entry);
}

const SUBPAGES = new Set(['tour-itinerary', 'inclusion-rate', 'incllusion-rate', 'review', 'reviews', 'itinerary']);

/** Path after the language prefix, every segment decoded and trimmed (the old Japanese hub has a slug with a trailing blank). */
function pathOf(url) {
  const segs = new URL(url).pathname.split('/').filter(Boolean).map((s) => decodeURIComponent(s).trim());
  return segs.slice(1).join('/');
}
const isSubpage = (url) => SUBPAGES.has((pathOf(url).split('/').pop() ?? '').toLowerCase());

/** Internal addresses are written as `/zh/destinations/x/` (relative or absolute, with or without the trailing slash). */
function hrefOf(href, base) {
  try {
    const u = new URL(href, base);
    if (u.host !== new URL(origin).host && u.host !== new URL(origin).host.replace(/^www\./, '')) return href;
    const segs = u.pathname.split('/').filter(Boolean).map((s) => decodeURIComponent(s).trim());
    return `/${segs.join('/')}${segs.length ? '/' : ''}`;
  } catch {
    return href;
  }
}

// ---- tours

const dayMarker = site === 'zh' ? /第\s*(\d+)(?:\s*[-~～–、]\s*(\d+))?\s*天/ : /DAY\s*0*(\d+)(?:\s*[-~～–]\s*0*(\d+))?(?=\s*[:：]|\s)|(\d+)(?:\s*[-~～–]\s*(\d+))?\s*日目/i;

function cityList(text) {
  return text
    .split(/[-－–·・･、,，→>＞]/)
    .map((s) => squash(s))
    .filter((s) => s && s.length <= 30);
}

/** Days from a text marker such as "第3天" or "3日目"; the old pages write them as text, often glued to the previous line. */
function daysFromText(text) {
  const marker = new RegExp(dayMarker.source, 'gi');
  const found = [...text.matchAll(marker)];
  if (found.length === 0) return { days: [], preamble: '' };
  const preamble = squash(text.slice(0, found[0].index));
  // A line of meal marks such as "早餐◎ 午餐◎ 晚餐X" (the marks tell it from a sentence that starts with "早餐後").
  const mealLine = /(早餐|朝食)\s*[:：；;]?\s*[◎○◯△×✕✓]|(早餐|朝食)\s*[Xx]\b/;
  const stayLine = /^[>＞]?\s*(住宿|宿泊)\s*[：:]/;
  const days = [];
  found.forEach((m, i) => {
    const end = i + 1 < found.length ? found[i + 1].index : text.length;
    const after = text.slice(m.index + m[0].length, end).replace(/^[\s:：、.．\-－]+/, '');
    const lines = after.split('\n').map(squash).filter(Boolean);
    let title = lines.shift() ?? '';
    let meals = '';
    const inTitle = /\s*[（(]\s*((?:食事なし|食事無し|朝|昼|夜)[^)）]*)[)）]\s*$/.exec(title);
    if (inTitle) {
      meals = squash(inTitle[1]);
      title = squash(title.slice(0, inTitle.index));
    }
    const body = [];
    const stays = [];
    for (const line of lines) {
      if (stayLine.test(line)) stays.push(line.replace(/^[>＞]\s*/, ''));
      else if (!meals && line.length < 70 && mealLine.test(line)) {
        const stay = /[>＞]?\s*(住宿|宿泊)\s*[：:].*/.exec(line);
        meals = squash(line.replace(stay?.[0] ?? '', '').replace(/[>＞]/g, ' '));
        if (stay) stays.push(squash(stay[0].replace(/^[>＞]\s*/, '')));
      } else body.push(line);
    }
    days.push({ dayLabel: squash(m[0]), title, text: [...body, ...stays].join('\n\n'), meals });
  });
  return { days, preamble };
}

/** The Japanese pages write the schedule as a table: one row per day, with columns for day, schedule, meals and stay. */
function daysFromTable($, pane) {
  const table = $(pane).find('table').first();
  if (table.length === 0) return [];
  const rows = table.find('tr').toArray();
  const head = $(rows[0])
    .children('td,th')
    .map((_, c) => lineOf($, c).replace(/\s+/g, ''))
    .get();
  const col = (re) => head.findIndex((h) => re.test(h));
  const iDay = Math.max(0, col(/日次|日程|日/));
  const iPlan = col(/スケジュール|行程|内容/);
  const iMeal = col(/食事/);
  const iStay = col(/宿泊/);
  if (iPlan < 0) return [];
  const days = [];
  for (const tr of rows.slice(1)) {
    const cells = $(tr).children('td,th').toArray();
    if (cells.length < 2) continue;
    const dayText = lineOf($, cells[iDay]);
    const plan = textOf($, cells[iPlan]);
    if (!dayText && !plan) continue;
    const stay = iStay >= 0 && cells[iStay] ? lineOf($, cells[iStay]) : '';
    const lines = plan.split('\n').map(squash).filter(Boolean);
    days.push({
      dayLabel: squash(dayText.replace(/\s+/g, '')),
      title: '',
      text: [lines.join('\n\n'), stay ? `${head[iStay]}: ${stay}` : ''].filter(Boolean).join('\n\n'),
      meals: iMeal >= 0 && cells[iMeal] ? lineOf($, cells[iMeal]) : '',
    });
  }
  return days;
}

const includeRe = /含まれる|含む|包含|包括|費用包|included|inclusion/i;
const excludeRe = /含まれない|不包含|不包括|不含|除外|excluded|exclusion/i;
const cancelRe = /キャンセル|取消|取消政策|cancel/i;
const noteRe = /重要事項|注意事項|重要|注意|備考|important/i;

function listFrom(section) {
  const items = section.blocks.flatMap((b) => (b.type === 'list' ? b.items : b.type === 'p' ? [b.text] : []));
  return items.map((item) => squash(item.replace(/^[・•●*※\-－\s]+/, ''))).filter((item) => item && !/^[:：]$/.test(item));
}

/** A table with one column is only a way to lay out text: a row that looks like a heading becomes one, the rest become lines. */
function unwrapTables(blocks) {
  return blocks.flatMap((b) => {
    if (b.type !== 'table' || !b.rows.every((row) => row.length === 1)) return [b];
    return b.rows.flatMap(([cell]) => {
      const lines = cell.split('\n').map(squash).filter(Boolean);
      if (lines.length === 1 && lines[0].length <= 45 && (includeRe.test(lines[0]) || excludeRe.test(lines[0]) || cancelRe.test(lines[0]) || noteRe.test(lines[0]))) {
        return [{ type: 'heading', level: 3, text: lines[0].replace(/[:：]\s*$/, '') }];
      }
      return lines.map((text) => ({ type: 'p', text }));
    });
  });
}

function parsePrice(text) {
  const m = /(?:€|EUR|歐元|ユーロ)\s*([\d][\d,\.]*)|([\d][\d,\.]*)\s*(?:€|EUR|歐元|ユーロ)/.exec(text.replace(/ /g, ' '));
  const amount = m ? Number((m[1] ?? m[2]).replace(/,/g, '').replace(/\.-?$/, '')) : null;
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function parseTour(html, url, listing) {
  const $ = load(html);
  const issues = [];
  const path = pathOf(url);
  const segs = path.split('/');
  const h1 = lineOf($, $('.title-single h1').first().length ? $('.title-single h1').first() : $('h1').first());
  const panes = $('.tab-pane').toArray();
  const tabNames = $('.wc-tabs li').map((_, li) => lineOf($, li)).get();

  const gallery = [];
  const seen = new Set();
  $('#slider li').each((_, li) => {
    const img = $(li).find('img').first();
    const src = img.attr('src') ? new URL(img.attr('src'), url).href : '';
    if (!src || seen.has(src)) return;
    seen.add(src);
    gallery.push({ src, width: null, height: null, alt: squash($(li).find('.overlay').text()) || squash(img.attr('alt') ?? '') });
  });
  if (gallery.length === 0) issues.push('no gallery');

  // tab 1: the itinerary
  const itinPane = panes[0];
  let itinerary = itinPane ? daysFromTable($, itinPane) : [];
  let preamble = '';
  if (itinerary.length === 0 && itinPane) {
    const found = daysFromText(textOf($, itinPane));
    itinerary = found.days;
    preamble = found.preamble;
  }
  if (itinerary.length === 0 && itinPane) {
    const text = textOf($, itinPane);
    if (text) itinerary = [{ dayLabel: '', title: '', text: text.split('\n').join('\n\n'), meals: '' }];
    issues.push('itinerary not split into days');
  }
  if (itinerary.length === 0) issues.push('no itinerary');

  // tab 2: what the price includes, price tables, notes
  const included = [];
  const excluded = [];
  const importantNotes = preamble ? [preamble] : [];
  const cancellationPolicy = [];
  const priceSections = [];
  const extraFacts = {};
  const facts = { duration: '', guideLanguages: '', groupType: '', flights: '', startingPrice: '', cancellation: '', difficulty: '', season: '' };
  let priceAmount = null;
  let priceRaw = '';
  const excludedSections = [];
  const pricePane = panes[1];
  if (pricePane) {
    // Short lines such as "料金に含まれるもの" stand in for headings in many tours: turn them into real ones.
    const blocks = unwrapTables(blocksOf($, pricePane, url)).map((b) =>
      b.type === 'p' && b.text.length <= 45 && !/^[・•*※\-－]/.test(b.text) && (includeRe.test(b.text) || excludeRe.test(b.text) || cancelRe.test(b.text) || noteRe.test(b.text))
        ? { type: 'heading', level: 3, text: b.text.replace(/[:：]\s*$/, '') }
        : b,
    );
    // A two-column table headed "項目 / 内容" holds the facts of the tour.
    const sections = sectionsOf(blocks);
    for (const section of sections) {
      const heading = section.heading;
      const rest = [];
      for (const block of section.blocks) {
        if (block.type === 'table' && block.rows[0] && /^(項目|项目|項目名)$/.test(squash(block.rows[0][0] ?? '')) && block.rows[0].length === 2) {
          for (const [label, value] of block.rows.slice(1)) {
            if (!label || !value) continue;
            const lines = listFrom({ blocks: value.split('\n').map((text) => ({ type: 'p', text })) });
            if (excludeRe.test(label)) excluded.push(...lines);
            else if (includeRe.test(label)) included.push(...lines);
            else if (cancelRe.test(label)) cancellationPolicy.push(...lines);
            else if (noteRe.test(label)) importantNotes.push(...lines);
            else if (/所要日数/.test(label)) facts.duration ||= squash(value);
            else if (/催行期間|催行/.test(label)) facts.season ||= squash(value);
            else if (/最低料金|料金|価格/.test(label)) {
              priceAmount ??= parsePrice(value);
              priceRaw ||= `${label}: ${squash(value)}`;
              extraFacts[label] = squash(value);
            } else extraFacts[label] = squash(value.replace(/\n+/g, ' '));
          }
        } else rest.push(block);
      }
      const probe = heading || '';
      if (excludeRe.test(probe)) {
        excludedSections.push(listFrom({ blocks: rest }));
        excluded.push(...excludedSections[excludedSections.length - 1]);
      } else if (includeRe.test(probe)) included.push(...listFrom({ blocks: rest }));
      else if (cancelRe.test(probe)) cancellationPolicy.push(...listFrom({ blocks: rest }));
      else if (noteRe.test(probe) && !rest.some((b) => b.type === 'table')) importantNotes.push(...listFrom({ blocks: rest }));
      else if (rest.length > 0 || heading) {
        // price tables and other text keep their own headings
        priceSections.push({ level: heading ? Math.max(2, section.level) : 0, heading, blocks: rest });
      }
    }
  }

  // The Chinese pages sometimes head both lists "does not include": the first one is then the included list.
  if (included.length === 0 && excludedSections.length >= 2) {
    included.push(...excludedSections[0]);
    excluded.splice(0, excludedSections[0].length);
  }
  // Bullet lines with no heading at all are the included list.
  if (included.length === 0) {
    for (const section of priceSections) {
      const bullets = section.blocks.filter((b) => b.type === 'p' && /^[-・•]\s*/.test(b.text));
      if (bullets.length >= 2) {
        included.push(...bullets.map((b) => squash(b.text.replace(/^[-・•]\s*/, ''))));
        section.blocks = section.blocks.filter((b) => !bullets.includes(b));
      }
    }
  }

  // header facts
  const metaDate = lineOf($, $('.meta_date').first());
  if (metaDate && !facts.duration) facts.duration = metaDate;
  const durationText = [facts.duration, listing?.days ?? '', h1].join(' ');
  const daysM = /(\d+)\s*(?:日間|日|天)/.exec(durationText);
  const nightsM = /(\d+)\s*(?:泊|夜)/.exec(durationText);
  const lastDay = itinerary.map((d) => Number(/(\d+)(?!.*\d)/.exec(d.dayLabel)?.[1] ?? 0)).reduce((a, b) => Math.max(a, b), 0);
  const days = daysM ? Number(daysM[1]) : lastDay || null;
  const nights = nightsM ? Number(nightsM[1]) : days ? days - 1 : null;
  if (!facts.duration && listing?.days) facts.duration = listing.days;
  if (days === null) issues.push('no day count');

  const route = listing?.route?.length
    ? listing.route
    : site === 'jp'
      ? [...new Set(cityList(h1.normalize('NFKC').replace(/^[A-Z]{1,3}-?\d+\s*/, '').replace(/\d+泊\s*\d+日.*$|\d+日間.*$|\d+日.*$|毎日催行/, '')).map((c) => c.replace(/ツアー.*$|周遊.*$|旅行パッケージ.*$/, '').trim()).filter(Boolean))]
      : [];

  const priceTop = lineOf($, $('p.price').first());
  const unit = priceAmount ? (site === 'jp' ? '2名1室利用時の1名料金' : '') : '';
  const title = h1;
  const tour = {
    locale: site,
    sourceUrl: url,
    path,
    slug: segs[segs.length - 1],
    parent: segs[1] ?? '',
    category: segs.length > 3 ? segs[2] : null,
    title,
    metaTitle: squash($('title').first().text()),
    metaDescription: squash($('meta[name="description"]').attr('content') ?? ''),
    canonical: `${origin}/${site}/${path}/`,
    lastUpdated: null,
    breadcrumb: $('.phys-breadcrumb li').map((_, li) => lineOf($, li)).get().filter((t) => t && t !== 'Home'),
    summary: squash($('meta[name="description"]').attr('content') ?? ''),
    facts,
    extraFacts,
    nights,
    days,
    price: { amount: priceAmount, currency: priceAmount ? 'EUR' : '', unit, note: priceTop && !priceAmount ? priceTop : '', raw: priceRaw },
    route,
    routeMap: { image: null, intro: '' },
    highlights: [],
    itinerary,
    included,
    excluded,
    importantNotes,
    cancellationPolicy,
    gallery,
    related: [],
    faqs: [],
    jsonLd: [],
    // Kept for the tour price tab: tables and text next to the lists, as the old tab showed them.
    priceSections,
    tabs: tabNames,
  };
  if (included.length === 0) issues.push('no included list');
  return { tour, issues };
}

// ---- listing, hub and static pages

const homeBase = `${origin}/`;

function cardsOf($, url) {
  const cards = [];
  $('.item-list-tour').each((_, el) => {
    const a = $(el).find('.list-item-title a').first();
    const href = a.attr('href');
    if (!href) return;
    const img = $(el).find('.list-item-image img').first();
    const meta = [];
    const dest = lineOf($, $(el).find('.tour-destinations').first()).replace(/^Destinations:\s*/i, '');
    const days = lineOf($, $(el).find('.tour-days').first()).replace(/^Days:\s*/i, '');
    if (dest) meta.push(dest);
    if (days) meta.push(days);
    cards.push({
      title: lineOf($, a),
      url: hrefOf(href, url),
      image: img.attr('src') ? { src: new URL(img.attr('src'), url).href, width: null, height: null, alt: '' } : null,
      meta,
      price: '',
      text: lineOf($, $(el).find('.description').first()),
    });
  });
  return cards;
}

function homeCards($, url) {
  return $('.item-tour')
    .map((_, el) => {
      const a = $(el).find('h5 a, .post_title a').first();
      const img = $(el).find('img').first();
      return {
        title: lineOf($, a) || squash(img.attr('alt') ?? ''),
        url: hrefOf($(el).find('a').first().attr('href') ?? '', url),
        image: img.attr('src') ? { src: new URL(img.attr('src'), url).href, width: null, height: null, alt: squash(img.attr('alt') ?? '') } : null,
        meta: [],
        price: '',
      };
    })
    .get();
}

/**
 * Questions and answers written as plain paragraphs. zh: "1. Question？" then the answer, which starts with an arrow.
 * jp: "Q1: Question" then "A: answer". The last answer may run over several paragraphs.
 */
function faqsFromParagraphs(paragraphs) {
  const faqs = [];
  const startsQuestion = (text) => /^(?:\d+[.．、]\s*|Q\d*[:：]\s*)(.+)$/s.exec(text) ?? /^【(.+[？?])\s*】$/.exec(text);
  for (const text of paragraphs) {
    const q = startsQuestion(text);
    if (q && (/[？?]\s*$/.test(q[1]) || /^Q\d*[:：]/.test(text))) {
      faqs.push({ q: squash(q[1]), a: '' });
    } else if (faqs.length > 0) {
      const answer = squash(text.replace(/^(?:A[:：]|[→➔>＞]+)\s*/, ''));
      faqs[faqs.length - 1].a += `${faqs[faqs.length - 1].a ? '\n\n' : ''}${answer}`;
    }
  }
  return faqs.filter((f) => f.q && f.a);
}

function parsePage(html, url, kind) {
  const $ = load(html);
  const issues = [];
  const path = kind === 'home' ? '' : pathOf(url);
  const h1 = lineOf($, $('h1.heading_primary').first().length ? $('h1.heading_primary').first() : $('h1').first()) || (kind === 'home' ? lineOf($, $('h2.vc_custom_heading').first()) : '');
  const content = $('section.content-area').first();
  let sections = [];
  let cards = [];
  let faqs = [];
  if (kind === 'home') {
    cards = homeCards($, url);
    const body = $('.home-content').first();
    sections = sectionsOf(blocksOf($, body.find('.wpb_text_column, .widget-icon-box').toArray().length ? body : body, url).filter((b) => b.type !== 'image'));
  } else if (content.length) {
    cards = cardsOf($, url);
    const main = content.find('.site-main, .about-content, .pages_content').first();
    const scope = main.length ? main : content;
    const clone = scope.clone();
    clone.find('.widget-area, .item-list-tour, .wrapper-tours-slider, form, .wpcf7').remove();
    const blocks = blocksOf($, clone, url).filter((b) => !(b.type === 'heading' && b.text === h1 && b.level === 2));
    sections = sectionsOf(blocks);
    if (path === 'faq') {
      // Questions become the FAQ list; the heading line and nothing else is left as text.
      faqs = faqsFromParagraphs(blocks.filter((b) => b.type === 'p').map((b) => b.text));
      if (faqs.length > 0) sections = [];
    }
  } else issues.push('no content area');
  if (!h1) issues.push('no h1');
  const page = {
    locale: site,
    kind,
    sourceUrl: url,
    path,
    metaTitle: squash($('title').first().text()),
    metaDescription: squash($('meta[name="description"]').attr('content') ?? ''),
    canonical: `${origin}/${site}/${path}${path ? '/' : ''}`,
    robots: '',
    h1,
    lastUpdated: null,
    breadcrumb: $('.phys-breadcrumb li').map((_, li) => lineOf($, li)).get().filter((t) => t && t !== 'Home'),
    sections,
    cards,
    faqs,
    jsonLd: [],
  };
  return { page, issues };
}

/** The single-country folders; every other folder directly under the hub is a combination of countries. */
const countryFolders = new Set(
  site === 'zh'
    ? ['turkey-tours', 'greece-tours', 'egypt-tours', 'jordan-tours', 'morocco-tours']
    : ['トルコツアー', 'ギリシャツアー', 'エジプトツアー', 'ヨルダンツアー', 'モロッコツアー'],
);

/** What a page is, from its address and its markup. */
function kindOf(html, url) {
  const path = pathOf(url);
  const segs = path ? path.split('/') : [];
  if (segs.length === 0) return 'home';
  const $ = load(html);
  if ($('.single-woo-tour').length) return 'tour';
  if (segs[0] === hubSegment) {
    if (segs.length === 1) return 'destinations-hub';
    if (segs.length === 2) return countryFolders.has(segs[1]) ? 'country' : 'combo';
    // Under a category: a listing of tours, or an empty page of the old theme (tab addresses such as /inclusions-rate/).
    return $('.item-list-tour').length > 0 ? 'category' : 'ghost';
  }
  if (segs[0] === 'blog') return 'blog-hub';
  return 'static';
}

// ---- run

const outRoot = join(root, 'content', 'scraped', site);
rmSync(outRoot, { recursive: true, force: true });
const outTours = join(outRoot, 'tours');
mkdirSync(outTours, { recursive: true });

// Listing cards first: tours take their route and day counts from the listing that links to them.
const entries = [...latest.values()].filter(
  (e) =>
    e.status === 200 &&
    !/\/cn\//.test(e.url) &&
    e.url !== `${origin}/` + 'cn/' &&
    !isSubpage(e.url) &&
    existsSync(join(archiveDir, `${e.id}.html`)) &&
    (!only || decodeURIComponent(e.url).includes(only)),
);
const listing = new Map();
for (const e of entries) {
  const html = readFileSync(join(archiveDir, `${e.id}.html`), 'utf8');
  const $ = load(html);
  for (const c of cardsOf($, e.url)) {
    const key = c.url.replace(/^\/[a-z]+\//, '').replace(/\/$/, '');
    const dest = c.meta.find((m) => !/[天夜泊日]/.test(m) || m.includes('-')) ?? '';
    listing.set(key, { route: dest && site === 'zh' ? cityList(dest) : [], days: c.meta.find((m) => /[天夜泊日]/.test(m)) ?? '' });
  }
}

const report = { tours: [], pages: [], skipped: [] };
let invalid = 0;
for (const e of entries) {
  const html = readFileSync(join(archiveDir, `${e.id}.html`), 'utf8');
  const kind = kindOf(html, e.url);
  const urlText = decodeURIComponent(e.url);
  if (mentionsIsrael(urlText)) {
    report.skipped.push({ url: e.url, why: 'Israel (address)' });
    continue;
  }
  if (kind === 'ghost') {
    report.skipped.push({ url: e.url, why: 'empty page of the old theme' });
    continue;
  }
  if (kind === 'tour') {
    const path = pathOf(e.url);
    const { tour, issues } = parseTour(html, e.url, listing.get(path));
    const probe = JSON.stringify([tour.title, tour.itinerary, tour.included, tour.metaDescription]);
    if (mentionsIsrael(tour.title)) {
      report.skipped.push({ url: e.url, why: 'Israel (title)' });
      continue;
    }
    const { priceSections, tabs, ...schemaTour } = tour;
    const checked = scrapedTour.safeParse(schemaTour);
    if (!checked.success) {
      invalid += 1;
      issues.push(`schema: ${checked.error.issues.slice(0, 3).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    } else {
      if (mentionsIsrael(probe)) issues.push('mentions Israel (kept out at import)');
      writeFileSync(join(outTours, `${path.replaceAll('/', '__')}.json`), `${JSON.stringify({ ...checked.data, priceSections }, null, 2)}\n`);
    }
    report.tours.push({ url: e.url, issues });
  } else {
    const { page, issues } = parsePage(html, e.url, kind);
    if (mentionsIsrael(page.h1)) {
      report.skipped.push({ url: e.url, why: 'Israel (title)' });
      continue;
    }
    const checked = scrapedPage.safeParse(page);
    if (!checked.success) {
      invalid += 1;
      issues.push(`schema: ${checked.error.issues.slice(0, 3).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    } else {
      const dir = join(outRoot, 'pages', kind);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `${page.path === '' ? 'home' : page.path.replaceAll('/', '__')}.json`), `${JSON.stringify(checked.data, null, 2)}\n`);
    }
    report.pages.push({ url: e.url, kind, issues });
  }
}

const counts = {};
for (const r of [...report.tours, ...report.pages]) for (const i of r.issues) counts[i] = (counts[i] ?? 0) + 1;
console.log(`${site}: ${report.tours.length} tours, ${report.pages.length} pages, ${report.skipped.length} skipped (Israel or empty pages), ${invalid} failed the schema`);
console.log('issues:', JSON.stringify(counts));
writeFileSync(join(root, 'data', 'inventory', `parse-${site}-report.json`), JSON.stringify(report, null, 2));

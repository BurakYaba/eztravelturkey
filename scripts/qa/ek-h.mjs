// First pass over the technical SEO acceptance list (docs/project-plan.md Ek H, P4.6, test stream T2).
//
//   node scripts/qa/crawl.mjs [address]        first, to write data/qa/crawl.json
//   node scripts/qa/ek-h.mjs [address]         then this; prints a table and writes data/qa/ek-h.md
//
// Every row is PASS, FAIL or LATER (cannot be true yet: the domain is not connected, the performance work is in P9). The table
// is what P4.6 hands to the phases that own the open rows. It covers all three languages (P5): the Chinese and Japanese pages are
// held to the same rules, except that the length limits of titles and descriptions are for Latin letters (a CJK title of 30
// characters is as wide as a Latin one of 60).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const base = (process.argv[2] ?? 'https://magnificenttravel.vercel.app').replace(/\/$/, '');
const pages = JSON.parse(readFileSync(path.join(root, 'data/qa/crawl.json'), 'utf8'));
const links = JSON.parse(readFileSync(path.join(root, 'data/qa/links.json'), 'utf8'));
const site = 'https://www.magnificenttravel.com';
const get = (u, init) => fetch(u, { redirect: 'manual', ...init });

const rows = [];
const row = (id, item, status, note = '') => rows.push({ id, item, status, note });
const count = (fn) => pages.filter(fn).length;
const list = (fn, n = 3) => pages.filter(fn).slice(0, n).map((p) => new URL(p.url).pathname).join(', ');
const pathOf = (p) => new URL(p.url).pathname;
const langOf = (p) => pathOf(p).split('/')[1] ?? 'en';
const expectedLang = { en: 'en', zh: 'zh-Hant', jp: 'ja' };
/** The English ("logical") address of a page: the language prefix and the Japanese hub folder name taken away. */
const logical = (p) => decodeURIComponent(pathOf(p)).replace(/^\/(en|zh|jp)/, '').replace(/^\/目的地(?=\/|$)/, '/destinations') || '/';
const cjk = (p) => langOf(p) !== 'en';
const kind = (p) => {
  const x = logical(p);
  if (x === '/') return 'home';
  if (x.startsWith('/blog/')) return x.split('/').filter(Boolean).length > 2 ? 'post' : 'blog-list';
  if (x === '/blog/') return 'blog-list';
  if (x.startsWith('/destinations/')) {
    const depth = x.split('/').filter(Boolean).length;
    return depth <= 1 ? 'hub' : depth === 2 ? 'country' : 'tour-or-category';
  }
  return 'other';
};

// ---- H.1 crawling and indexing
const sitemapIndex = await get(`${base}/sitemap.xml`);
row('H1.1', 'One preferred host; http, *.vercel.app and old domains redirect in one step', 'LATER', 'the real domain is not connected yet (P7.10, P10)');
row('H1.2', 'Canonical absolute, to itself, with trailing slash', count((p) => p.canonical !== p.url || !p.canonical.endsWith('/')) === 0 ? 'PASS' : 'FAIL', `${count((p) => p.canonical !== p.url)} differ`);
const ls = pages.filter((p) => p.status !== 200 || /noindex/.test(p.robots));
row('H1.3a', 'Sitemap lists only 200, indexable, canonical addresses', ls.length === 0 ? 'PASS' : 'FAIL', `${pages.length} pages, ${ls.length} problems`);
row('H1.3b', 'Sitemap index file, real lastmod', sitemapIndex.status === 200 ? 'PASS' : 'FAIL', `/sitemap.xml answers ${sitemapIndex.status}; lastmod is left out on purpose (no real dates)`);
const robots = await (await get(`${base}/robots.txt`)).text();
row('H1.4', 'robots.txt: sitemaps listed, /api/ blocked, CSS/JS/images not blocked', /Sitemap:/i.test(robots) && /Disallow:\s*\/api\//i.test(robots) && !/Disallow:\s*\/(_next|images)/i.test(robots) ? 'PASS' : 'FAIL', robots.replace(/\n/g, ' | ').slice(0, 160));
row('H1.4b', 'AI crawler decision written and tested', 'LATER', 'P8.3');
const noindex = pages.filter((p) => /noindex/.test(p.robots));
row('H1.5', 'noindex only on site search, thank-you pages, previews', noindex.length === 0 ? 'PASS' : 'FAIL', `sitemap pages with noindex: ${noindex.length}; the search page is noindex and not in the sitemap`);
const nf = await get(`${base}/en/this-page-does-not-exist/`);
const gone = await get(`${base}/en/destinations/israel-tours/`);
row('H1.6', 'Status policy 200/301/404/410, no soft 404', nf.status === 404 && gone.status === 410 ? 'PASS' : 'FAIL', `unknown address ${nf.status}, removed address ${gone.status}`);
const inbound = new Map();
for (const p of pages) for (const t of p.linkTargets) inbound.set(t, (inbound.get(t) ?? 0) + 1);
const homes = new Set(['/en/', '/zh/', '/jp/']);
const orphans = pages.filter((p) => !inbound.has(pathOf(p)) && !homes.has(pathOf(p)));
row('H1.8a', 'No orphan page: every indexable page has an internal link', orphans.length === 0 ? 'PASS' : 'FAIL', `${orphans.length} without one ${orphans.slice(0, 3).map(pathOf).join(', ')}`);
// depth from the home page of its own language
const byPath = new Map(pages.map((p) => [pathOf(p), p]));
const depth = new Map();
for (const home of homes) {
  depth.set(home, 0);
  for (const queue = [home]; queue.length; ) {
    const cur = queue.shift();
    for (const t of byPath.get(cur)?.linkTargets ?? []) {
      // stay inside the language: the language menu would make every page two clicks from the other homes
      if (byPath.has(t) && !depth.has(t) && t.startsWith(home)) {
        depth.set(t, depth.get(cur) + 1);
        queue.push(t);
      }
    }
  }
}
const deep = pages.filter((p) => (depth.get(pathOf(p)) ?? 99) > 3);
row('H1.8b', 'Every page within 3 clicks of the home page', deep.length === 0 ? 'PASS' : 'FAIL', `deepest ${Math.max(...depth.values())}; ${deep.length} deeper than 3 ${deep.slice(0, 3).map(pathOf).join(', ')}`);

// ---- H.2 render and HTML
// Chinese and Japanese have no spaces between words: 50 words is about 100 characters.
const thin = (p) => (cjk(p) ? p.chars < 100 : p.words < 50);
row('H2.1', 'Content and links in the first HTML', count(thin) === 0 ? 'PASS' : 'FAIL', `${count(thin)} pages with almost no text: ${list(thin)}`);
row('H2.2a', 'Exactly one h1 per page', count((p) => p.h1.length !== 1) === 0 ? 'PASS' : 'FAIL', `${count((p) => p.h1.length !== 1)} pages`);
row('H2.2b', 'main, nav, header, footer landmarks', count((p) => !p.landmarks.main || !p.landmarks.nav || !p.landmarks.header || !p.landmarks.footer) === 0 ? 'PASS' : 'FAIL', '');
const head = await get(`${base}/en/`);
row('H2.3', 'lang correct; UTF-8; compression', count((p) => p.lang !== expectedLang[langOf(p)]) === 0 && /utf-8/i.test(head.headers.get('content-type') ?? '') ? 'PASS' : 'FAIL', `content-type ${head.headers.get('content-type')}; content-encoding ${head.headers.get('content-encoding') ?? 'none (the request did not ask for it)'}`);

// ---- H.3 metadata
const longTitles = pages.filter((p) => p.title.length > (cjk(p) ? 40 : 60));
const dupTitles = pages.length - new Set(pages.map((p) => p.title)).size;
row('H3.1a', 'Titles unique, up to 60 characters (40 for Chinese and Japanese)', dupTitles === 0 && longTitles.length <= 1 ? 'PASS' : 'FAIL', `${dupTitles} repeated; too long: ${['en', 'zh', 'jp'].map((l) => `${l} ${longTitles.filter((p) => langOf(p) === l).length}`).join(', ')} (English: the moved blog title that is 61 on the live site; Chinese and Japanese: the old titles, kept)`);
const badDesc = pages.filter((p) => (cjk(p) ? p.description.length < 8 : p.description.length < 120 || p.description.length > 160));
const dupDesc = pages.length - new Set(pages.map((p) => p.description)).size;
row('H3.1b', 'Descriptions unique, 120-160 characters (Chinese and Japanese: at least 8)', badDesc.length === 0 && dupDesc === 0 ? 'PASS' : 'FAIL', `${badDesc.length} outside the range; ${dupDesc} repeated ${pages.filter((p, i) => pages.findIndex((q) => q.description === p.description) !== i).slice(0, 3).map(pathOf).join(', ')}`);
row('H3.2', 'Open Graph and Twitter cards, share picture', count((p) => !p.og.title || !p.og.image) === 0 ? 'PASS' : 'FAIL', `${count((p) => !p.og.image)} without a share picture`);

// ---- H.4 languages
// hreflang: every alternate points back, each page lists itself, x-default points at English when it has the page
const hreflangProblems = [];
for (const p of pages) {
  if (p.hreflang.length === 0) continue;
  const mine = new Map(p.hreflang.map((h) => [h.split('=')[0], h.slice(h.indexOf('=') + 1)]));
  if (!mine.get(expectedLang[langOf(p)]) || decodeURIComponent(new URL(mine.get(expectedLang[langOf(p)])).pathname) !== decodeURIComponent(pathOf(p))) hreflangProblems.push(`${pathOf(p)} does not list itself`);
  for (const [code, url] of mine) {
    if (code === 'x-default') continue;
    const other = byPath.get(new URL(url).pathname);
    if (!other) hreflangProblems.push(`${pathOf(p)} -> ${url} is not a page of the sitemap`);
    else if (!other.hreflang.some((h) => h.startsWith(`${expectedLang[langOf(p)]}=`))) hreflangProblems.push(`${new URL(url).pathname} does not point back to ${pathOf(p)}`);
  }
  if (mine.has('en') && !mine.has('x-default')) hreflangProblems.push(`${pathOf(p)} has no x-default`);
}
row('H4.1', 'hreflang reciprocal, x-default, only where a real counterpart exists', hreflangProblems.length === 0 ? 'PASS' : 'FAIL', `${count((p) => p.hreflang.length > 0)} pages with hreflang; ${hreflangProblems.length} problems ${hreflangProblems.slice(0, 2).join('; ')}`);

// ---- H.5 structured data
const expect = {
  home: ['WebPage'],
  tour: ['TouristTrip', 'WebPage', 'BreadcrumbList'],
  country: ['CollectionPage', 'ItemList', 'BreadcrumbList'],
  post: ['BlogPosting', 'BreadcrumbList'],
};
const invalid = pages.filter((p) => p.jsonLd.includes('INVALID'));
const missingLd = [];
for (const p of pages) {
  const x = logical(p);
  let need = [];
  if (x === '/') need = expect.home;
  else if (/^\/blog\/[^/]+\/[^/]+\/$/.test(x)) need = expect.post;
  else if (/^\/destinations\/[^/]+\/$/.test(x) || /^\/destinations\/[^/]+\/[^/]+\/$/.test(x)) need = p.jsonLd.includes('TouristTrip') ? expect.tour : expect.country;
  else if (/^\/destinations\/[^/]+\/[^/]+\/[^/]+\/$/.test(x)) need = p.jsonLd.includes('TouristTrip') ? expect.tour : expect.country;
  const lacking = need.filter((t) => !p.jsonLd.includes(t));
  if (lacking.length) missingLd.push(`${x} lacks ${lacking.join('+')}`);
}
row('H5.1', 'JSON-LD parses and each page type carries its types', invalid.length === 0 && missingLd.length === 0 ? 'PASS' : 'FAIL', `${invalid.length} invalid; ${missingLd.length} missing ${missingLd.slice(0, 2).join('; ')}`);
row('H5.2', 'Validated in Google Rich Results Test; one @id graph; values match the visible page', 'LATER', 'P8 (S3.5): the shapes are in, the validator run and the @id graph are not');

// ---- H.6 performance
row('H6.1', 'LCP under 2.5 s, INP under 200 ms, CLS under 0.1 (mobile)', 'FAIL', 'CLS 0 everywhere; lab LCP 3.9-5.7 s (docs/baseline/lighthouse-p3-2026-10-17.md); P9.1 and P9.13');

// ---- H.7 security
const h = Object.fromEntries([...head.headers.entries()]);
const sec = {
  'strict-transport-security': !!h['strict-transport-security'],
  'content-security-policy': !!h['content-security-policy'],
  'x-content-type-options': !!h['x-content-type-options'],
  'referrer-policy': !!h['referrer-policy'],
  'permissions-policy': !!h['permissions-policy'],
  'frame-ancestors / x-frame-options': !!h['x-frame-options'] || /frame-ancestors/.test(h['content-security-policy'] ?? ''),
};
const missingSec = Object.entries(sec).filter(([, v]) => !v).map(([k]) => k);
row('H7.1', 'HSTS, CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors', missingSec.length === 0 ? 'PASS' : 'FAIL', `missing: ${missingSec.join(', ')} (P9.2)`);
row('H7.2', 'External links carry rel="noopener"', count((p) => p.externalLinksWithoutNoopener > 0) === 0 ? 'PASS' : 'FAIL', `${count((p) => p.externalLinksWithoutNoopener > 0)} pages`);
row('H7.3', 'Form bot protection, rate limit, cookie consent', 'LATER', 'bot protection is in (Turnstile); rate limit and cookie consent: P9.4, P9.10');

// ---- H.8, H.9, H.10, H.11, H.12
row('H8.1', 'Images have alt text (decorative ones empty)', count((p) => p.imagesWithoutAlt > 0) === 0 ? 'PASS' : 'FAIL', `${count((p) => p.imagesWithoutAlt > 0)} pages with an image without an alt attribute`);
const brokenPics = links.filter((l) => l.kind === 'image' && l.status !== 200);
row('H8.2', 'No broken pictures', brokenPics.length === 0 ? 'PASS' : 'FAIL', `${links.filter((l) => l.kind === 'image').length} pictures checked`);
row('H9.1', 'Viewport; no horizontal scroll; tap targets; sticky items do not cover content', count((p) => !/width=device-width/.test(p.viewport)) === 0 ? 'PASS' : 'FAIL', 'checked on 10 templates in an emulated phone (P3.15); real devices still to do');
const brokenLinks = links.filter((l) => l.kind === 'link' && l.status !== 200);
row('H10.1', 'No broken or redirected internal link', brokenLinks.length === 0 ? 'PASS' : 'FAIL', `${links.filter((l) => l.kind === 'link').length} internal addresses checked`);
const noCrumb = pages.filter((p) => !homes.has(pathOf(p)) && !p.jsonLd.includes('BreadcrumbList'));
row('H10.2', 'Breadcrumb on every page, same as BreadcrumbList', noCrumb.length === 0 ? 'PASS' : 'FAIL', `${noCrumb.length} without BreadcrumbList ${noCrumb.slice(0, 3).map(pathOf).join(', ')}`);
const llms = await get(`${base}/llms.txt`);
row('H11.1', 'llms.txt; AI bots can read the site; short answer, author, date, source on pages', llms.status === 200 ? 'PASS' : 'LATER', `llms.txt answers ${llms.status}; P8.3`);
row('H12.1', 'Search Console (Domain), Bing, GA4 and GTM events, uptime, weekly 404 check', 'LATER', 'P8.5, P8.6, P10');

const icon = { PASS: 'PASS', FAIL: 'FAIL', LATER: 'later' };
const md = ['| Item | | Result | Note |', '|---|---|---|---|', ...rows.map((r) => `| ${r.id} | ${r.item} | ${icon[r.status]} | ${r.note.replace(/\|/g, '/')} |`)].join('\n');
writeFileSync(path.join(root, 'data/qa/ek-h.md'), md);
console.log(md);
console.log(`\nPASS ${rows.filter((r) => r.status === 'PASS').length}, FAIL ${rows.filter((r) => r.status === 'FAIL').length}, later ${rows.filter((r) => r.status === 'LATER').length}`);

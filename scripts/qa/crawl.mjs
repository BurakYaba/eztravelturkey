// Crawls every sitemap page of the site and records what search engines and readers see (docs/project-plan.md P4.2, P4.5, P4.6).
//
//   node scripts/qa/crawl.mjs [address]        default https://magnificenttravel.vercel.app
//
// Writes data/qa/crawl.json (one record per page) and data/qa/links.json (every internal link and image with its status).
// A link counts as broken when it does not answer 200 directly: a redirect is reported too, because internal links must
// point at the final address (Ek H.10). Needs no login; it only reads.
import { load } from 'cheerio';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const base = (process.argv[2] ?? 'https://magnificenttravel.vercel.app').replace(/\/$/, '');
const siteHost = 'www.magnificenttravel.com';
const out = path.join(root, 'data/qa');
mkdirSync(out, { recursive: true });

const get = async (url, init) => fetch(url, { redirect: 'manual', headers: { 'user-agent': 'magnificent-qa-crawl' }, ...init });
const text = async (url) => (await get(url)).text();

const urlsIn = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapIndex = urlsIn(await text(`${base}/sitemap.xml`).catch(() => ''));
const pages = [];
for (const sitemap of sitemapIndex.length ? sitemapIndex : [`${base}/sitemap/en.xml`]) {
  pages.push(...urlsIn(await text(sitemap.replace(/^https?:\/\/[^/]+/, base))));
}
console.log(`${pages.length} pages in the sitemap`);

const local = (u) => u.replace(/^https?:\/\/[^/]+/, base);
const records = [];
const internal = new Map(); // address -> pages that link to it
const images = new Map();

const queue = [...pages];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const res = await get(local(url));
      const html = await res.text();
      const $ = load(html);
      // The structured data sits inside <main>, so it is read before the scripts are stripped for the word count.
      const ld = [];
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const data = JSON.parse($(el).text());
          for (const item of Array.isArray(data) ? data : [data]) ld.push(item['@type'] ?? '?');
        } catch {
          ld.push('INVALID');
        }
      });
      const main = $('main').first();
      main.find('script, style, noscript').remove();
      const words = (main.text().replace(/\s+/g, ' ').trim().match(/\S+/g) ?? []).length;
      const chars = main.text().replace(/\s/g, '').length; // Chinese and Japanese have no spaces between words
      const links = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') ?? '';
        if (/^(mailto:|tel:|javascript:|#)/.test(href)) return;
        let target;
        try {
          target = new URL(href, url);
        } catch {
          return;
        }
        if (target.host !== siteHost && target.host !== new URL(base).host) return;
        const key = `${target.pathname}${target.search}`;
        links.push(key);
        internal.set(key, [...(internal.get(key) ?? []), new URL(url).pathname]);
      });
      $('img[src]').each((_, el) => {
        const src = $(el).attr('src') ?? '';
        if (src.startsWith('/_next/image') || src.startsWith('/')) images.set(src, new URL(url).pathname);
      });
      records.push({
        url,
        status: res.status,
        lang: $('html').attr('lang') ?? '',
        title: $('title').first().text().trim(),
        description: $('meta[name="description"]').attr('content')?.trim() ?? '',
        canonical: $('link[rel="canonical"]').attr('href') ?? '',
        robots: $('meta[name="robots"]').attr('content') ?? '',
        hreflang: $('link[rel="alternate"][hreflang]').map((_, el) => `${$(el).attr('hreflang')}=${$(el).attr('href')}`).get(),
        viewport: $('meta[name="viewport"]').attr('content') ?? '',
        h1: $('h1').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get(),
        h2Count: $('h2').length,
        landmarks: { main: $('main').length, nav: $('nav').length, header: $('header').length, footer: $('footer').length },
        jsonLd: ld,
        og: { title: $('meta[property="og:title"]').attr('content') ?? '', image: $('meta[property="og:image"]').attr('content') ?? '' },
        words,
        chars,
        internalLinks: new Set(links).size,
        linkTargets: [...new Set(links.map((l) => l.split('?')[0]))],
        images: $('img').length,
        imagesWithoutAlt: $('img:not([alt])').length,
        externalLinksWithoutNoopener: $('a[target="_blank"]').filter((_, el) => !/noopener/.test($(el).attr('rel') ?? '')).length,
      });
    }
  }),
);
records.sort((a, b) => a.url.localeCompare(b.url));
writeFileSync(path.join(out, 'crawl.json'), JSON.stringify(records, null, 1));

// Every internal link and picture: does it answer 200 straight away?
const checks = [];
const targets = [...internal.keys()];
const queue2 = [...targets];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (let key = queue2.shift(); key; key = queue2.shift()) {
      const res = await get(`${base}${key}`, { method: 'GET' });
      await res.arrayBuffer();
      checks.push({ kind: 'link', target: key, status: res.status, location: res.headers.get('location') ?? '', from: [...new Set(internal.get(key))].slice(0, 3) });
    }
  }),
);
const picQueue = [...images.keys()];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (let src = picQueue.shift(); src; src = picQueue.shift()) {
      const res = await get(src.startsWith('http') ? src : `${base}${src}`);
      await res.arrayBuffer();
      checks.push({ kind: 'image', target: src.slice(0, 120), status: res.status, location: '', from: [images.get(src)] });
    }
  }),
);
writeFileSync(path.join(out, 'links.json'), JSON.stringify(checks, null, 1));

const bad = checks.filter((c) => c.status !== 200);
console.log(`${records.length} pages, ${targets.length} internal addresses, ${images.size} pictures checked`);
console.log(`not 200: ${bad.length}`);
for (const b of bad.slice(0, 25)) console.log(`  ${b.status} ${b.kind} ${b.target} ${b.location ? '-> ' + b.location : ''} (from ${b.from[0]})`);

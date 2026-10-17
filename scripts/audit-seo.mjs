// Measures title, meta description and H1 of every sitemap page (docs/project-plan.md P3.13, test stream T2).
//
//   node scripts/audit-seo.mjs [address]       default http://localhost:3000
//
// Prints how many pages break the length rules of Ek H.3 (title up to 60 characters, description 120 to 160), repeated
// titles and descriptions, and pages without exactly one H1. It reports; it does not fail. Titles and descriptions of
// the moved tours and posts come from the old site and are not rewritten without a reason (principle 12).
import { load } from 'cheerio';

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');

const text = async (url) => (await fetch(url)).text();
const sitemapIndex = await text(`${base}/sitemap.xml`).catch(() => '');
const sitemapUrls = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const pages = [];
for (const sitemap of sitemapUrls.length ? sitemapUrls : [`${base}/sitemap/en.xml`]) {
  const xml = await text(sitemap.replace(/^https?:\/\/[^/]+/, base));
  pages.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}

const kindOf = (url) => {
  const path = new URL(url).pathname.replace(/^\/(en|zh|jp)\//, '/');
  if (path === '/') return 'home';
  if (path.startsWith('/blog/')) return path.split('/').length > 4 ? 'blog post' : 'blog hub or category';
  if (path.startsWith('/destinations/')) {
    const depth = path.split('/').filter(Boolean).length;
    return depth <= 2 ? 'destinations hub' : depth === 3 ? 'country or combo' : 'category or tour';
  }
  return 'other';
};

const rows = [];
const queue = [...pages];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const html = await text(url.replace(/^https?:\/\/[^/]+/, base));
      const $ = load(html);
      rows.push({
        url,
        kind: kindOf(url),
        title: $('title').first().text().trim(),
        description: $('meta[name="description"]').attr('content')?.trim() ?? '',
        h1: $('h1').length,
      });
    }
  }),
);

const dup = (key) => {
  const seen = new Map();
  for (const r of rows) seen.set(r[key], [...(seen.get(r[key]) ?? []), r.url]);
  return [...seen.values()].filter((urls) => urls.length > 1);
};

const kinds = [...new Set(rows.map((r) => r.kind))];
console.log(`${rows.length} pages\n`);
console.log('kind'.padEnd(24), 'pages  title>60  desc<120  desc>160  no-desc  h1!=1');
for (const kind of kinds) {
  const set = rows.filter((r) => r.kind === kind);
  const n = (fn) => String(set.filter(fn).length).padStart(8);
  console.log(
    kind.padEnd(24),
    String(set.length).padStart(5),
    n((r) => r.title.length > 60),
    n((r) => r.description.length > 0 && r.description.length < 120),
    n((r) => r.description.length > 160),
    n((r) => r.description.length === 0),
    n((r) => r.h1 !== 1),
  );
}
console.log(`\nrepeated titles: ${dup('title').length}, repeated descriptions: ${dup('description').length}`);
for (const group of dup('title').slice(0, 5)) console.log('  title shared by', group.slice(0, 3).join(' , '));
if (process.argv.includes('--list')) {
  for (const r of rows.filter((r) => r.title.length > 60 || r.h1 !== 1 || r.description.length < 120 || r.description.length > 160)) {
    console.log(`title ${r.title.length}, description ${r.description.length}, ${r.h1} h1, ${r.url} | ${r.title}`);
  }
}

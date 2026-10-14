// Smoke test of a running site (docs/project-plan.md P2): every sitemap address answers 200 with one H1, a canonical,
// the right html lang and valid JSON-LD; the redirects, the 404 and the 410 behave. Usage: node scripts/check-site.mjs [base]
const base = process.argv[2] ?? 'http://localhost:3113';
const problems = [];
const bad = (url, message) => problems.push(`${url}  ${message}`);

async function get(path, init) {
  return fetch(new URL(path, base), { redirect: 'manual', ...init });
}

const robots = await (await get('/robots.txt')).text();
const sitemapUrls = [...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => new URL(m[1]).pathname);
if (sitemapUrls.length === 0) bad('/robots.txt', 'lists no sitemap');

const urls = [];
for (const sm of sitemapUrls) {
  const xml = await (await get(sm)).text();
  urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
}
console.log(`${sitemapUrls.length} sitemap(s), ${urls.length} URLs`);

const lang = { en: 'en', zh: 'zh-Hant', jp: 'ja' };
let checked = 0;
for (const path of urls) {
  const res = await get(path);
  checked++;
  if (res.status !== 200) { bad(path, `status ${res.status}`); continue; }
  const html = await res.text();
  if (/israel/i.test(html)) bad(path, 'mentions Israel');
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) bad(path, `${h1} H1`);
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  if (!canonical) bad(path, 'no canonical');
  else if (!canonical.endsWith(path)) bad(path, `canonical is ${canonical}`);
  const l = /<html[^>]*\slang="([^"]+)"/.exec(html)?.[1];
  if (l !== lang[path.split('/')[1]]) bad(path, `html lang ${l}`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) bad(path, 'no title');
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) bad(path, 'no description');
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { JSON.parse(m[1]); } catch { bad(path, 'invalid JSON-LD'); }
  }
  const nextImg = [...html.matchAll(/src="(\/_next\/image[^"]+)"/g)].length;
  if (path.includes('/destinations/') && nextImg === 0 && path.split('/').length > 4) bad(path, 'no pictures');
}
console.log(`checked ${checked} pages`);

async function expect(path, status, location) {
  const res = await get(path);
  const loc = res.headers.get('location');
  if (res.status !== status) bad(path, `expected ${status}, got ${res.status}`);
  else if (location && !(loc ?? '').endsWith(location)) bad(path, `expected redirect to ${location}, got ${loc}`);
}
await expect('/', 301, '/en/');
await expect('/en/videos/', 308, '/en/blog/');
await expect('/en/destinations/turkey-tours', 308, '/en/destinations/turkey-tours/');
await expect('/en/nope/', 404);
await expect('/zh/nope/', 404);
await expect('/en/destinations/turkey-tours/not-a-tour/', 404);
await expect('/en/blog/israel/some-post/', 410);
await expect('/en/destinations/israel-tours/', 410);
await expect('/en/sitemap/en.xml', 404);
await expect('/sitemap/zh.xml', 404);
await expect('/en/search-index.json', 200);
await expect('/en/search/', 200);
await expect('/zh/destinations/', 200);
await expect('/jp/', 200);

const search = await (await get('/en/search-index.json')).json();
if (!Array.isArray(search) || search.length < 170) bad('/en/search-index.json', `only ${search.length ?? '?'} entries`);
if (search.some((e) => /israel/i.test(e.title + e.href))) bad('/en/search-index.json', 'mentions Israel');

const zh = await (await get('/zh/destinations/turkey-tours/')).text();
if (!/rel="canonical" href="[^"]*\/en\/destinations\/turkey-tours\/"/.test(zh)) bad('/zh/destinations/turkey-tours/', 'fallback page must point its canonical to English');
if (/hreflang/.test(zh)) bad('/zh/destinations/turkey-tours/', 'must not write hreflang yet');

console.log(problems.length === 0 ? 'ALL OK' : `${problems.length} problem(s):\n${problems.slice(0, 40).join('\n')}`);
process.exit(problems.length === 0 ? 0 : 1);

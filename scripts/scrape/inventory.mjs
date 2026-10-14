// Builds the URL inventory of the old sites from their sitemaps (plus a few known unlisted pages).
// Usage: node scripts/scrape/inventory.mjs [--site en|zh|jp]   (default: all three)
// Output: data/inventory/<site>.csv (git-ignored). Part of docs/project-plan.md P1.2.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classify } from './lib/classify.mjs';
import { toCsv } from './lib/csv.mjs';
import { createFetcher } from './lib/fetcher.mjs';
import { extraSeeds, sites } from './lib/sites.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(root, 'data', 'inventory');
const wanted = process.argv.includes('--site') ? [process.argv[process.argv.indexOf('--site') + 1]] : Object.keys(sites);

const unescapeXml = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");

const fetcher = createFetcher({ intervalMs: 1500, concurrency: 1 });
mkdirSync(outDir, { recursive: true });

for (const id of wanted) {
  const site = sites[id];
  if (!site) {
    throw new Error(`Unknown site "${id}". Use en, zh or jp.`);
  }
  let res = await fetcher.get(site.sitemap, { accept: 'application/xml,text/xml,*/*;q=0.8' });
  for (let hops = 0; hops < 3 && res.status >= 300 && res.status < 400 && res.location; hops += 1) {
    res = await fetcher.get(new URL(res.location, res.url).href, { accept: 'application/xml,text/xml,*/*;q=0.8' });
  }
  if (res.status !== 200) {
    throw new Error(`${site.sitemap} returned ${res.status} ${res.error ?? ''}`);
  }
  // The zh and jp sitemaps declare ISO-8859-9 but contain UTF-8 (Japanese URLs), so the body is decoded as UTF-8.
  const xml = res.buffer.toString('utf8');
  const fromSitemap = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => unescapeXml(match[1]));
  const seeds = extraSeeds[id].map((path) => `${site.origin}${path}`);

  const seen = new Set();
  const rows = [];
  for (const [source, urls] of [
    ['sitemap', fromSitemap],
    ['seed', seeds],
  ]) {
    for (const url of urls) {
      if (seen.has(url)) {
        continue;
      }
      seen.add(url);
      const info = classify(site, url);
      rows.push({
        url,
        site: id,
        locale: info.locale,
        kind: info.kind,
        depth: info.depth,
        subpage: info.subpage,
        israel: info.israel,
        source,
      });
    }
  }

  const file = join(outDir, `${id}.csv`);
  writeFileSync(file, toCsv(rows, ['url', 'site', 'locale', 'kind', 'depth', 'subpage', 'israel', 'source']), 'utf8');

  const byKind = {};
  for (const row of rows) {
    byKind[row.kind] = (byKind[row.kind] ?? 0) + 1;
  }
  console.log(
    `${id}: ${rows.length} URLs (${fromSitemap.length} from sitemap, ${rows.length - fromSitemap.length} seeds), ` +
      `${rows.filter((row) => row.israel).length} Israel, ${rows.filter((row) => row.subpage).length} tour sub-pages`,
  );
  console.log(`   kinds: ${JSON.stringify(byKind)}`);
  console.log(`   written: ${file}`);
}

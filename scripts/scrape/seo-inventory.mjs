// SEO baseline of the archived old pages (docs/project-plan.md P1.11): one row per URL with the on-page facts that
// P4.5 (parity report) and the SEO drift test compare against later.
// Usage: node scripts/scrape/seo-inventory.mjs --site en        Output: data/inventory/seo-<site>.csv (git-ignored)
// Main-content words exclude header, footer, modals (the legal text that repeats on every page), tour cards and FAQ.
// The Chinese and Japanese pages have no spaces between words, so for them `mainWords` is the number of characters (letters, not blanks).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { toCsv } from './lib/csv.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const site = args.includes('--site') ? args[args.indexOf('--site') + 1] : 'en';
const archiveDir = join(root, 'data', 'archive', site);
const manifestFile = join(archiveDir, 'manifest.jsonl');
if (!existsSync(manifestFile)) {
  throw new Error(`No archive for ${site}. Run: node scripts/scrape/archive.mjs --site ${site}`);
}

const latest = new Map();
for (const line of readFileSync(manifestFile, 'utf8').split('\n').filter(Boolean)) {
  const entry = JSON.parse(line);
  latest.set(entry.url, entry);
}

const squash = (value) => value.replace(/\s+/g, ' ').trim();
const cjk = site !== 'en';
const rows = [];
for (const entry of latest.values()) {
  const base = { url: entry.url, kind: entry.kind, status: entry.status, location: entry.location };
  if (entry.status !== 200 || !existsSync(join(archiveDir, `${entry.id}.html`))) {
    rows.push(base);
    continue;
  }
  const $ = cheerio.load(readFileSync(join(archiveDir, `${entry.id}.html`), 'utf8'));
  const title = squash($('title').first().text());
  const description = squash($('meta[name="description"]').attr('content') ?? '');
  const area = (cjk ? $('section.content-area, .home-content').first() : $('.page-content-area, .col-xl-8').first()).clone();
  area.find('script, style, noscript, .modal, .package-card3, .faq-section, .faqWidget, .accordion, .banner3-section, .widget-area, form, select').remove();
  const words = cjk ? squash(area.text()).replace(/\s/g, '').length : squash(area.text()).split(' ').filter(Boolean).length;
  const origin = new URL(entry.url).origin;
  const internal = new Set(
    $('a[href]')
      .map((_, a) => {
        try {
          const target = new URL($(a).attr('href'), entry.url);
          return target.origin === origin ? target.pathname : null;
        } catch {
          return null;
        }
      })
      .get()
      .filter(Boolean),
  );
  const images = $('img');
  const ldTypes = new Set();
  $('script[type="application/ld+json"]').each((_, script) => {
    try {
      const json = JSON.parse($(script).text());
      for (const node of Array.isArray(json['@graph']) ? json['@graph'] : [json]) {
        for (const type of [].concat(node['@type'] ?? [])) ldTypes.add(type);
      }
    } catch {
      ldTypes.add('INVALID');
    }
  });
  rows.push({
    ...base,
    title,
    titleLength: title.length,
    metaDescriptionLength: description.length,
    h1Count: $('h1').length,
    h1First: squash($('h1').first().text()),
    h2Count: $('h2').length,
    canonical: $('link[rel="canonical"]').attr('href') ?? '',
    hreflang: $('link[rel="alternate"][hreflang]').length,
    robots: $('meta[name="robots"]').attr('content') ?? '',
    jsonLdTypes: [...ldTypes].sort().join(' '),
    mainWords: words,
    internalLinks: internal.size,
    images: images.length,
    imagesWithoutAlt: images.filter((_, img) => !squash($(img).attr('alt') ?? '')).length,
    lastUpdated: squash($('.footer-meta').first().text()).replace(/^Last Updated:\s*/i, ''),
  });
}

const columns = [
  'url', 'kind', 'status', 'location', 'title', 'titleLength', 'metaDescriptionLength', 'h1Count', 'h1First', 'h2Count',
  'canonical', 'hreflang', 'robots', 'jsonLdTypes', 'mainWords', 'internalLinks', 'images', 'imagesWithoutAlt', 'lastUpdated',
];
writeFileSync(join(root, 'data', 'inventory', `seo-${site}.csv`), toCsv(rows, columns), 'utf8');

const ok = rows.filter((row) => row.status === 200);
const avg = (key, kind) => {
  const set = ok.filter((row) => row.kind === kind);
  return set.length ? Math.round(set.reduce((sum, row) => sum + Number(row[key] ?? 0), 0) / set.length) : 0;
};
console.log(`${site}: ${rows.length} rows (${ok.length} with status 200), written to data/inventory/seo-${site}.csv`);
for (const kind of [...new Set(ok.map((row) => row.kind))]) {
  console.log(`  ${kind.padEnd(18)} n=${String(ok.filter((r) => r.kind === kind).length).padStart(3)}  main words avg ${avg('mainWords', kind)}  links avg ${avg('internalLinks', kind)}  title len avg ${avg('titleLength', kind)}`);
}

// Parses the archived English tour pages into content/scraped/en/tours/*.json and prints a quality report.
// Usage: node scripts/scrape/parse-en.mjs [--limit N] [--only substring]
// Reads data/archive/en/manifest.jsonl (run archive.mjs first). Part of docs/project-plan.md P1.5 to P1.8.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapedPage } from '../../src/lib/schema/page.ts';
import { scrapedTour } from '../../src/lib/schema/tour.ts';
import { parsePage } from './parse-page.mjs';
import { parseTour } from './parse-tour.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const limit = option('--limit') ? Number(option('--limit')) : Infinity;
const only = option('--only');

const archiveDir = join(root, 'data', 'archive', 'en');
const manifestFile = join(archiveDir, 'manifest.jsonl');
if (!existsSync(manifestFile)) {
  throw new Error('No archive found. Run: node scripts/scrape/archive.mjs --site en');
}
const latest = new Map();
for (const line of readFileSync(manifestFile, 'utf8').split('\n').filter(Boolean)) {
  const entry = JSON.parse(line);
  latest.set(entry.url, entry);
}

const outDir = join(root, 'content', 'scraped', 'en', 'tours');
mkdirSync(outDir, { recursive: true });

const entries = [...latest.values()]
  .filter((entry) => entry.kind === 'tour' && entry.status === 200 && (!only || entry.url.includes(only)))
  .slice(0, limit);

const report = [];
let invalid = 0;
for (const entry of entries) {
  const html = readFileSync(join(archiveDir, `${entry.id}.html`), 'utf8');
  const { tour, issues } = parseTour(html, entry.url);
  const checked = scrapedTour.safeParse(tour);
  if (!checked.success) {
    invalid += 1;
    issues.push(`schema: ${checked.error.issues.slice(0, 3).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  } else {
    writeFileSync(join(outDir, `${tour.path.replaceAll('/', '__')}.json`), `${JSON.stringify(checked.data, null, 2)}\n`);
  }
  report.push({ url: entry.url, issues });
}

const countIssues = (rows) => {
  const counts = {};
  for (const row of rows) {
    for (const issue of row.issues) {
      counts[issue] = (counts[issue] ?? 0) + 1;
    }
  }
  return counts;
};
console.log(`tours: parsed ${entries.length}, ${invalid} failed the schema, ${report.filter((r) => r.issues.length === 0).length} with no issues`);
console.log('tour issue counts:', JSON.stringify(countIssues(report)));

// Other pages. Blog posts are only archived (P1.9), except the five "Map of X" posts that stay at the same URL.
const MAP_POSTS = /\/en\/blog\/[a-z]+\/map-of-[a-z]+\/$/;
const pageEntries = [...latest.values()].filter(
  (entry) =>
    entry.status === 200 &&
    entry.kind !== 'tour' &&
    (entry.kind !== 'blog-post' || MAP_POSTS.test(entry.url)) &&
    (!only || entry.url.includes(only)),
);
const pageReport = [];
let pageInvalid = 0;
for (const entry of pageEntries) {
  const html = readFileSync(join(archiveDir, `${entry.id}.html`), 'utf8');
  const { page, issues } = parsePage(html, entry.url, entry.kind);
  const checked = scrapedPage.safeParse(page);
  if (!checked.success) {
    pageInvalid += 1;
    issues.push(`schema: ${checked.error.issues.slice(0, 3).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  } else {
    const dir = join(root, 'content', 'scraped', 'en', 'pages', entry.kind);
    mkdirSync(dir, { recursive: true });
    const name = page.path === '' ? 'home' : page.path.replaceAll('/', '__');
    writeFileSync(join(dir, `${name}.json`), `${JSON.stringify(checked.data, null, 2)}\n`);
  }
  pageReport.push({ url: entry.url, kind: entry.kind, issues });
}
console.log(`pages: parsed ${pageEntries.length}, ${pageInvalid} failed the schema, ${pageReport.filter((r) => r.issues.length === 0).length} with no issues`);
console.log('page issue counts:', JSON.stringify(countIssues(pageReport)));
writeFileSync(
  join(root, 'data', 'inventory', 'parse-en-report.json'),
  JSON.stringify({ tours: report, pages: pageReport }, null, 2),
);

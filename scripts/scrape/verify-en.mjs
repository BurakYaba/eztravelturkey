// "Unchanged move" check (docs/project-plan.md P1.8): every piece of tour text in content/scraped/en/tours must appear
// verbatim in the text of the archived live page, and the counts of itinerary days, gallery images and FAQ must match
// the page. Also prints the tour totals per parent so they can be compared with the client's figure (about 125).
// Usage: node scripts/scrape/verify-en.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const toursDir = join(root, 'content', 'scraped', 'en', 'tours');
const archiveDir = join(root, 'data', 'archive', 'en');

const manifest = new Map();
for (const line of readFileSync(join(archiveDir, 'manifest.jsonl'), 'utf8').split('\n').filter(Boolean)) {
  const entry = JSON.parse(line);
  manifest.set(entry.url, entry);
}

const norm = (value) => value.replace(/[\s ]+/g, ' ').trim();
const failures = [];
const totals = {};
let checkedStrings = 0;

for (const file of readdirSync(toursDir).filter((name) => name.endsWith('.json'))) {
  const tour = JSON.parse(readFileSync(join(toursDir, file), 'utf8'));
  totals[tour.parent] = (totals[tour.parent] ?? 0) + 1;
  const entry = manifest.get(tour.sourceUrl);
  const $ = cheerio.load(readFileSync(join(archiveDir, `${entry.id}.html`), 'utf8'));
  const pageText = norm($('body').text());

  const expect = (label, text) => {
    for (const piece of String(text).split('\n').map(norm).filter(Boolean)) {
      checkedStrings += 1;
      if (!pageText.includes(piece)) {
        failures.push(`${tour.path}: ${label} not found verbatim: "${piece.slice(0, 80)}"`);
      }
    }
  };

  expect('title', tour.title);
  expect('summary', tour.summary);
  for (const value of Object.values(tour.facts)) expect('fact', value);
  for (const day of tour.itinerary) {
    expect('itinerary title', day.title);
    expect('itinerary text', day.text);
  }
  for (const item of [...tour.included, ...tour.excluded, ...tour.highlights, ...tour.importantNotes, ...tour.cancellationPolicy]) {
    expect('list item', item);
  }
  for (const faq of tour.faqs) {
    expect('faq question', faq.q);
    expect('faq answer', faq.a);
  }

  const counts = [
    ['itinerary days', tour.itinerary.length, $('#tourPlan .accordion-item').length],
    ['gallery images', tour.gallery.length, new Set($('.gallery-img-wrap img').map((_, e) => $(e).attr('src')).get()).size],
    ['faqs', tour.faqs.length, $('#accordionExample .accordion-item').length],
    ['included', tour.included.length, $('h3').filter((_, h) => norm($(h).text()) === 'Included').first().nextAll('.includ-and-exclud-area').first().find('li').filter((_, li) => norm($(li).text()) !== '').length],
  ];
  for (const [label, parsed, onPage] of counts) {
    if (parsed !== onPage) failures.push(`${tour.path}: ${label} parsed ${parsed}, page has ${onPage}`);
  }
}

const total = Object.values(totals).reduce((sum, n) => sum + n, 0);
console.log(`tours checked: ${total} (${JSON.stringify(totals)}), strings compared: ${checkedStrings}`);
console.log(failures.length === 0 ? 'OK: all text found verbatim, all counts match' : `${failures.length} problems:`);
for (const failure of failures.slice(0, 25)) console.log(`  ${failure}`);
process.exitCode = failures.length === 0 ? 0 : 1;

// Archives the raw HTML of the old sites so parsing can be repeated without fetching again.
// Usage: node scripts/scrape/archive.mjs --site en [--limit 20] [--kinds tour,category] [--include-israel]
// Reads data/inventory/<site>.csv (run inventory.mjs first). Writes data/archive/<site>/<sha1>.html|json, an
// append-only manifest.jsonl and report.csv. Safe to stop and re-run: finished URLs are skipped.
// Israel pages are skipped by default: the client dropped Israel, so only their URLs matter (D4).
// Part of docs/project-plan.md P1.3.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, toCsv } from './lib/csv.mjs';
import { createFetcher, decodeBody } from './lib/fetcher.mjs';
import { sites } from './lib/sites.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

const siteId = option('--site');
if (!siteId || !sites[siteId]) {
  throw new Error('Usage: node scripts/scrape/archive.mjs --site en|zh|jp [--limit N] [--kinds a,b] [--include-israel]');
}
const limit = option('--limit') ? Number(option('--limit')) : Infinity;
const kinds = option('--kinds')?.split(',');
const includeIsrael = args.includes('--include-israel');

const inventoryFile = join(root, 'data', 'inventory', `${siteId}.csv`);
if (!existsSync(inventoryFile)) {
  throw new Error(`${inventoryFile} not found. Run: node scripts/scrape/inventory.mjs --site ${siteId}`);
}
const archiveDir = join(root, 'data', 'archive', siteId);
mkdirSync(archiveDir, { recursive: true });
const manifestFile = join(archiveDir, 'manifest.jsonl');

const hash = (value) => createHash('sha1').update(value).digest('hex');
const rows = parseCsv(readFileSync(inventoryFile, 'utf8')).filter(
  (row) => (includeIsrael || row.israel !== 'true') && (!kinds || kinds.includes(row.kind)),
);
const pending = rows.filter((row) => !existsSync(join(archiveDir, `${hash(row.url)}.json`)));
const todo = pending.slice(0, limit);
console.log(`${siteId}: ${rows.length} in scope, ${rows.length - pending.length} already archived, fetching ${todo.length}`);

const fetcher = createFetcher({ intervalMs: 1000, concurrency: 2 });
let done = 0;
const queue = [...todo];
const failures = [];

async function worker() {
  while (queue.length > 0) {
    const row = queue.shift();
    const res = await fetcher.get(row.url);
    const id = hash(row.url);
    const isHtml = /html/i.test(res.contentType);
    const decoded = res.status === 200 && isHtml ? decodeBody(res.buffer, res.contentType) : { charset: '' };
    if (res.status === 200 && isHtml) {
      writeFileSync(join(archiveDir, `${id}.html`), res.buffer);
    }
    const meta = {
      url: row.url,
      kind: row.kind,
      status: res.status,
      location: res.location,
      contentType: res.contentType,
      charset: decoded.charset,
      bytes: res.buffer.length,
      fetchedAt: new Date().toISOString(),
      error: res.error ?? '',
    };
    writeFileSync(join(archiveDir, `${id}.json`), JSON.stringify(meta));
    appendFileSync(manifestFile, `${JSON.stringify({ id, ...meta })}\n`);
    if (res.status !== 200) {
      failures.push(meta);
    }
    done += 1;
    if (done % 25 === 0 || done === todo.length) {
      console.log(`  ${done}/${todo.length} (non-200 so far: ${failures.length})`);
    }
  }
}

await Promise.all([worker(), worker()]);

// Report over everything archived so far (this run and earlier ones).
const entries = existsSync(manifestFile)
  ? readFileSync(manifestFile, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
  : [];
const latest = new Map(entries.map((entry) => [entry.url, entry]));
writeFileSync(
  join(archiveDir, 'report.csv'),
  toCsv([...latest.values()], ['url', 'kind', 'status', 'location', 'charset', 'bytes', 'fetchedAt', 'error']),
  'utf8',
);
const byStatus = {};
for (const entry of latest.values()) {
  byStatus[entry.status] = (byStatus[entry.status] ?? 0) + 1;
}
console.log(`status counts: ${JSON.stringify(byStatus)}`);
if (failures.length > 0) {
  console.log('non-200 this run (first 10):');
  for (const failure of failures.slice(0, 10)) {
    console.log(`  ${failure.status} ${failure.url} ${failure.location} ${failure.error}`);
  }
}

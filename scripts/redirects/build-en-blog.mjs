// Builds src/data/old-blog-urls.json: the addresses of the posts of the old English blog (docs/project-plan.md D12, P7.4).
// The 34 posts the client chose moved to this site at the same address; every other old post goes to the blog hub. The build
// (`src/lib/old-urls.ts`) turns the list into redirects and leaves out the addresses that have a page on this site, so a post the
// editor publishes again at an old address is served as a post.
//
//   node scripts/redirects/build-en-blog.mjs
//
// Reads data/inventory/en.csv (the old site's addresses). Israel posts are left out: they answer 410 (D43, `src/lib/gone.ts`).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const rows = readFileSync(path.join(root, 'data/inventory/en.csv'), 'utf8')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1)));

const paths = rows
  .filter(([, , , kind, , , israel]) => kind === 'blog-post' && israel !== 'true')
  .map(([url]) => new URL(url).pathname)
  .filter((p) => /^\/en\/blog\/[^/]+\/[^/]+\/$/.test(p) && !/israel/i.test(p))
  .sort();

// The old blog lists were split in pages (`/en/blog/egypt/2/`). They were not in the sitemap; the content audit found them by following
// links (`scripts/audit/crawl.mjs`, 2026-10-19). They go to the blog hub as well.
const crawl = path.join(root, 'data/audit/crawl-en.csv');
if (existsSync(crawl)) {
  for (const line of readFileSync(crawl, 'utf8').split(/\r?\n/).slice(1).filter(Boolean)) {
    const [url, status] = line.match(/"([^"]*)"/g).map((cell) => cell.slice(1, -1));
    const pathname = new URL(url).pathname;
    if (status === '200' && /^\/en\/blog\/[^/]+\/\d+\/$/.test(pathname) && !/israel/i.test(pathname)) {
      paths.push(pathname);
    }
  }
}
writeFileSync(path.join(root, 'src/data/old-blog-urls.json'), `${JSON.stringify([...new Set(paths)], null, 1)}\n`);
console.log(`${new Set(paths).size} old blog addresses`);

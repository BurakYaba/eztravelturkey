// Checks the old WordPress blog (eztravelturkey.com/blog/, data/blog-wp/posts.json, not in git): each of its posts answers 301 to the
// new address (/zh/blog/<country>/<post>/) and that page answers 200; the blog home, a category page, the feed and a paging address
// go to the blog hub or the category.
//
//   node scripts/redirects/check-blog.mjs [base]          default base: http://localhost:3100
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '');
const posts = JSON.parse(readFileSync(path.join(root, 'data/blog-wp/posts.json'), 'utf8'));
const table = JSON.parse(readFileSync(path.join(root, 'src/data/redirects-blog.json'), 'utf8'));

const bad = [];
let ok = 0;
let next = 0;
const worker = async () => {
  while (next < posts.length) {
    const post = posts[next++];
    const key = decodeURIComponent(post.slug).trim().toLowerCase();
    const expected = table.posts[key] ?? '/zh/blog/';
    const first = await fetch(base + new URL(post.link).pathname, { redirect: 'manual' });
    const location = first.headers.get('location');
    const target = location ? decodeURIComponent(new URL(location, base).pathname) : '';
    if (first.status !== 301 || target !== expected) {
      bad.push(`${key.slice(0, 40)} -> ${first.status} ${target} (wanted ${expected})`);
      continue;
    }
    const page = await fetch(base + target.split('/').map(encodeURIComponent).join('/'), { redirect: 'manual' });
    if (page.status === 200) {
      ok++;
    } else {
      bad.push(`${target} answers ${page.status}`);
    }
  }
};
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`old blog posts that reach their new page: ${ok} of ${posts.length}`);
bad.slice(0, 10).forEach((b) => console.log('  BAD', b));

let other = 0;
for (const [from, wanted] of [
  ['/blog/', '/zh/blog/'],
  ['/blog/category/turkey-travel-information/', '/zh/blog/turkey/'],
  ['/blog/feed/', '/zh/blog/'],
  ['/blog/page/2/', '/zh/blog/'],
]) {
  const response = await fetch(base + from, { redirect: 'manual' });
  const to = decodeURIComponent(new URL(response.headers.get('location') ?? '/', base).pathname);
  const good = response.status === 301 && to === wanted;
  console.log(`${good ? 'PASS' : 'FAIL'} ${from} -> ${response.status} ${to}`);
  other += good ? 0 : 1;
}
process.exit(bad.length === 0 && other === 0 ? 0 : 1);

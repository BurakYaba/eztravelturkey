// Converts the posts of the old WordPress blog (eztravelturkey.com/blog/) into `blogPost` documents of this site, and writes the
// table that sends each old address to its new place.
//
//   node scripts/sanity/import-wp-blog.mjs            dry run: builds data/blog-wp/blogposts-zh.ndjson and src/data/redirects-blog.json
//   node scripts/sanity/import-wp-blog.mjs --check    the same, and checks every picture can be fetched
//   node scripts/sanity/import-wp-blog.mjs --write    uploads the pictures and writes the 188 posts and the 5 categories
//                                                    (needs SANITY_WRITE_TOKEN, Editor role)
//
// Input: data/blog-wp/posts.json (the WordPress REST API, `_embed=1`, fetched 2026-10-29). Each post belongs to exactly one of five
// categories (Turkey, Greece, Jordan, Egypt, Morocco); the category is the folder of the new address: /zh/blog/<country>/<post>/.
// Eight posts named Israel in passing; those sentences are taken out (israelFixes below). It writes only to project 91izz3mt.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { createClient } from '@sanity/client';

const root = path.resolve(import.meta.dirname, '../..');
const targetProject = process.env.SANITY_PROJECT_ID ?? '91izz3mt';
const dataset = process.env.SANITY_DATASET ?? 'production';
const args = new Set(process.argv.slice(2));
const write = args.has('--write');
const check = args.has('--check');

if (targetProject === 'aj0pbi0w') {
  throw new Error('Refusing to run: aj0pbi0w is the project of magnificenttravel.com.');
}

/**
 * The site has no Israel content (docs/project-plan.md D4). Eight posts named it in passing (a neighbour, a border, the Bible); the
 * owner decided on 2026-10-29 to take those sentences out and import the posts. Each entry is the exact text of the old post and
 * what replaces it; a text that is not found stops the run, so a changed post is noticed. Where Palestine stood in the same list
 * it goes too, so the list does not read as a statement.
 */
const israelFixes = {
  1642: [['坐落在約旦崎嶇的山丘和以色列寧靜的風景之間，有一個與眾不同的自然奇觀：死海。', '坐落在約旦崎嶇的山丘之間，有一個與眾不同的自然奇觀：死海。']],
  1159: [['您也可以在約旦、以色列或摩洛哥周圍度過時光。', '您也可以在約旦或摩洛哥周圍度過時光。']],
  307: [
    ['東北方是巴勒斯坦和以色列，', ''],
    ['埃及與以色列簽訂和平協議 (1979 年)', ''],
  ],
  304: [['（計畫由約旦陸路前往以色列之旅客，宜留意可能會因邊關不定期關閉等因素，致行程受阻）', '']],
  298: [['分屬於埃及、沙烏地阿拉伯、以色列和約旦', '分屬於埃及、沙烏地阿拉伯和約旦']],
  292: [
    [
      '聖經裏面描寫了以色列國王和來自猶太及伊多姆的盟軍掠奪了摩押，在Kir Heres堡壘包圍了摩押的米沙王（Mesha）。而當時的Kir Heres就是今天的卡拉克。',
      '',
    ],
  ],
  288: [['就能到達與以色列相鄰的邊境，埃及的Sinai和沙烏地阿拉伯。', '就能到達埃及的Sinai和沙烏地阿拉伯的邊境。']],
  268: [['與敘利亞，沙烏地阿拉伯，紅海，巴勒斯坦，以色列和伊拉克等國接壤。', '與敘利亞，沙烏地阿拉伯，紅海和伊拉克等國接壤。']],
};
/** Posts whose text was changed this way; their meta description is made from the corrected text, not the old excerpt. */
const mentionsIsrael = (text) => /以色列|israel/i.test(text);

const countries = {
  1: { folder: 'turkey', title: '土耳其旅遊資訊', intro: '前往土耳其旅遊前需要知道的簽證、交通、氣候、景點與實用資訊。' },
  10: { folder: 'greece', title: '希臘旅遊資訊', intro: '前往希臘旅遊前需要知道的簽證、交通、氣候、景點與實用資訊。' },
  11: { folder: 'jordan', title: '約旦旅遊資訊', intro: '前往約旦旅遊前需要知道的簽證、交通、氣候、景點與實用資訊。' },
  12: { folder: 'egypt', title: '埃及旅遊資訊', intro: '前往埃及旅遊前需要知道的簽證、交通、氣候、景點與實用資訊。' },
  13: { folder: 'morocco', title: '摩洛哥旅遊資訊', intro: '前往摩洛哥旅遊前需要知道的簽證、交通、氣候、景點與實用資訊。' },
};

const posts = JSON.parse(readFileSync(path.join(root, 'data/blog-wp/posts.json'), 'utf8'));

// ---- HTML to blocks

let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}`;
const dropped = { iframe: 0, empty: 0 };
const imageUrls = new Set();

/**
 * Simplified characters found in the Traditional text of the old blog (measured 2026-10-29: 杰 4, 內 1, 鲁 2, 峡 1, 气 7, 温 11, 兹 1,
 * in 8 posts). The same kind of fix as the one made in the 72 documents of the old site; `游` is left alone (游泳 is right).
 * A native editor still has to read the posts.
 */
const simplifiedFixes = { 杰: '傑', 内: '內', 鲁: '魯', 峡: '峽', 气: '氣', 温: '溫', 兹: '茲' };
const fixChars = (text) => text.replace(/[杰内鲁峡气温兹]/g, (ch) => simplifiedFixes[ch]);

const clean = (text) =>
  fixChars(text)
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

/** Text of an element with <br> as line breaks. */
const textOf = (node) => {
  const html = node.innerHTML.replace(/<br\s*\/?>/gi, '\n');
  return clean(parse(`<div>${html}</div>`).text.replace(/&nbsp;/g, ' '));
};

/** The original file of a WordPress thumbnail: `Egypt01-1024x683.jpeg` is `Egypt01.jpeg`. */
const originalOf = (src) => src.replace(/-\d{2,4}x\d{2,4}(\.[a-z]+)$/i, '$1');

const imageBlock = (img, fallbackAlt, caption) => {
  const src = img.getAttribute('src');
  if (!src) {
    return null;
  }
  const url = originalOf(new URL(src, 'https://eztravelturkey.com').href);
  imageUrls.add(url);
  const alt = (img.getAttribute('alt') || '').trim() || fallbackAlt;
  return { _key: key(), _type: 'imageBlock', image: { _type: 'picture', alt, _wpSrc: url, _wpFallback: src } };
};

const isHeadingLike = (p) => {
  const text = textOf(p);
  if (!text || text.length > 40 || /[。；]$/.test(text) || text.includes('\n')) {
    return false;
  }
  const strong = p.querySelectorAll('strong, b').map((s) => textOf(s)).join('').replace(/\s+/g, '');
  return strong.length > 0 && strong === text.replace(/\s+/g, '');
};

function convert(html, title) {
  const sections = [];
  let current = { _key: key(), _type: 'section', level: 0, blocks: [] };
  sections.push(current);
  const startSection = (heading, level) => {
    if (current.blocks.length === 0 && !current.heading && sections.length === 1 && current.level === 0) {
      sections.pop();
    }
    current = { _key: key(), _type: 'section', level, heading, blocks: [] };
    sections.push(current);
  };
  const add = (block) => {
    if (block) {
      current.blocks.push(block);
    }
  };
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        const text = clean(child.text);
        if (text) {
          add({ _key: key(), _type: 'paragraph', text });
        }
        continue;
      }
      if (child.nodeType !== 1) {
        continue;
      }
      const tag = child.tagName?.toLowerCase();
      if (tag === 'p') {
        const imgs = child.querySelectorAll('img');
        if (imgs.length > 0 && !textOf(child)) {
          imgs.forEach((img) => add(imageBlock(img, title)));
        } else if (isHeadingLike(child)) {
          startSection(textOf(child), 2);
        } else {
          imgs.forEach((img) => add(imageBlock(img, title)));
          // The old 2019 posts separate their lines with <br>: each line is a paragraph of its own.
          for (const line of textOf(child).split('\n')) {
            if (line.trim()) {
              add({ _key: key(), _type: 'paragraph', text: line.trim() });
            }
          }
        }
      } else if (/^h[1-6]$/.test(tag)) {
        const text = textOf(child);
        if (text) {
          startSection(text, tag === 'h2' || tag === 'h1' ? 2 : tag === 'h3' ? 3 : 4);
        }
      } else if (tag === 'figure') {
        const img = child.querySelector('img');
        if (img) {
          add(imageBlock(img, title, child.querySelector('figcaption')?.text));
        } else {
          walk(child);
        }
      } else if (tag === 'img') {
        add(imageBlock(child, title));
      } else if (tag === 'table') {
        const rows = child
          .querySelectorAll('tr')
          .map((tr) => ({ _key: key(), _type: 'tableRow', cells: tr.querySelectorAll('td, th').map((c) => textOf(c)) }))
          .filter((r) => r.cells.some(Boolean));
        if (rows.length > 0) {
          add({ _key: key(), _type: 'table', rows });
        }
      } else if (tag === 'ul' || tag === 'ol') {
        const items = child.querySelectorAll('li').map((li) => textOf(li)).filter(Boolean);
        if (items.length > 0) {
          add({ _key: key(), _type: 'list', ordered: tag === 'ol', items });
        }
      } else if (tag === 'blockquote') {
        const text = textOf(child);
        if (text) {
          add({ _key: key(), _type: 'paragraph', text });
        }
      } else if (tag === 'iframe') {
        dropped.iframe++;
      } else if (tag === 'script' || tag === 'style' || tag === 'footer' || tag === 'nav' || tag === 'header') {
        // nothing to keep (three 2019 posts carry the old template's footer: social links and country menus)
      } else if (tag === 'br') {
        // line breaks between blocks mean nothing here
      } else {
        walk(child);
      }
    }
  };
  walk(parse(html));
  return sections.filter((s) => s.blocks.length > 0 || s.heading);
}

// ---- sanitized addresses

const decodeSlug = (slug) => {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};
/** The new address is made from the title (Traditional Chinese): the slugs of the 2019 posts are Simplified (圣托里尼岛). */
const slugOfPost = (post) => {
  const base = fixChars(stripTags(post.title.rendered))
    .toLowerCase()
    .replace(/[^\p{Script=Han}a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return base || `post-${post.id}`;
};

const stripTags = (html) => parse(`<div>${html}</div>`).text.replace(/&[#\w]+;/g, ' ').replace(/\s+/g, ' ').trim();

const descriptionOf = (post) => {
  const text = stripTags(post.excerpt?.rendered ?? '').replace(/\s*(\[…\]|\[&hellip;\]|…|\.\.\.)\s*$/, '').trim();
  const source = text || stripTags(post.content.rendered);
  if (source.length <= 110) {
    return source;
  }
  const cut = source.slice(0, 110);
  const stop = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('，'), cut.lastIndexOf('！'), cut.lastIndexOf('？'));
  return stop > 60 ? cut.slice(0, stop + 1) : `${cut}…`;
};

// ---- build

const docs = [];
const redirects = {};
const used = new Set();
const fixedPosts = [];
const noCategory = [];
let tables = 0;
let imageBlocks = 0;
let thin = 0;

for (const original of posts) {
  let post = original;
  if (israelFixes[original.id]) {
    let html = original.content.rendered;
    for (const [from, to] of israelFixes[original.id]) {
      if (!html.includes(from)) {
        throw new Error(`Post ${original.id}: the text to take out was not found: ${from.slice(0, 40)}`);
      }
      html = html.replace(from, to);
    }
    post = { ...original, content: { rendered: html }, excerpt: { rendered: '' } };
    fixedPosts.push(original.id);
  }
  const category = post.categories.map((id) => countries[id]).find(Boolean);
  if (!category) {
    noCategory.push(post.id);
    continue;
  }
  const title = fixChars(stripTags(post.title.rendered));
  let slug = slugOfPost(post);
  if (used.has(`${category.folder}/${slug}`)) {
    slug = `${slug}-${post.id}`;
  }
  used.add(`${category.folder}/${slug}`);
  const newPath = `blog/${category.folder}/${slug}`;
  const sections = convert(post.content.rendered, title);
  tables += sections.flatMap((s) => s.blocks).filter((b) => b._type === 'table').length;
  imageBlocks += sections.flatMap((s) => s.blocks).filter((b) => b._type === 'imageBlock').length;
  const chars = (stripTags(post.content.rendered).match(/[一-鿿]/g) ?? []).length;
  if (chars < 300) {
    thin++;
  }
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const doc = {
    _id: `blogpost-zh-wp-${post.id}`,
    _type: 'blogPost',
    // The date of the old post, so the Studio does not ask for an author on a post that predates the new site.
    _createdAt: new Date(post.date_gmt ? `${post.date_gmt}Z` : post.date).toISOString(),
    kind: 'blog-post',
    language: 'zh',
    title,
    path: newPath,
    metaDescription: fixChars(descriptionOf(post)),
    lastUpdated: post.modified.slice(0, 10),
    sections,
    faqs: [],
  };
  if (media?.source_url) {
    const url = originalOf(media.source_url);
    imageUrls.add(url);
    doc.mainImage = { _type: 'picture', alt: (media.alt_text || '').trim() || title, _wpSrc: url, _wpFallback: media.source_url };
  }
  if (mentionsIsrael(JSON.stringify(doc))) {
    throw new Error(`Post ${post.id} still names Israel after the fixes.`);
  }
  docs.push(doc);
  // Old address (any form of the slug) -> new address.
  redirects[decodeSlug(post.slug).trim().toLowerCase()] = `/zh/${newPath}/`;
}

const categoryDocs = Object.values(countries).map((c) => ({
  _id: `blogcategory-zh-blog-${c.folder}`,
  _type: 'blogCategory',
  kind: 'blog-category',
  language: 'zh',
  title: c.title,
  path: `blog/${c.folder}`,
  metaDescription: c.intro,
  sections: [{ _key: key(), _type: 'section', level: 0, blocks: [{ _key: key(), _type: 'paragraph', text: c.intro }] }],
  faqs: [],
}));

// WordPress category pages go to the new category page.
const wpCategories = JSON.parse(readFileSync(path.join(root, 'data/blog-wp/categories.json'), 'utf8'));
const categoryRedirects = {};
for (const c of wpCategories) {
  if (countries[c.id]) {
    categoryRedirects[c.slug.toLowerCase()] = `/zh/blog/${countries[c.id].folder}/`;
  }
}

const sortedRedirects = Object.fromEntries(Object.entries(redirects).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(
  path.join(root, 'src/data/redirects-blog.json'),
  `${JSON.stringify({ posts: sortedRedirects, categories: categoryRedirects }, null, 1)}\n`,
);
writeFileSync(
  path.join(root, 'data/blog-wp/blogposts-zh.ndjson'),
  [...categoryDocs, ...docs].map((d) => JSON.stringify(d)).join('\n') + '\n',
);

console.log(`posts read: ${posts.length}`);
console.log(`blogPost documents built: ${docs.length}  (sentences about Israel taken out of ${fixedPosts.length} posts; without category: ${noCategory.length})`);
console.log(`category documents: ${categoryDocs.length}`);
console.log(`blocks: ${imageBlocks} pictures in text, ${tables} tables; iframes dropped: ${dropped.iframe}; posts under 300 Chinese characters: ${thin}`);
console.log(`pictures to move: ${imageUrls.size} different files`);
console.log(`redirects: ${Object.keys(sortedRedirects).length} posts, ${Object.keys(categoryRedirects).length} categories`);

// ---- pictures

/** Fetches a picture; the body is read inside the retry loop, so a slow or cut transfer is tried again instead of ending the run. */
const fetchFile = async (url, fallback, withBody = false) => {
  for (const candidate of [url, fallback].filter(Boolean)) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(candidate, { signal: AbortSignal.timeout(90000) });
        if (response.ok) {
          if (withBody) {
            return { buffer: Buffer.from(await response.arrayBuffer()), url: candidate };
          }
          await response.body?.cancel();
          return { url: candidate };
        }
        if (response.status < 500 && response.status !== 429) {
          break;
        }
      } catch {
        // try again
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt * attempt));
    }
  }
  return null;
};

const pictureNodes = [];
const findPictures = (node) => {
  if (Array.isArray(node)) {
    node.forEach(findPictures);
  } else if (node && typeof node === 'object') {
    if (node._wpSrc) {
      pictureNodes.push(node);
    }
    Object.values(node).forEach(findPictures);
  }
};
docs.forEach(findPictures);

const pool = async (items, size, worker) => {
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        await worker(items[next++]);
      }
    }),
  );
};

const unique = new Map();
pictureNodes.forEach((n) => unique.set(n._wpSrc, n._wpFallback));

if (check && !write) {
  let ok = 0;
  const bad = [];
  await pool([...unique], 8, async ([url, fallback]) => {
    const got = await fetchFile(url, fallback);
    if (got) {
      ok++;
    } else {
      bad.push(url);
    }
  });
  console.log(`pictures reachable: ${ok} of ${unique.size}`);
  bad.slice(0, 10).forEach((b) => console.log('  UNREACHABLE', b));
}

if (!write) {
  console.log('Dry run finished: nothing was written to Sanity.');
  process.exit(0);
}

// ---- writing

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  throw new Error('SANITY_WRITE_TOKEN is not set (an Editor token of project 91izz3mt, kept in .env.local).');
}
const client = createClient({ projectId: targetProject, dataset, apiVersion: '2025-01-01', token, useCdn: false });

const assetOf = new Map();
const missing = [];
let done = 0;
await pool([...unique], 6, async ([url, fallback]) => {
  const got = await fetchFile(url, fallback, true);
  if (!got) {
    missing.push(url);
    return;
  }
  try {
    // The same file uploaded again gives the same asset, so a run that stopped halfway can simply be started again.
    const asset = await client.assets.upload('image', got.buffer, { filename: decodeSlug(got.url.split('/').pop() ?? 'image') });
    assetOf.set(url, asset._id);
  } catch (error) {
    missing.push(`${url} (upload failed: ${error.message})`);
    return;
  }
  if (++done % 25 === 0) {
    console.log(`  uploaded ${done} of ${unique.size}`);
  }
});
console.log(`uploaded ${assetOf.size} pictures; unreachable: ${missing.length}`);

// A picture that could not be fetched is dropped from the text (the post is still written); the list is printed.
const finish = (node) => {
  if (Array.isArray(node)) {
    return node.map(finish).filter((x) => x !== null);
  }
  if (node && typeof node === 'object') {
    if (node._wpSrc) {
      const id = assetOf.get(node._wpSrc);
      return id ? { _type: 'picture', alt: node.alt, asset: { _type: 'reference', _ref: id } } : null;
    }
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      const value = finish(v);
      if (value !== null) {
        out[k] = value;
      }
    }
    // an imageBlock whose picture is gone has nothing left
    return node._type === 'imageBlock' && !out.image ? null : out;
  }
  return node;
};

const finalDocs = [...categoryDocs, ...docs.map(finish)];
for (let i = 0; i < finalDocs.length; i += 10) {
  const tx = client.transaction();
  finalDocs.slice(i, i + 10).forEach((d) => tx.createOrReplace(d));
  await tx.commit();
}
console.log(`wrote ${finalDocs.length} documents (${categoryDocs.length} categories, ${docs.length} posts).`);
if (missing.length) {
  console.log('pictures that could not be fetched:');
  missing.forEach((m) => console.log('  ', m));
}

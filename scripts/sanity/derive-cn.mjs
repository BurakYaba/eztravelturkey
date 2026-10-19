// Fills in what the Simplified Chinese import cannot take from the old site (docs/project-plan.md, cn language, 2026-10-19):
//   - the home page: the old /cn/ home was never archived, so it is the Traditional Chinese home page converted to Simplified
//     (the cards point at the cn tours of the same trips);
//   - the main picture of every cn tour: the same trip has the same Depositphotos picture as its Traditional Chinese twin.
//
//   node --env-file-if-exists=.env.local scripts/sanity/derive-cn.mjs [--dry]
//
// Needs the zh documents to be in the dataset (run it before they are removed) and `npm i -D opencc-js`. Safe to run again.
// SANITY_DATASET picks the dataset (default production); SANITY_WRITE_TOKEN is needed.
import { createClient } from '@sanity/client';
import * as OpenCC from 'opencc-js';

const dry = process.argv.includes('--dry');
const dataset = process.env.SANITY_DATASET ?? 'production';
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w',
  dataset,
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
  perspective: 'published',
});

// Character level only: phrase mode turns 行程 ("itinerary") into 进程 ("process"). Same word fixes as the UI dictionary.
const toCn = OpenCC.Converter({ from: 't', to: 'cn' });
const words = [['网路', '网络'], ['联络', '联系'], ['饭店', '酒店'], ['搜寻', '搜索'], ['小团体', '小团'], ['软体', '软件'], ['资讯', '信息'], ['讯息', '消息']];
const simplify = (text) => words.reduce((t, [a, b]) => t.split(a).join(b), toCn(text));

/** Same trip, same page: the two address families differ in a few places (10-days-or-longer, a number in front of one slug). */
const key = (p) => p.toLowerCase().replace('or-longer', 'or-more').replace(/(^|\/)\d+-(?=[a-z])/g, '$1');

const cnTours = await client.fetch('*[_type == "tour" && language == "cn"]{ _id, path }');
const zhTours = await client.fetch('*[_type == "tour" && language == "zh"]{ path, heroImage }');
const cnByKey = new Map(cnTours.map((t) => [key(t.path), t.path]));
const zhByKey = new Map(zhTours.map((t) => [key(t.path), t]));

// ---- tour pictures
let heroes = 0;
for (const tour of cnTours) {
  const twin = zhByKey.get(key(tour.path));
  if (!twin?.heroImage?.asset) continue;
  heroes += 1;
  if (!dry) await client.patch(tour._id).set({ heroImage: twin.heroImage }).commit();
}
console.log(`${dataset}: ${heroes} of ${cnTours.length} cn tours got the main picture of their zh twin`);

// ---- home page
const zhHome = await client.fetch('*[_type == "homePage" && language == "zh"][0]');
if (!zhHome) {
  console.log('No zh home page in this dataset: nothing to derive.');
  process.exit(0);
}
/** `/destinations/turkey-tours/x/` of a zh tour becomes the address of its cn tour; other addresses stay. */
const hrefOf = (href) => {
  const path = href.replace(/^\/+|\/+$/g, '');
  const cn = cnByKey.get(key(path));
  return cn ? `/${cn}/` : href;
};
const home = {
  _id: 'homepage-cn-home',
  _type: 'homePage',
  language: 'cn',
  kind: 'home',
  title: simplify(zhHome.title),
  metaTitle: simplify(zhHome.metaTitle ?? zhHome.title),
  metaDescription: simplify(zhHome.metaDescription ?? ''),
  ...(zhHome.mainImage ? { mainImage: zhHome.mainImage } : {}),
  cards: (zhHome.cards ?? []).map((card, i) => ({
    _key: `k${i.toString(36)}`,
    _type: 'card',
    title: simplify(card.title),
    href: hrefOf(card.href ?? ''),
    meta: (card.meta ?? []).map(simplify),
    price: card.price ? simplify(card.price) : undefined,
    ...(card.image ? { image: card.image } : {}),
  })),
};
console.log(`home page: ${home.cards.length} cards; title "${home.title}"`);
if (!dry) await client.createOrReplace(home);

// ---- blog hub: the old /cn/blog/ answered "404 Not Found", so the Traditional Chinese hub page is converted instead
const convert = (value) => {
  if (typeof value === 'string') return simplify(value);
  if (Array.isArray(value)) return value.map(convert);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, convert(v)]));
  return value;
};
const zhBlog = await client.fetch('*[_type == "hubPage" && language == "zh" && path == "blog"][0]');
if (zhBlog) {
  const { _rev, _createdAt, _updatedAt, ...rest } = zhBlog;
  const blog = { ...convert(rest), _id: 'hubpage-cn-blog', language: 'cn' };
  console.log(`blog hub: "${blog.title ?? blog.metaTitle}"`);
  if (!dry) await client.createOrReplace(blog);
}

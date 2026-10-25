// Proves, for every document and every field of the Studio, that what an editor changes shows on the site, and that a page survives
// an editor removing things. It writes only to the `staging` dataset (run sync-to-staging.mjs first, and point a local site at it:
// `SANITY_DATASET=staging npx next dev -p 3113`; it refuses to run against anything else).
//
//   node --env-file-if-exists=.env.local scripts/sanity/field-audit.mjs mark     # a marker in front of every text of every document
//   node --env-file-if-exists=.env.local scripts/sanity/field-audit.mjs check    # does each marker show on the page it belongs to?
//   node --env-file-if-exists=.env.local scripts/sanity/field-audit.mjs remove   # drop the first item of every list
//   node --env-file-if-exists=.env.local scripts/sanity/field-audit.mjs check-removed
//   node --env-file-if-exists=.env.local scripts/sanity/field-audit.mjs clear    # every optional field emptied
//   node --env-file-if-exists=.env.local scripts/sanity/field-audit.mjs check-clear
//
// Options: --base=http://localhost:3113 (the local site). The state between the steps is kept in the system temp folder.
import { createClient } from '@sanity/client';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const step = process.argv[2];
const base = (process.argv.find((a) => a.startsWith('--base='))?.slice(7) ?? 'http://localhost:3113').replace(/\/$/, '');
const stateFile = path.join(os.tmpdir(), 'field-audit-state.json');
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {throw new Error('SANITY_WRITE_TOKEN is missing');}
const make = (dataset) => createClient({ projectId: 'aj0pbi0w', dataset, apiVersion: '2025-01-01', token, useCdn: false, perspective: 'raw' });
const staging = make('staging');
const production = make('production');

const DOC_TYPES = ['tour', 'destinationPage', 'blogPost', 'blogCategory', 'author', 'staticPage', 'hubPage', 'homePage', 'siteSettings', 'tourTexts', 'teamMember'];
const PAGE_TYPES = ['tour', 'destinationPage', 'blogPost', 'blogCategory', 'author', 'staticPage', 'hubPage'];
const LANGS = ['en', 'cn', 'jp'];
// Text that is not meant to be read as words: addresses, codes, numbers written as text.
const SKIP = new Set(['language', 'kind', 'path', 'parent', 'category', 'translationGroup', 'canonicalUrl', 'href', 'url', 'facebook', 'instagram', 'linkedin', 'x', 'youtube', 'tripadvisor', 'email', 'phone', 'whatsapp', 'lastUpdated', 'unit', 'licenseNo', 'rating']);
const MARKER = /ZQ[0-9a-z]+X/g;
// Texts that are in the Studio but are not meant to show as typed (found by this audit, 2026-10-25, and explained in the Studio):
const EXPECTED = [
  [/^tour\/\w+\s+facts\.groupType/, 'shown as a label ("Private", "Small Group", "Private or small group"), not as typed'],
  [/^tour\/\w+\s+facts\.startingPrice/, 'a record of the old site; the price comes from the Price tab'],
  [/^homePage\/\w+\s+(cards|mainImage)/, 'hidden in the Studio; the home page draws its own cards and pictures'],
  [/^hubPage\/\w+\s+mainImage/, 'hidden in the Studio; the hubs draw a banner from the code'],
  [/^hubPage\/\w+\s+sections/, 'only the guide sections at the end of the destinations hub show (explained in the Studio)'],
  [/^staticPage\/\w+\s+(mainImage|sections|metaDescription)/, 'About, Contact and FAQ draw their own layout (explained in the Studio); an English description needs 120-160 characters'],
  [/^blogPost\/\w+\s+sections\[\]\.blocks\[\]\.image\.alt/, 'the first picture of a post is its banner and is not drawn twice'],
];
const expectedWhy = (key) => EXPECTED.find(([re]) => re.test(key))?.[1];

const loadState = () => JSON.parse(fs.readFileSync(stateFile, 'utf8'));
const saveState = (state) => fs.writeFileSync(stateFile, JSON.stringify(state));

const fetchDocs = (client) =>
  client.fetch(`*[_type in $types && language in $langs && !(_id in path("drafts.**"))]`, { types: DOC_TYPES, langs: LANGS });

/** The addresses on the site that show a document. */
function urlsOf(doc, docs) {
  const seg = (p) => p.split('/').map(encodeURIComponent).join('/');
  const lang = doc.language;
  if (PAGE_TYPES.includes(doc._type)) {return [`/${lang}/${seg(doc.path)}/`];}
  if (doc._type === 'homePage') {return [`/${lang}/`];}
  if (doc._type === 'siteSettings') {return [`/${lang}/`, `/${lang}/contact/`, `/${lang}/about/`];}
  if (doc._type === 'teamMember') {return [`/${lang}/about/`, `/${lang}/contact/`];}
  if (doc._type === 'tourTexts') {
    const tour = docs.find((d) => d._type === 'tour' && d.language === lang);
    return tour ? [`/${lang}/${seg(tour.path)}/`] : [];
  }
  return [];
}

const cache = new Map();
async function page(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      (async () => {
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await fetch(base + url, { redirect: 'manual' });
            return { status: response.status, html: response.status === 200 ? await response.text() : '' };
          } catch {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        }
        return { status: 0, html: '' };
      })(),
    );
  }
  return cache.get(url);
}

async function pool(items, size, work) {
  const queue = [...items];
  await Promise.all(Array.from({ length: size }, async () => {
    while (queue.length) {await work(queue.shift());}
  }));
}

async function write(docs) {
  for (let i = 0; i < docs.length; i += 25) {
    const tx = staging.transaction();
    docs.slice(i, i + 25).forEach(({ _rev, _updatedAt, ...doc }) => tx.createOrReplace(doc));
    await tx.commit();
  }
}

async function revalidateSite() {
  await fetch(`${base}/api/revalidate/`, { method: 'POST', headers: { 'x-revalidate-secret': process.env.SANITY_REVALIDATE_SECRET ?? '' } }).catch(() => {});
  cache.clear();
}

// ---------------------------------------------------------------------------------------------------------------- mark
if (step === 'mark') {
  const docs = await fetchDocs(staging);
  const markers = {}; // marker -> { id, type, lang, field }
  let counter = 0;
  const walk = (node, gpath, doc) => {
    if (Array.isArray(node)) {
      return node.map((value) => {
        if (typeof value === 'string') {
          const marker = `ZQ${(counter++).toString(36)}X`;
          markers[marker] = { id: doc._id, type: doc._type, lang: doc.language, field: `${gpath}[]` };
          return `${marker} ${value}`;
        }
        return walk(value, `${gpath}[]`, doc);
      });
    }
    if (node && typeof node === 'object') {
      const out = {};
      for (const [key, value] of Object.entries(node)) {
        if (key.startsWith('_') || SKIP.has(key)) {out[key] = value; continue;}
        const field = gpath ? `${gpath}.${key}` : key;
        if (typeof value === 'string' && value.trim()) {
          const marker = `ZQ${(counter++).toString(36)}X`;
          markers[marker] = { id: doc._id, type: doc._type, lang: doc.language, field };
          out[key] = `${marker} ${value}`;
        } else {
          out[key] = walk(value, field, doc);
        }
      }
      return out;
    }
    return node;
  };
  const marked = docs.map((doc) => ({ ...walk(doc, '', doc), _id: doc._id, _type: doc._type }));
  await write(marked);
  saveState({ markers, ids: docs.map((d) => d._id) });
  console.log(`${docs.length} documents marked, ${Object.keys(markers).length} markers written to staging`);
  await revalidateSite();
}

// -------------------------------------------------------------------------------------------------------------- check
if (step === 'check') {
  const { markers } = loadState();
  const docs = await fetchDocs(staging);
  const byDoc = new Map();
  for (const [marker, info] of Object.entries(markers)) {
    const list = byDoc.get(info.id) ?? [];
    list.push([marker, info]);
    byDoc.set(info.id, list);
  }
  const problems = new Map(); // "type/lang field" -> { missing, total, example }
  const badPages = [];
  let pages = 0;
  await pool(docs, 4, async (doc) => {
    const urls = urlsOf(doc, docs);
    const list = byDoc.get(doc._id) ?? [];
    if (!urls.length || !list.length) {return;}
    const found = await Promise.all(urls.map(page));
    pages += urls.length;
    for (let i = 0; i < urls.length; i++) {if (found[i].status !== 200) {badPages.push(`${found[i].status} ${urls[i]} (${doc._type}/${doc.language})`);}}
    for (const [marker, info] of list) {
      const key = `${info.type}/${info.lang}  ${info.field}`;
      const entry = problems.get(key) ?? { missing: 0, total: 0, example: '' };
      entry.total++;
      if (!found.some((f) => f.html.includes(marker))) {entry.missing++; entry.example ||= `${info.id} ${urls[0]}`;}
      problems.set(key, entry);
    }
  });
  const all = [...problems].filter(([, v]) => v.missing > 0).sort((a, b) => b[1].missing - a[1].missing);
  const rows = all.filter(([key]) => !expectedWhy(key));
  console.log(`${pages} pages read, ${Object.keys(markers).length} markers; ${all.length - rows.length} fields are known not to show as typed, ${rows.length} are NOT explained`);
  if (rows.length === 0) {console.log('  every other text of every document shows on its page');}
  for (const [key, v] of rows) {console.log(`  ${String(v.missing).padStart(4)}/${String(v.total).padEnd(4)} ${key}\n         e.g. ${v.example}`);}
  if (badPages.length) {console.log(`\n${badPages.length} pages did not answer 200:`); badPages.slice(0, 30).forEach((l) => console.log('  ' + l));}
  fs.writeFileSync(path.join(os.tmpdir(), 'field-audit-check.json'), JSON.stringify({ rows, badPages }));
  if (rows.length || badPages.length) {process.exitCode = 1;}
}

// ------------------------------------------------------------------------------------------------------------- remove
if (step === 'remove') {
  const docs = await fetchDocs(staging);
  const removed = {}; // doc id -> markers that were inside removed items
  const strip = (node, doc) => {
    if (Array.isArray(node)) {
      const first = node[0];
      if (first !== undefined) {(removed[doc._id] ??= []).push(...(JSON.stringify(first).match(MARKER) ?? []));}
      return node.slice(1).map((value) => strip(value, doc));
    }
    if (node && typeof node === 'object') {
      const out = {};
      for (const [key, value] of Object.entries(node)) {out[key] = key.startsWith('_') ? value : strip(value, doc);}
      return out;
    }
    return node;
  };
  await write(docs.map((doc) => ({ ...strip(doc, doc), _id: doc._id, _type: doc._type })));
  const state = loadState();
  state.removed = removed;
  saveState(state);
  console.log(`first item of every list dropped in ${docs.length} documents (${Object.values(removed).flat().length} markers should be gone)`);
  await revalidateSite();
}

if (step === 'check-removed') {
  const { removed } = loadState();
  const docs = await fetchDocs(staging);
  const bad = [];
  const goneWrong = [];
  let pages = 0;
  await pool(docs, 4, async (doc) => {
    const urls = urlsOf(doc, docs);
    if (!urls.length) {return;}
    const found = await Promise.all(urls.map(page));
    pages += urls.length;
    found.forEach((f, i) => {if (f.status !== 200) {bad.push(`${f.status} ${urls[i]}`);}});
    for (const marker of removed[doc._id] ?? []) {
      if (found.some((f) => f.html.includes(marker))) {goneWrong.push(`${marker} still on ${urls[0]} (${doc._type}/${doc.language})`);}
    }
  });
  console.log(`${pages} pages read; ${bad.length} not 200; ${goneWrong.length} removed items still shown`);
  bad.slice(0, 40).forEach((l) => console.log('  ' + l));
  goneWrong.slice(0, 40).forEach((l) => console.log('  ' + l));
}

// -------------------------------------------------------------------------------------------------------------- clear
const REQUIRED = {
  tour: ['language', 'parent', 'path', 'title', 'category'],
  destinationPage: ['language', 'kind', 'path', 'title'],
  blogPost: ['language', 'kind', 'path', 'title'],
  blogCategory: ['language', 'kind', 'path', 'title'],
  author: ['language', 'kind', 'path', 'title'],
  staticPage: ['language', 'kind', 'path', 'title'],
  hubPage: ['language', 'kind', 'path', 'title'],
  homePage: ['language', 'kind', 'title'],
  siteSettings: ['language'],
  tourTexts: ['language'],
  teamMember: ['language', 'name', 'order'],
};
if (step === 'clear') {
  const docs = await fetchDocs(production);
  const cleared = docs.map((doc) => {
    const keep = new Set(['_id', '_type', ...(REQUIRED[doc._type] ?? [])]);
    return Object.fromEntries(Object.entries(doc).filter(([key]) => keep.has(key)));
  });
  await write(cleared);
  console.log(`${cleared.length} documents written with only their required fields`);
  await revalidateSite();
}

if (step === 'check-clear') {
  const docs = await fetchDocs(staging);
  const bad = [];
  let pages = 0;
  await pool(docs, 4, async (doc) => {
    for (const url of urlsOf(doc, docs)) {
      const found = await page(url);
      pages++;
      const h1 = (found.html.match(/<h1[\s>]/g) ?? []).length;
      if (found.status !== 200 || h1 !== 1 || /Application error|Internal Server Error/.test(found.html)) {bad.push(`${found.status} h1=${h1} ${url} (${doc._type}/${doc.language})`);}
    }
  });
  console.log(`${pages} pages read; ${bad.length} broken`);
  bad.slice(0, 60).forEach((l) => console.log('  ' + l));
}

if (!['mark', 'check', 'remove', 'check-removed', 'clear', 'check-clear'].includes(step)) {
  console.log('usage: field-audit.mjs mark|check|remove|check-removed|clear|check-clear');
}

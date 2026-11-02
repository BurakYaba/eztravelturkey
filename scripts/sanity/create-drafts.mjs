// Creates DRAFTS in the Studio (documents with an id that starts with `drafts.`), so nothing appears on the site until an editor
// publishes them. Two jobs:
//
//   node --env-file-if-exists=.env.local scripts/sanity/create-drafts.mjs landing [--write]
//       Adds the English draft introductions of data/drafts/landing-en.json to the draft of each tour listing page
//       (destinationPage). The page keeps its old Chinese section after the new ones. To be translated and revised by the editor.
//   node --env-file-if-exists=.env.local scripts/sanity/create-drafts.mjs blog [--write]
//       Creates the 12 blog post drafts the client asked for (titles only; the Chinese text is written later) and the two
//       draft categories they need (Turkey & Greece, Turkey & Egypt).
//
// Without --write it only prints what it would do. A draft that already exists is never overwritten (createIfNotExists), and the
// published documents are not touched. Take a backup first (scripts/sanity/backup.mjs). It writes only to project 91izz3mt.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const root = path.resolve(import.meta.dirname, '../..');
const job = process.argv[2];
const write = process.argv.includes('--write');
const projectId = process.env.SANITY_PROJECT_ID ?? '91izz3mt';
if (projectId === 'aj0pbi0w') {
  throw new Error('Refusing to run: aj0pbi0w is the project of magnificenttravel.com.');
}
if (!['landing', 'blog'].includes(job)) {
  throw new Error('Usage: create-drafts.mjs landing|blog [--write]');
}
const client = createClient({
  projectId,
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

let n = 0;
const key = () => `d${(n++).toString(36)}`;
const paragraph = (text) => ({ _key: key(), _type: 'paragraph', text });
const israel = (value) => /以色列|israel/i.test(JSON.stringify(value));

async function create(doc) {
  if (israel(doc)) {
    throw new Error(`${doc._id} mentions Israel; the site has no Israel content.`);
  }
  if (!write) {
    console.log(`  would create ${doc._id}`);
    return;
  }
  await client.createIfNotExists(doc);
  console.log(`  created ${doc._id} (left alone if it already existed)`);
}

if (job === 'landing') {
  const texts = JSON.parse(readFileSync(path.join(root, 'data/drafts/landing-en.json'), 'utf8'));
  for (const [pagePath, text] of Object.entries(texts)) {
    const page = await client.fetch('*[_type == "destinationPage" && language == "zh" && path == $path][0]', { path: pagePath });
    if (!page) {
      throw new Error(`No published page at ${pagePath}`);
    }
    // An editor may already have a draft of the page (for example with FAQs). It is never replaced: only the new sections are put
    // in front of its own sections, guarded by its revision, and everything else in it stays. Done once (the glance heading marks it).
    const draftId = `drafts.${page._id}`;
    const existing = await client.getDocument(draftId);
    if (existing && (existing.sections ?? []).some((s) => s.heading === text.glanceTitle)) {
      console.log(`${pagePath}: the draft already has the new sections, left alone`);
      continue;
    }
    const base = existing ? (existing.sections ?? []) : (page.sections ?? []);
    const sections = [
      { _key: key(), _type: 'section', level: 0, blocks: [...text.intro.map(paragraph)] },
      {
        _key: key(),
        _type: 'section',
        level: 2,
        heading: text.glanceTitle,
        blocks: [
          {
            _key: key(),
            _type: 'table',
            rows: [['Feature', 'Details'], ...text.glance].map((cells) => ({ _key: key(), _type: 'tableRow', cells })),
          },
        ],
      },
      ...text.sections.map((s) => ({
        _key: key(),
        _type: 'section',
        level: s.level,
        heading: s.h,
        blocks: s.blocks.map((b) =>
          typeof b === 'string' ? paragraph(b) : { _key: key(), _type: 'list', ordered: false, items: b.list },
        ),
      })),
      ...base,
    ];
    console.log(`${pagePath}: ${text.sections.length + 2} new sections in front of ${base.length} old${existing ? ' (existing draft)' : ''}`);
    if (existing) {
      if (israel(sections)) {
        throw new Error(`${draftId} would mention Israel.`);
      }
      if (write) {
        await client.patch(draftId).ifRevisionId(existing._rev).set({ sections }).commit();
        console.log(`  updated the sections of ${draftId}; its other fields were not touched`);
      } else {
        console.log(`  would update the sections of ${draftId}`);
      }
      continue;
    }
    const { _rev, _createdAt, _updatedAt, ...rest } = page;
    await create({ ...rest, _id: draftId, sections });
  }
}

if (job === 'blog') {
  const categories = {
    'turkey-greece': { title: '土耳其與希臘旅遊資訊', intro: '土耳其與希臘雙國旅遊的路線、天數與實用資訊。' },
    'turkey-egypt': { title: '土耳其與埃及旅遊資訊', intro: '土耳其與埃及雙國旅遊的路線、天數與實用資訊。' },
  };
  const posts = [
    ['turkey', 'how-many-days-do-you-need-in-turkey', 'How Many Days Do You Need in Turkey? 7, 10 and 14-Day Itineraries'],
    ['turkey', 'best-time-to-visit-turkey', 'Best Time to Visit Turkey: Weather, Seasons and Travel Tips'],
    ['greece', 'how-many-days-do-you-need-in-greece', 'How Many Days Do You Need in Greece? 7, 10 and 14-Day Itineraries'],
    ['greece', 'best-time-to-visit-greece', 'Best Time to Visit Greece: Weather, Islands and Travel Seasons'],
    ['egypt', 'how-many-days-do-you-need-in-egypt', 'How Many Days Do You Need in Egypt? 7, 10 and 14-Day Itineraries'],
    ['egypt', 'best-time-to-visit-egypt', 'Best Time to Visit Egypt: Weather, Nile Cruises and Travel Seasons'],
    ['jordan', 'how-many-days-do-you-need-in-jordan', 'How Many Days Do You Need in Jordan? 5, 7 and 10-Day Itineraries'],
    ['jordan', 'best-time-to-visit-jordan', 'Best Time to Visit Jordan: Weather, Petra and Wadi Rum'],
    ['turkey-greece', 'how-many-days-do-you-need-for-turkey-and-greece', 'How Many Days Do You Need for Turkey and Greece? 10, 14 and 16-Day Itineraries'],
    ['turkey-greece', 'turkey-and-greece-in-one-trip', 'Turkey and Greece in One Trip: The Best Route from Istanbul to the Greek Islands'],
    ['turkey-egypt', 'how-many-days-do-you-need-for-turkey-and-egypt', 'How Many Days Do You Need for Turkey and Egypt? 10, 14 and 16-Day Itineraries'],
    ['turkey-egypt', 'turkey-and-egypt-in-one-trip', 'Turkey and Egypt in One Trip: How to Combine Istanbul, Cappadocia, Cairo and a Nile Cruise'],
  ];
  for (const [folder, c] of Object.entries(categories)) {
    console.log(`category blog/${folder}`);
    await create({
      _id: `drafts.blogcategory-zh-blog-${folder}`,
      _type: 'blogCategory',
      kind: 'blog-category',
      language: 'zh',
      title: c.title,
      path: `blog/${folder}`,
      metaDescription: c.intro,
      sections: [{ _key: key(), _type: 'section', level: 0, blocks: [paragraph(c.intro)] }],
      faqs: [],
    });
  }
  for (const [folder, slug, title] of posts) {
    console.log(`post blog/${folder}/${slug}`);
    await create({
      _id: `drafts.blogpost-zh-draft-${slug}`,
      _type: 'blogPost',
      kind: 'blog-post',
      language: 'zh',
      title,
      path: `blog/${folder}/${slug}`,
      sections: [],
      faqs: [],
    });
  }
}
console.log(write ? 'Done.' : 'Dry run: nothing was written. Add --write to create the drafts.');

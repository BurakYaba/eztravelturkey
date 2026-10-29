// Creates the "Site ayarları" and "Ortak tur metinleri" documents of the site's one language (zh) from the values built into the
// site (src/data/site.ts and src/data/policies.ts), so the editors find the current texts in the Studio and only have to change
// them. A document that already exists is left alone (createIfNotExists): editors' changes are never overwritten.
//
//   node --env-file-if-exists=.env.local scripts/sanity/seed-settings.mjs            (SANITY_DATASET picks the dataset, default production)
//   node --env-file-if-exists=.env.local scripts/sanity/seed-settings.mjs --dry
import { createClient } from '@sanity/client';
import { policies } from '../../src/data/policies.ts';
import { site } from '../../src/data/site.ts';

const dry = process.argv.includes('--dry');
const projectId = process.env.SANITY_PROJECT_ID ?? '91izz3mt';
if (projectId === 'aj0pbi0w') {
  throw new Error('Refusing to run: aj0pbi0w is the project of magnificenttravel.com.');
}
const client = createClient({
  projectId,
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const key = (i) => `k${i.toString(36)}`;
const language = 'zh';
const p = policies[language];
const docs = [
  {
    _id: `siteSettings-${language}`,
    _type: 'siteSettings',
    language,
    phone: site.phone,
    whatsapp: site.whatsapp,
    email: site.email,
    street: site.address.street,
    district: site.address.district,
    city: site.address.city,
    postalCode: site.address.postalCode,
    country: site.address.country,
    facebook: site.social.facebook,
    instagram: site.social.instagram,
    x: site.social.x,
    otherLinks: site.otherLinks.map((l, i) => ({ _key: key(i), _type: 'link', label: l.label, url: l.url })),
    tripadvisor: site.tripadvisorUrl,
    founded: site.founded,
    licenseNo: site.licenseNo,
    rating: site.stats.rating,
    reviewCount: site.stats.reviews,
    travelers: site.stats.travelers,
    tours: site.stats.tours,
  },
  {
    _id: `tourTexts-${language}`,
    _type: 'tourTexts',
    language,
    paymentSteps: p.payment.map((s, i) => ({ _key: key(i), _type: 'step', label: s.label, value: s.value, text: s.text })),
    rules: p.rules.map((r, i) => ({ _key: key(i), _type: 'rule', kind: r.kind, title: r.title, text: r.text })),
  },
];

if (dry) {
  console.log(`${docs.length} documents would be created if missing:`, docs.map((d) => d._id).join(', '));
  console.log(JSON.stringify(docs[0], null, 1));
} else {
  const tx = client.transaction();
  for (const doc of docs) tx.createIfNotExists(doc);
  await tx.commit();
  console.log(`done (${client.config().dataset}):`, docs.map((d) => d._id).join(', '));
}

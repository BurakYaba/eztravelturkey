// Creates the "Site ayarları" and "Ortak tur metinleri" documents of every language from the values built into the site
// (src/data/site.ts and src/data/policies.ts), so the editors find the current texts in the Studio and only have to change them.
// A document that already exists is left alone (createIfNotExists): editors' changes are never overwritten.
//
//   node --env-file-if-exists=.env.local scripts/sanity/seed-settings.mjs            (SANITY_DATASET picks the dataset, default production)
//   node --env-file-if-exists=.env.local scripts/sanity/seed-settings.mjs --dry
import { createClient } from '@sanity/client';
import { policies } from '../../src/data/policies.ts';
import { site } from '../../src/data/site.ts';

const dry = process.argv.includes('--dry');
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w',
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const key = (i) => `k${i.toString(36)}`;
const docs = [];
for (const language of ['en', 'cn', 'jp']) {
  // English carries the values of the site; the other languages start empty and take English's until an editor writes their own.
  docs.push({
    _id: `siteSettings-${language}`,
    _type: 'siteSettings',
    language,
    ...(language === 'en'
      ? {
          phone: site.phone,
          whatsapp: site.whatsapp,
          street: site.address.street,
          district: site.address.district,
          city: site.address.city,
          postalCode: site.address.postalCode,
          country: site.address.country,
          facebook: site.social.facebook,
          instagram: site.social.instagram,
          linkedin: site.social.linkedin,
          tripadvisor: site.tripadvisorUrl,
          founded: site.founded,
          licenseNo: site.licenseNo,
          rating: site.stats.rating,
          reviewCount: site.stats.reviews,
          travelers: site.stats.travelers,
          tours: site.stats.tours,
        }
      : {}),
  });
  const p = policies[language];
  docs.push({
    _id: `tourTexts-${language}`,
    _type: 'tourTexts',
    language,
    paymentSteps: p.payment.map((s, i) => ({ _key: key(i), _type: 'step', label: s.label, value: s.value, text: s.text })),
    rules: p.rules.map((r, i) => ({ _key: key(i), _type: 'rule', kind: r.kind, title: r.title, text: r.text })),
  });
}

if (dry) {
  console.log(`${docs.length} documents would be created if missing:`, docs.map((d) => d._id).join(', '));
} else {
  const tx = client.transaction();
  for (const doc of docs) tx.createIfNotExists(doc);
  await tx.commit();
  console.log(`done (${client.config().dataset}):`, docs.map((d) => d._id).join(', '));
}

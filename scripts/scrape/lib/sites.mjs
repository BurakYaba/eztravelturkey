// The three old websites that are being merged into the new site.
export const sites = {
  en: {
    id: 'en',
    host: 'www.magnificenttravel.com',
    origin: 'https://www.magnificenttravel.com',
    sitemap: 'https://www.magnificenttravel.com/en/sitemap/',
    locales: ['en'],
  },
  zh: {
    id: 'zh',
    host: 'www.eztravelturkey.com',
    origin: 'https://www.eztravelturkey.com',
    sitemap: 'https://www.eztravelturkey.com/sitemap.php',
    locales: ['zh', 'cn'],
  },
  jp: {
    id: 'jp',
    host: 'www.torukoryoko.com',
    origin: 'https://www.torukoryoko.com',
    sitemap: 'https://www.torukoryoko.com/sitemap.php',
    locales: ['jp'],
  },
};

// Pages the sitemap does not list but the site links to (found while auditing, see docs/project-plan.md Ek I).
export const extraSeeds = {
  en: [
    '/en/gdpr/privacy-policy/',
    '/en/gdpr/terms-conditions/',
    '/en/gdpr/mesafeli-satis-sozlesmesi/',
    '/en/videos/',
    '/en/authors/kenan-ungur/',
  ],
  zh: [],
  jp: [],
};

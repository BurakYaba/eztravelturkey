import type { NextConfig } from 'next';

// Redirects from the previous website's URLs, so existing links and search rankings carry over.
const legacy = [
  ['/en', '/'],
  ['/en/destinations/turkey-tours', '/destinations/turkey'],
  ['/en/destinations/greece-tours', '/destinations/greece'],
  ['/en/destinations/egypt-tours', '/destinations/egypt'],
  ['/en/destinations/jordan-tours', '/destinations/jordan'],
  ['/en/destinations/morocco-tours', '/destinations/morocco'],
  ['/en/destinations/israel-tours', '/destinations'],
  ['/en/destinations/turkey-greece-tours', '/multi-country-tours/turkey-and-greece'],
  ['/en/destinations/turkey-and-egypt-tours', '/multi-country-tours/turkey-and-egypt'],
  ['/en/destinations/turkey-and-jordan-tours', '/multi-country-tours/turkey-and-jordan'],
  ['/en/destinations/greece-and-egypt-tours', '/multi-country-tours/greece-and-egypt'],
  ['/en/destinations/turkey-greece-and-egypt-tours', '/multi-country-tours/turkey-greece-egypt-and-jordan'],
  ['/en/destinations/greece-and-jordan-tours', '/multi-country-tours/greece-and-jordan'],
  ['/en/destinations/egypt-jordan-and-israel-tours', '/multi-country-tours'],
  [
    '/en/destinations/turkey-tours/06-to-09-days-tours/8-day-istanbul-cappadocia-ephesus-and-pamukkale-tour',
    '/tours/8-day-turkey-express-istanbul-to-ephesus',
  ],
  [
    '/en/destinations/turkey-tours/03-to-05-days-tours/4-day-cappadocia-pamukkale-and-ephesus-tour',
    '/tours/4-day-turkey-express-three-iconic-regions',
  ],
  [
    '/en/destinations/greece-tours/greece-travel-packages/8-days-best-of-greece-tour',
    '/tours/8-day-best-of-greece-athens-mykonos-santorini',
  ],
  ['/en/destinations/egypt-tours/8-day-best-of-egypt-tour', '/tours/8-day-best-of-egypt-cairo-nile-abu-simbel'],
  [
    '/en/destinations/greece-tours/greece-cruise-packages/11-days-greece-cruise-package',
    '/tours/11-day-cyclades-cruise-and-island-journey',
  ],
  ['/en/destinations/jordan-tours/7-days-jordan-tour', '/tours/7-day-classic-jordan-petra-wadi-rum-dead-sea'],
  ['/en/destinations', '/destinations'],
  ['/en/about', '/about'],
  ['/en/faq', '/faq'],
  ['/en/contact', '/contact'],
  ['/en/blog', '/travel-hub'],
  ['/en/videos', '/'],
  ['/en/gdpr/privacy-policy', '/privacy-policy'],
  ['/en/gdpr/terms-conditions', '/terms-conditions'],
] as const;

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75, 85],
  },
  async redirects() {
    return [
      ...legacy.map(([from, to]) => ({ source: from, destination: to, permanent: true })),
      // Anything else under /en keeps working by dropping the prefix.
      { source: '/en/:path*', destination: '/:path*', permanent: true },
    ];
  },
};

export default nextConfig;

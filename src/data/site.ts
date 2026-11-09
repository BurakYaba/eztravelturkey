export const site = {
  name: 'Eztravel Turkey',
  legalName: 'Macera Tur Turizm Seyahat Acentası Ltd.',
  tagline: '自 1997 年起的客製化旅程',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.eztravelturkey.com',
  licenseNo: '3217',
  founded: 1997,
  phone: '+90 (212) 458 65 65',
  phoneHref: 'tel:+902124586565',
  whatsapp: '+90 (532) 493 51 98',
  whatsappNumber: '905324935198',
  // The mailbox of the site (owner opens it at Hostinger); the Studio's site settings can override it.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'service@eztravelturkey.com',
  address: {
    // The address of the Google Business Profile (the client's decision, 2026-10-27): Küçük Ayasofya, Gelinlik Sokağı No:3 / A, 34122 Fatih/İstanbul.
    street: 'Küçük Ayasofya, Gelinlik Sokağı No:3 / A',
    district: 'Fatih',
    city: 'İstanbul',
    postalCode: '34122',
    country: 'Turkey',
  },
  // The accounts of the old eztravelturkey.com (the owner's decision, 2026-10-29), not those of magnificenttravel.com. No LinkedIn.
  social: {
    facebook: 'https://www.facebook.com/easytravelturkey',
    linkedin: '',
    instagram: 'https://instagram.com/eztravelturkey',
    x: 'https://twitter.com/Eztravelturkey',
  },
  otherLinks: [{ label: '微博', url: 'https://weibo.com/3014513713' }],
  tripadvisorUrl:
    'https://www.tripadvisor.com/Attraction_Review-g293974-d5617607-Reviews-Magnificent_Travel_Private_day_tours-Istanbul.html',
  tursabUrl: 'https://www.tursab.org.tr/tr/ddsv',
  stats: {
    rating: '5.0',
    reviews: 187,
    travelers: '35,000+',
    tours: '2,500+',
    years: new Date().getFullYear() - 1997,
  },
} as const;

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

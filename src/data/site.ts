export const site = {
  name: 'Magnificent Travel',
  legalName: 'Macera Tur Turizm Seyahat Acentası Ltd.',
  tagline: 'Tailor-made journeys since 1997',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.magnificenttravel.com',
  licenseNo: '3217',
  founded: 1997,
  phone: '+90 (212) 458 65 65',
  phoneHref: 'tel:+902124586565',
  whatsapp: '+90 (532) 493 51 98',
  whatsappNumber: '905324935198',
  // The live site hides its address behind an email obfuscator. Set NEXT_PUBLIC_CONTACT_EMAIL to show one.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '',
  address: {
    street: 'Küçükayasofya Mah. Gelinlik Sok. No:1/3',
    district: 'Sultanahmet, Fatih',
    city: 'Istanbul',
    postalCode: '34122',
    country: 'Turkey',
  },
  social: {
    facebook: 'https://www.facebook.com/Magnificenttravel',
    linkedin: 'https://www.linkedin.com/company/magnificent-travel-tours/',
    instagram: 'https://instagram.com/magnificenttourism',
  },
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

export const nav = {
  primary: [
    { label: 'Multi-Country Tours', href: '/multi-country-tours' },
    { label: 'About', href: '/about' },
    { label: 'Travel Guides', href: '/travel-hub' },
    { label: 'Contact', href: '/contact' },
  ],
  styles: [
    { label: 'Private Tours', href: '/private-tours', note: 'Your interests, your pace' },
    { label: 'Small Group Tours', href: '/small-group-tours', note: 'Like-minded explorers' },
  ],
} as const;

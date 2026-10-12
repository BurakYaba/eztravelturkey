import type { Metadata } from 'next';
import { site } from '@/data/site';
import { img, type ImageId } from '@/data/images';
import { defaultLocale, hasLocale, htmlLang, locales, type Locale } from '@/i18n/config';
import { localePath } from '@/i18n/paths';

/** Absolute URL of a path that already carries its language prefix, for example `/en/tours/`. */
export const absoluteUrl = (path = '/') => `${site.url}${path.startsWith('/') ? path : `/${path}`}`;

const ogLocale: Record<Locale, string> = { en: 'en_US', zh: 'zh_TW', jp: 'ja_JP' };

type MetaInput = {
  title: string;
  description: string;
  /** Path without the language prefix, for example `/tours/some-tour`. */
  path: string;
  lang?: Locale;
  image?: ImageId;
  type?: 'website' | 'article';
};

export function buildMetadata({
  title,
  description,
  path,
  lang = defaultLocale,
  image = 'hero-istanbul',
  type = 'website',
}: MetaInput): Metadata {
  const picture = img(image);
  const full = localePath(lang, path);
  const isHome = path === '/';
  const fullTitle = isHome ? title : `${title} | ${site.name}`;
  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical: full },
    openGraph: {
      type,
      siteName: site.name,
      locale: ogLocale[lang],
      title: fullTitle,
      description,
      url: absoluteUrl(full),
      images: [{ url: absoluteUrl(picture.src), width: picture.width, height: picture.height, alt: picture.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteUrl(picture.src)],
    },
  };
}

/** `generateMetadata` for a static page: reads the language from the route and builds the metadata for it. */
export const localizedMetadata =
  (input: Omit<MetaInput, 'lang'>) =>
  async ({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> => {
    const { lang } = await params;
    return buildMetadata({ ...input, lang: hasLocale(lang) ? lang : defaultLocale });
  };

const organizationRef = { '@id': `${site.url}/#organization` };
const websiteId = (lang: Locale) => `${site.url}/${lang}/#website`;

export const travelAgencyJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  '@id': `${site.url}/#organization`,
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: absoluteUrl('/mtlogo.png'),
  image: absoluteUrl(img('hero-istanbul').src),
  description: `Licensed Turkish tour operator (License No. ${site.licenseNo}) organizing private, small group and multi-country tours across Turkey, Greece, Egypt, Jordan and Morocco since ${site.founded}.`,
  foundingDate: String(site.founded),
  telephone: site.phone,
  ...(site.email ? { email: site.email } : {}),
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${site.address.street}, ${site.address.district}`,
    addressLocality: site.address.city,
    postalCode: site.address.postalCode,
    addressCountry: 'TR',
  },
  areaServed: ['Turkey', 'Greece', 'Egypt', 'Jordan', 'Morocco'],
  sameAs: [site.social.facebook, site.social.linkedin, site.social.instagram, site.tripadvisorUrl],
});

export const websiteJsonLd = (lang: Locale) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': websiteId(lang),
  url: absoluteUrl(`/${lang}/`),
  name: site.name,
  inLanguage: htmlLang[lang],
  publisher: organizationRef,
});

export const webPageJsonLd = (lang: Locale, name: string, path: string, type = 'WebPage', description?: string) => ({
  '@context': 'https://schema.org',
  '@type': type,
  name,
  url: absoluteUrl(localePath(lang, path)),
  inLanguage: htmlLang[lang],
  ...(description ? { description } : {}),
  isPartOf: { '@id': websiteId(lang) },
  about: organizationRef,
});

export const breadcrumbJsonLd = (lang: Locale, items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: absoluteUrl(localePath(lang, item.path)),
  })),
});

export const itemListJsonLd = (lang: Locale, name: string, items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    url: absoluteUrl(localePath(lang, item.path)),
  })),
});

export const collectionPageJsonLd = (lang: Locale, name: string, path: string, description: string) =>
  webPageJsonLd(lang, name, path, 'CollectionPage', description);

type TripInput = {
  lang: Locale;
  name: string;
  description: string;
  path: string;
  image: ImageId;
  priceEUR: number;
  stops: string[];
};

export const touristTripJsonLd = ({ lang, name, description, path, image, priceEUR, stops }: TripInput) => {
  const url = absoluteUrl(localePath(lang, path));
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name,
    description,
    url,
    image: absoluteUrl(img(image).src),
    touristType: 'Cultural tourism',
    provider: organizationRef,
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: stops.length,
      itemListElement: stops.map((stop, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Place', name: stop },
      })),
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EUR',
      price: String(priceEUR),
      description: 'Starting price per person, taxes included. Final price depends on dates, hotels and group size.',
      seller: organizationRef,
    },
  };
};

type ArticleInput = {
  lang: Locale;
  title: string;
  description: string;
  path: string;
  image: ImageId;
  date: string;
};

export const blogPostingJsonLd = ({ lang, title, description, path, image, date }: ArticleInput) => {
  const url = absoluteUrl(localePath(lang, path));
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    image: absoluteUrl(img(image).src),
    datePublished: date,
    dateModified: date,
    inLanguage: htmlLang[lang],
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: organizationRef,
    mainEntityOfPage: url,
  };
};

/** All language versions of a path, for hreflang. Pages that exist in only some languages pass `only`. */
export function languageAlternates(path: string, only: readonly Locale[] = locales): Record<string, string> {
  const entries = only.map((lang) => [htmlLang[lang], absoluteUrl(localePath(lang, path))] as const);
  return Object.fromEntries([...entries, ['x-default', absoluteUrl(localePath(defaultLocale, path))]]);
}

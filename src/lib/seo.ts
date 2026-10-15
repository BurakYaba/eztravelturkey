import type { Metadata } from 'next';
import { site } from '@/data/site';
import { img, type ImageId } from '@/data/images';
import { defaultLocale, hasLocale, htmlLang, locales, type Locale } from '@/i18n/config';
import type { ImageRef } from '@/lib/data/types';
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
  /** Language whose address is the canonical one. Pages that only stand in for another language's text point there. */
  canonicalLang?: Locale;
  /** Languages that really have this page; hreflang is written only when there are at least two. */
  alternateLangs?: readonly Locale[];
  image?: ImageId;
  /** A scraped picture; wins over `image`. */
  picture?: ImageRef | null;
  type?: 'website' | 'article';
  /** Keep the title exactly as given instead of adding the site name. */
  absoluteTitle?: boolean;
  /** Keep the page out of search results (site search, previews). */
  noindex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  lang = defaultLocale,
  canonicalLang,
  alternateLangs = [],
  image = 'hero-istanbul',
  picture: scraped,
  type = 'website',
  absoluteTitle = false,
  noindex = false,
}: MetaInput): Metadata {
  const picture = scraped ?? img(image);
  const full = localePath(canonicalLang ?? lang, path);
  const isHome = path === '/';
  const fullTitle = isHome || absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: isHome || absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: full,
      ...(alternateLangs.length >= 2 ? { languages: languageAlternates(path, alternateLangs) } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
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
  /** Absolute or site-relative address of the main picture. */
  imageUrl: string;
  /** Starting prices the client entered (D40); each one becomes its own Offer. */
  priceEUR: number | null;
  priceUSD: number | null;
  stops: string[];
};

export const touristTripJsonLd = ({ lang, name, description, path, imageUrl, priceEUR, priceUSD, stops }: TripInput) => {
  const url = absoluteUrl(localePath(lang, path));
  const offers = (
    [
      ['EUR', priceEUR],
      ['USD', priceUSD],
    ] as const
  )
    .filter((entry): entry is readonly ['EUR' | 'USD', number] => entry[1] !== null)
    .map(([currency, price]) => ({
      '@type': 'Offer',
      url,
      priceCurrency: currency,
      price: String(price),
      description: 'Starting price per person. Final price depends on dates, hotels and group size.',
      availability: 'https://schema.org/InStock',
      seller: organizationRef,
    }));
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name,
    description,
    url,
    inLanguage: htmlLang[lang],
    image: absoluteUrl(imageUrl),
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
    ...(offers.length === 0 ? {} : { offers }),
  };
};

export const faqJsonLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});

type ArticleInput = {
  lang: Locale;
  title: string;
  description: string;
  path: string;
  imageUrl: string;
  date: string | null;
};

export const blogPostingJsonLd = ({ lang, title, description, path, imageUrl, date }: ArticleInput) => {
  const url = absoluteUrl(localePath(lang, path));
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    image: absoluteUrl(imageUrl),
    ...(date ? { datePublished: date, dateModified: date } : {}),
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

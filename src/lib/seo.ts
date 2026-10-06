import type { Metadata } from 'next';
import { site } from '@/data/site';
import { img, type ImageId } from '@/data/images';

export const absoluteUrl = (path = '/') => `${site.url}${path.startsWith('/') ? path : `/${path}`}`;

type MetaInput = {
  title: string;
  description: string;
  path: string;
  image?: ImageId;
  type?: 'website' | 'article';
};

export function buildMetadata({
  title,
  description,
  path,
  image = 'hero-istanbul',
  type = 'website',
}: MetaInput): Metadata {
  const picture = img(image);
  const fullTitle = path === '/' ? title : `${title} | ${site.name}`;
  return {
    title: path === '/' ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: site.name,
      title: fullTitle,
      description,
      url: absoluteUrl(path),
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

const organizationRef = { '@id': `${site.url}/#organization` };

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

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  url: site.url,
  name: site.name,
  inLanguage: 'en',
  publisher: organizationRef,
});

export const webPageJsonLd = (name: string, path: string, type = 'WebPage', description?: string) => ({
  '@context': 'https://schema.org',
  '@type': type,
  name,
  url: absoluteUrl(path),
  inLanguage: 'en',
  ...(description ? { description } : {}),
  isPartOf: { '@id': `${site.url}/#website` },
  about: organizationRef,
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const itemListJsonLd = (name: string, items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    url: absoluteUrl(item.path),
  })),
});

export const collectionPageJsonLd = (name: string, path: string, description: string) =>
  webPageJsonLd(name, path, 'CollectionPage', description);

type TripInput = {
  name: string;
  description: string;
  path: string;
  image: ImageId;
  priceEUR: number;
  stops: string[];
};

export const touristTripJsonLd = ({ name, description, path, image, priceEUR, stops }: TripInput) => ({
  '@context': 'https://schema.org',
  '@type': 'TouristTrip',
  name,
  description,
  url: absoluteUrl(path),
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
    url: absoluteUrl(path),
    priceCurrency: 'EUR',
    price: String(priceEUR),
    description: 'Starting price per person, taxes included. Final price depends on dates, hotels and group size.',
    seller: organizationRef,
  },
});

type ArticleInput = {
  title: string;
  description: string;
  path: string;
  image: ImageId;
  date: string;
};

export const blogPostingJsonLd = ({ title, description, path, image, date }: ArticleInput) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description,
  url: absoluteUrl(path),
  image: absoluteUrl(img(image).src),
  datePublished: date,
  dateModified: date,
  author: { '@type': 'Organization', name: site.name, url: site.url },
  publisher: organizationRef,
  mainEntityOfPage: absoluteUrl(path),
});

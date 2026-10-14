import type { ScrapedPage } from '@/lib/schema/page.ts';
import type { ScrapedTour } from '@/lib/schema/tour.ts';
import type { CountryId, TourStyle } from '@/data/types';
import { locales, type Locale } from '@/i18n/config';
import { resolveImage } from './images';
import { hasNativeContent, storeFor } from './store';
import type { CardRecord, ImageRef, PageBlock, PageKind, PageRecord, PageSection, TourRecord } from './types';

export { hasNativeContent };
export type { CardRecord, ImageRef, PageBlock, PageKind, PageRecord, PageSection, TourRecord } from './types';

/**
 * The only door to the content. Pages ask for tours and pages here, never read `content/scraped` themselves, so the
 * move to Sanity (docs/project-plan.md P6) changes this folder and nothing else.
 */

const siteHosts = new Set(['www.magnificenttravel.com', 'magnificenttravel.com']);

/** `https://www.magnificenttravel.com/en/tours/x/` becomes `/tours/x/`; other addresses are returned as they are. */
export function internalHref(url: string): string {
  try {
    const parsed = new URL(url);
    if (!siteHosts.has(parsed.hostname)) {
      return url;
    }
    const path = parsed.pathname.replace(/^\/(en|zh|jp)(?=\/|$)/, '') || '/';
    return `${path.endsWith('/') ? path : `${path}/`}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

const countryIds: CountryId[] = ['turkey', 'greece', 'egypt', 'jordan', 'morocco'];
const countriesOf = (slug: string) => countryIds.filter((id) => slug.includes(id));

const stylesOf = (groupType: string): TourStyle[] => (/private/i.test(groupType) ? ['private'] : ['small-group']);

const bucketOf = (days: number | null) => (days === null ? null : days <= 5 ? '3-5' : days <= 9 ? '6-9' : '10+');

function durationOf(tour: ScrapedTour): { days: number | null; nights: number | null } {
  if (tour.days !== null && tour.nights !== null) {
    return { days: tour.days, nights: tour.nights };
  }
  const match = /(\d+)\s*nights?\s*\/\s*(\d+)/i.exec(tour.facts.duration);
  return match ? { nights: Number(match[1]), days: Number(match[2]) } : { days: null, nights: null };
}

const image = (ref: { src: string; width: number | null; height: number | null; alt: string } | null | undefined) =>
  ref ? resolveImage(ref) : null;

function toTour(tour: ScrapedTour, lang: Locale, fallback: boolean): TourRecord {
  const gallery = tour.gallery.map(image).filter((i): i is ImageRef => i !== null);
  const { days, nights } = durationOf(tour);
  return {
    lang,
    fallback,
    path: tour.path,
    href: `/${tour.path}/`,
    slug: tour.slug,
    parent: tour.parent,
    category: tour.category,
    title: tour.title,
    metaTitle: tour.metaTitle,
    metaDescription: tour.metaDescription,
    summary: tour.summary,
    countries: countriesOf(tour.parent),
    styles: stylesOf(tour.facts.groupType),
    days,
    nights,
    bucket: bucketOf(days),
    priceEUR: tour.price.currency === 'EUR' ? tour.price.amount : null,
    priceNote: tour.price.note,
    facts: tour.facts,
    extraFacts: Object.entries(tour.extraFacts).map(([label, value]) => ({ label, value })),
    route: tour.route,
    routeMap: { image: image(tour.routeMap.image), intro: tour.routeMap.intro },
    highlights: tour.highlights,
    itinerary: tour.itinerary,
    included: tour.included,
    excluded: tour.excluded,
    importantNotes: tour.importantNotes,
    cancellationPolicy: tour.cancellationPolicy,
    gallery,
    related: tour.related.map((r) => ({ title: r.title, href: internalHref(r.url) })),
    faqs: tour.faqs,
    image: gallery[0] ?? null,
  };
}

/** The old site's pages mention Israel in a few headings. Israel is not on the new site (D4). */
const mentionsIsrael = (text: string) => /israel/i.test(text);

function toSections(sections: ScrapedPage['sections']): PageSection[] {
  return sections
    .filter((s) => !mentionsIsrael(s.heading))
    .map((s) => ({
      level: s.level,
      heading: s.heading,
      blocks: s.blocks.flatMap((b): PageBlock[] => {
        if (b.type === 'image') {
          const resolved = resolveImage({ src: b.src, alt: b.alt });
          return resolved ? [{ type: 'image', image: resolved }] : [];
        }
        return [b];
      }),
    }));
}

function toCard(card: ScrapedPage['cards'][number]): CardRecord {
  return { title: card.title, href: internalHref(card.url), image: image(card.image), meta: card.meta, price: card.price };
}

function toPage(page: ScrapedPage, lang: Locale, fallback: boolean): PageRecord {
  const sections = toSections(page.sections);
  const firstImage = sections.flatMap((s) => s.blocks).find((b) => b.type === 'image');
  const cards = page.cards.filter((c) => !mentionsIsrael(c.title) && !mentionsIsrael(c.url)).map(toCard);
  return {
    lang,
    fallback,
    kind: page.kind as PageKind,
    path: page.path,
    href: page.path ? `/${page.path}/` : '/',
    title: page.h1,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    lastUpdated: page.lastUpdated,
    sections,
    cards,
    faqs: page.faqs,
    image: firstImage?.type === 'image' ? firstImage.image : (cards.find((c) => c.image)?.image ?? null),
  };
}

const trim = (path: string) => path.replace(/^\/+|\/+$/g, '');

// ---- tours

export function allTours(lang: Locale): TourRecord[] {
  const { store, fallback } = storeFor(lang);
  return store.tours.map((t) => toTour(t, lang, fallback));
}

export function getTour(lang: Locale, path: string): TourRecord | undefined {
  const wanted = trim(path);
  const { store, fallback } = storeFor(lang);
  const tour = store.tours.find((t) => t.path === wanted);
  return tour ? toTour(tour, lang, fallback) : undefined;
}

export const toursUnder = (lang: Locale, parent: string, category?: string | null) =>
  allTours(lang).filter((t) => t.parent === parent && (category === undefined || t.category === category));

export const toursForStyle = (lang: Locale, style: TourStyle) => allTours(lang).filter((t) => t.styles.includes(style));

// ---- pages

export function pagesOfKind(lang: Locale, kind: PageKind): PageRecord[] {
  const { store, fallback } = storeFor(lang);
  return store.pages.filter((p) => p.kind === kind).map((p) => toPage(p, lang, fallback));
}

export function getPage(lang: Locale, path: string): PageRecord | undefined {
  const wanted = trim(path);
  const { store, fallback } = storeFor(lang);
  const page = store.pages.find((p) => p.path === wanted);
  return page ? toPage(page, lang, fallback) : undefined;
}

// ---- destinations

export type DestinationMatch =
  | { type: 'country'; page: PageRecord; tours: TourRecord[]; categories: PageRecord[] }
  | { type: 'combo'; page: PageRecord; tours: TourRecord[] }
  | { type: 'category'; page: PageRecord; tours: TourRecord[]; parent: PageRecord | undefined }
  | { type: 'tour'; tour: TourRecord };

/** Works out what `/destinations/<segments>/` is: a country, a combination, a category or a tour. */
export function resolveDestination(lang: Locale, segments: string[]): DestinationMatch | null {
  const path = ['destinations', ...segments].join('/');
  const page = getPage(lang, path);
  if (page?.kind === 'country') {
    const parent = segments[0] ?? '';
    return {
      type: 'country',
      page,
      tours: toursUnder(lang, parent),
      categories: pagesOfKind(lang, 'category').filter((c) => c.path.startsWith(`destinations/${parent}/`)),
    };
  }
  if (page?.kind === 'combo') {
    return { type: 'combo', page, tours: toursUnder(lang, segments[0] ?? '') };
  }
  if (page?.kind === 'category') {
    return {
      type: 'category',
      page,
      tours: toursUnder(lang, segments[0] ?? '', segments[1] ?? null),
      parent: getPage(lang, `destinations/${segments[0]}`),
    };
  }
  const tour = getTour(lang, path);
  return tour ? { type: 'tour', tour } : null;
}

/** Every `/destinations/...` address of a language, as the segments after `destinations`. */
export function destinationParams(lang: Locale): string[][] {
  const pages = (['country', 'combo', 'category'] as const).flatMap((k) => pagesOfKind(lang, k).map((p) => p.path));
  const tours = allTours(lang).map((t) => t.path);
  return [...pages, ...tours].map((p) => p.split('/').slice(1));
}

export const countryPage = (lang: Locale, country: CountryId) => getPage(lang, `destinations/${country}-tours`);

/** The cards on the old home page: six combinations and six tours picked by the client. */
export const homeCards = (lang: Locale): CardRecord[] => getPage(lang, '')?.cards ?? [];

/** Combination pages, in the order the old home page lists them. */
export function comboPages(lang: Locale): PageRecord[] {
  const order = homeCards(lang).map((c) => trim(c.href));
  return pagesOfKind(lang, 'combo').sort((a, b) => {
    const ia = order.indexOf(a.path);
    const ib = order.indexOf(b.path);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

export function featuredTours(lang: Locale): TourRecord[] {
  return homeCards(lang)
    .map((c) => getTour(lang, c.href))
    .filter((t): t is TourRecord => t !== undefined);
}

// ---- blog

export const blogPosts = (lang: Locale) => pagesOfKind(lang, 'blog-post');
export const blogCategories = (lang: Locale) => pagesOfKind(lang, 'blog-category');
/** `blog/egypt/map-of-egypt` belongs to the `egypt` category. */
export const categoryOfPost = (post: PageRecord) => post.path.split('/')[1] ?? '';

// ---- search

export type SearchEntry = { title: string; href: string; text: string; kind: 'tour' | 'destination' | 'blog' };

/** What the on-site search looks through: tours, destination pages and blog posts. */
export function searchEntries(lang: Locale): SearchEntry[] {
  const tours = allTours(lang).map((t) => ({
    title: t.title,
    href: t.href,
    text: [t.summary, t.route.join(' '), t.facts.duration].join(' '),
    kind: 'tour' as const,
  }));
  const destinations = (['country', 'combo', 'category'] as const).flatMap((k) =>
    pagesOfKind(lang, k).map((p) => ({ title: p.title, href: p.href, text: p.metaDescription, kind: 'destination' as const })),
  );
  const posts = blogPosts(lang).map((p) => ({ title: p.title, href: p.href, text: p.metaDescription, kind: 'blog' as const }));
  return [...tours, ...destinations, ...posts];
}

// ---- languages


/** Languages that have their own version of a page (same path in their own content), for hreflang and the language switcher. */
export function languagesWithPage(path: string): Locale[] {
  const wanted = trim(path);
  return locales.filter((lang) => {
    if (!hasNativeContent(lang)) {
      return false;
    }
    const { store } = storeFor(lang);
    return store.tours.some((t) => t.path === wanted) || store.pages.some((p) => p.path === wanted);
  });
}

// ---- sitemap

/** Pages that are written in code, not scraped: the new landing pages and the hand-made about, contact and FAQ. */
const codePages = [
  '/tours',
  '/multi-country-tours',
  '/private-tours',
  '/small-group-tours',
  '/plan-my-trip',
  '/about',
  '/contact',
  '/faq',
];

/** Scraped pages that stay out of the sitemap: the search page is `noindex` and /videos/ redirects to the blog (D18). */
const notListed = new Set(['/search', '/videos']);

/** Every indexable address of a language that really has content, without the language prefix. Empty until that language has its own content. */
export function sitemapPaths(lang: Locale): string[] {
  if (!hasNativeContent(lang)) {
    return [];
  }
  const { store } = storeFor(lang);
  const scraped = [...store.pages.map((p) => p.path), ...store.tours.map((t) => t.path)].map((p) => `/${p}`);
  const paths = new Set(['/', ...codePages, ...scraped.map((p) => (p === '/' ? p : p.replace(/\/$/, '')))]);
  return [...paths].filter((p) => !notListed.has(p));
}

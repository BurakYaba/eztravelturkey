import type { CountryId, Faq, TourStyle } from '@/data/types';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import { query } from './sanity';
import type {
  CardRecord,
  ImageRef,
  PageBlock,
  PageKind,
  PageRecord,
  PageSection,
  PageSummary,
  TourCardData,
  TourRecord,
} from './types';

export type { CardRecord, ImageRef, PageBlock, PageKind, PageRecord, PageSection, PageSummary, TourCardData, TourRecord };

/**
 * The only door to the content, which lives in Sanity. Pages ask for tours and pages here and never write a query
 * themselves (docs/project-plan.md P2.5, P6.5). A language that has no content of its own yet is answered with the
 * English content and `fallback: true`, so zh and jp pages can be previewed before they are translated.
 */

const pageTypes = ['homePage', 'hubPage', 'destinationPage', 'blogPost', 'blogCategory', 'author', 'staticPage'];
const allTypes = ['tour', ...pageTypes];

/** GROQ for one image field: its CDN address, real size and alt text. */
const img = `"src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, alt`;

type RawImage = { src?: string; width?: number; height?: number; alt?: string } | null | undefined;

const image = (raw: RawImage): ImageRef | null =>
  raw?.src && raw.width && raw.height ? { src: raw.src, width: raw.width, height: raw.height, alt: raw.alt ?? '' } : null;

const countryIds: CountryId[] = ['turkey', 'greece', 'egypt', 'jordan', 'morocco'];
const countriesOf = (slug: string) => countryIds.filter((id) => slug.includes(id));
const stylesOf = (groupType: string): TourStyle[] => (/private/i.test(groupType) ? ['private'] : ['small-group']);
const bucketOf = (days: number | null) => (days === null ? null : days <= 5 ? '3-5' : days <= 9 ? '6-9' : '10+');

const trim = (path: string) => path.replace(/^\/+|\/+$/g, '');
const hrefOf = (path: string) => (path ? `/${path}/` : '/');

// ---- language

/** True when the dataset holds content written in this language. */
export function hasNativeContent(lang: Locale): Promise<boolean> {
  return query<boolean>('count(*[_type in $types && language == $lang]) > 0', { types: allTypes, lang });
}

/** The language whose documents answer a request, and whether it is the English stand-in. */
async function source(lang: Locale): Promise<{ lang: Locale; fallback: boolean }> {
  return (await hasNativeContent(lang)) ? { lang, fallback: false } : { lang: defaultLocale, fallback: true };
}

/** Languages that have their own version of a page (same path in their own content), for hreflang. */
export async function languagesWithPage(path: string): Promise<Locale[]> {
  const found = await query<string[]>('array::unique(*[_type in $types && path == $path].language)', {
    types: allTypes,
    path: trim(path),
  });
  return locales.filter((l) => found.includes(l));
}

// ---- tours

type RawTourCard = {
  path: string;
  title: string;
  summary?: string;
  parent: string;
  days?: number | null;
  nights?: number | null;
  duration?: string;
  groupType?: string;
  priceEUR?: number | null;
  route?: string[];
  image?: RawImage;
};

const tourCardFields = `path, title, summary, parent, days, nights, "duration": facts.duration, "groupType": facts.groupType, "priceEUR": select(price.currency == "EUR" => price.amount), route, "image": gallery[0]{ ${img} }`;

function toCard(raw: RawTourCard): TourCardData {
  const days = raw.days ?? null;
  return {
    href: hrefOf(raw.path),
    title: raw.title,
    summary: raw.summary ?? '',
    route: raw.route ?? [],
    duration: raw.duration ?? '',
    days,
    nights: raw.nights ?? null,
    styles: stylesOf(raw.groupType ?? ''),
    countries: countriesOf(raw.parent),
    bucket: bucketOf(days),
    priceEUR: raw.priceEUR ?? null,
    image: image(raw.image),
  };
}

export type TourFilter = { parent?: string; category?: string | null; style?: TourStyle; paths?: string[] };

/** Tour cards in path order, optionally narrowed to a country or combination folder, a category, a style or given paths. */
export async function listTours(lang: Locale, filter: TourFilter = {}): Promise<TourCardData[]> {
  const src = await source(lang);
  const conditions = ['_type == "tour"', 'language == $lang'];
  if (filter.parent) {conditions.push('parent == $parent');}
  if (filter.category === null) {conditions.push('!defined(category)');}
  else if (filter.category) {conditions.push('category == $category');}
  if (filter.style === 'private') {conditions.push('facts.groupType match "private*"');}
  if (filter.style === 'small-group') {conditions.push('!(facts.groupType match "private*")');}
  if (filter.paths) {conditions.push('path in $paths');}
  const rows = await query<RawTourCard[]>(`*[${conditions.join(' && ')}] | order(path asc){ ${tourCardFields} }`, {
    lang: src.lang,
    parent: filter.parent,
    category: filter.category,
    paths: filter.paths?.map(trim),
  });
  const cards = rows.map(toCard);
  if (!filter.paths) {return cards;}
  const order = filter.paths.map((p) => hrefOf(trim(p)));
  return cards.sort((a, b) => order.indexOf(a.href) - order.indexOf(b.href));
}

export const allTours = (lang: Locale) => listTours(lang);
export const toursUnder = (lang: Locale, parent: string, category?: string | null) =>
  listTours(lang, { parent, category });
export const toursForStyle = (lang: Locale, style: TourStyle) => listTours(lang, { style });

type RawTour = RawTourCard & {
  metaTitle?: string;
  metaDescription?: string;
  category?: string | null;
  facts?: Partial<TourRecord['facts']>;
  extraFacts?: { label: string; value: string }[];
  priceNote?: string;
  routeMap?: { intro?: string; image?: RawImage };
  highlights?: string[];
  itinerary?: TourRecord['itinerary'];
  included?: string[];
  excluded?: string[];
  importantNotes?: string[];
  cancellationPolicy?: string[];
  gallery?: RawImage[];
  related?: ({ title: string; path: string } | null)[];
  faqs?: Faq[];
};

const tourFields = `${tourCardFields}, category, metaTitle, metaDescription, facts, extraFacts[]{ label, value }, "priceNote": price.note, "routeMap": { "intro": routeMap.intro, "image": routeMap.image{ ${img} } }, highlights, itinerary[]{ dayLabel, title, text, meals }, included, excluded, importantNotes, cancellationPolicy, "gallery": gallery[]{ ${img} }, "related": related[]->{ title, path }, faqs[]{ q, a }`;

const emptyFacts: TourRecord['facts'] = {
  duration: '',
  guideLanguages: '',
  groupType: '',
  flights: '',
  startingPrice: '',
  cancellation: '',
  difficulty: '',
  season: '',
};

export async function getTour(lang: Locale, path: string): Promise<TourRecord | undefined> {
  const src = await source(lang);
  const raw = await query<RawTour | null>(`*[_type == "tour" && language == $lang && path == $path][0]{ ${tourFields} }`, {
    lang: src.lang,
    path: trim(path),
  });
  if (!raw) {
    return undefined;
  }
  const card = toCard(raw);
  const gallery = (raw.gallery ?? []).map(image).filter((i): i is ImageRef => i !== null);
  return {
    lang,
    fallback: src.fallback,
    path: raw.path,
    href: card.href,
    slug: raw.path.split('/').pop() ?? '',
    parent: raw.parent,
    category: raw.category ?? null,
    title: raw.title,
    metaTitle: raw.metaTitle ?? raw.title,
    metaDescription: raw.metaDescription ?? '',
    summary: card.summary,
    countries: card.countries,
    styles: card.styles,
    days: card.days,
    nights: card.nights,
    bucket: card.bucket,
    priceEUR: card.priceEUR,
    priceNote: raw.priceNote ?? '',
    facts: { ...emptyFacts, ...raw.facts },
    extraFacts: raw.extraFacts ?? [],
    route: card.route,
    routeMap: { image: image(raw.routeMap?.image), intro: raw.routeMap?.intro ?? '' },
    highlights: raw.highlights ?? [],
    itinerary: raw.itinerary ?? [],
    included: raw.included ?? [],
    excluded: raw.excluded ?? [],
    importantNotes: raw.importantNotes ?? [],
    cancellationPolicy: raw.cancellationPolicy ?? [],
    gallery,
    related: (raw.related ?? [])
      .filter((r): r is { title: string; path: string } => r !== null)
      .map((r) => ({ title: r.title, href: hrefOf(r.path) })),
    faqs: raw.faqs ?? [],
    image: gallery[0] ?? null,
  };
}

// ---- pages

type RawBlock = {
  _type: string;
  text?: string;
  ordered?: boolean;
  items?: string[];
  rows?: string[][];
  image?: RawImage;
};

type RawPageSummary = {
  kind: PageKind;
  path?: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  image?: RawImage;
};

type RawPage = RawPageSummary & {
  lastUpdated?: string | null;
  sections?: { level?: number; heading?: string; blocks?: RawBlock[] }[];
  cards?: { title: string; href: string; meta?: string[]; price?: string; image?: RawImage }[];
  faqs?: Faq[];
};

const summaryFields = `kind, path, title, metaTitle, metaDescription, "image": mainImage{ ${img} }`;
const pageFields = `${summaryFields}, lastUpdated, sections[]{ level, heading, blocks[]{ _type, text, ordered, items, "rows": rows[].cells, "image": image{ ${img} } } }, cards[]{ title, href, meta, price, "image": image{ ${img} } }, faqs[]{ q, a }`;

function toBlock(raw: RawBlock): PageBlock[] {
  switch (raw._type) {
    case 'paragraph':
      return [{ type: 'p', text: raw.text ?? '' }];
    case 'list':
      return [{ type: 'list', ordered: Boolean(raw.ordered), items: raw.items ?? [] }];
    case 'table':
      return [{ type: 'table', rows: raw.rows ?? [] }];
    default: {
      const picture = image(raw.image);
      return picture ? [{ type: 'image', image: picture }] : [];
    }
  }
}

function toSummary(raw: RawPageSummary, lang: Locale, fallback: boolean): PageSummary {
  const path = raw.path ?? '';
  return {
    lang,
    fallback,
    kind: raw.kind,
    path,
    href: hrefOf(path),
    title: raw.title,
    metaTitle: raw.metaTitle ?? raw.title,
    metaDescription: raw.metaDescription ?? '',
    image: image(raw.image),
  };
}

function toPage(raw: RawPage, lang: Locale, fallback: boolean): PageRecord {
  const sections: PageSection[] = (raw.sections ?? []).map((s) => ({
    level: s.level ?? 2,
    heading: s.heading ?? '',
    blocks: (s.blocks ?? []).flatMap(toBlock),
  }));
  const cards: CardRecord[] = (raw.cards ?? []).map((c) => ({
    title: c.title,
    href: c.href,
    image: image(c.image),
    meta: c.meta ?? [],
    price: c.price ?? '',
  }));
  const summary = toSummary(raw, lang, fallback);
  const firstImage = sections.flatMap((s) => s.blocks).find((b) => b.type === 'image');
  return {
    ...summary,
    lastUpdated: raw.lastUpdated ?? null,
    sections,
    cards,
    faqs: raw.faqs ?? [],
    image: summary.image ?? (firstImage?.type === 'image' ? firstImage.image : (cards.find((c) => c.image)?.image ?? null)),
  };
}

/** One page by its path without the language (`''` is the home page). */
export async function getPage(lang: Locale, path: string): Promise<PageRecord | undefined> {
  const src = await source(lang);
  const wanted = trim(path);
  const raw = wanted
    ? await query<RawPage | null>(`*[_type in $types && language == $lang && path == $path][0]{ ${pageFields} }`, {
        types: pageTypes,
        lang: src.lang,
        path: wanted,
      })
    : await query<RawPage | null>(`*[_type == "homePage" && language == $lang][0]{ ${pageFields} }`, { lang: src.lang });
  return raw ? toPage(raw, lang, src.fallback) : undefined;
}

/** Short records (title, address, picture) of every page of a kind, in path order, optionally under a path prefix. */
export async function pageSummaries(lang: Locale, kind: PageKind, prefix?: string): Promise<PageSummary[]> {
  const src = await source(lang);
  const rows = await query<RawPageSummary[]>(
    `*[_type in $types && language == $lang && kind == $kind${prefix ? ' && path match $prefix' : ''}] | order(path asc){ ${summaryFields} }`,
    { types: pageTypes, lang: src.lang, kind, prefix: prefix ? `${trim(prefix)}/*` : undefined },
  );
  return rows.map((r) => toSummary(r, lang, src.fallback));
}

/** Title of a page, for breadcrumbs. */
export async function pageTitle(lang: Locale, path: string): Promise<string | undefined> {
  const src = await source(lang);
  const title = await query<string | null>('*[_type in $types && language == $lang && path == $path][0].title', {
    types: pageTypes,
    lang: src.lang,
    path: trim(path),
  });
  return title ?? undefined;
}

// ---- destinations

export type DestinationMatch =
  | { type: 'country'; page: PageRecord; tours: TourCardData[]; categories: PageSummary[] }
  | { type: 'combo'; page: PageRecord; tours: TourCardData[] }
  | { type: 'category'; page: PageRecord; tours: TourCardData[]; parent: PageRecord | undefined }
  | { type: 'tour'; tour: TourRecord };

/** Works out what `/destinations/<segments>/` is: a country, a combination, a category or a tour. */
export async function resolveDestination(lang: Locale, segments: string[]): Promise<DestinationMatch | null> {
  const path = ['destinations', ...segments].join('/');
  const first = segments[0] ?? '';
  const page = await getPage(lang, path);
  if (page?.kind === 'country') {
    const [tours, categories] = await Promise.all([
      toursUnder(lang, first),
      pageSummaries(lang, 'category', `destinations/${first}`),
    ]);
    return { type: 'country', page, tours, categories };
  }
  if (page?.kind === 'combo') {
    return { type: 'combo', page, tours: await toursUnder(lang, first) };
  }
  if (page?.kind === 'category') {
    const [tours, parent] = await Promise.all([
      toursUnder(lang, first, segments[1] ?? null),
      getPage(lang, `destinations/${first}`),
    ]);
    return { type: 'category', page, tours, parent };
  }
  const tour = await getTour(lang, path);
  return tour ? { type: 'tour', tour } : null;
}

/** Every `/destinations/...` address of a language, as the segments after `destinations`. */
export async function destinationParams(lang: Locale): Promise<string[][]> {
  const src = await source(lang);
  const paths = await query<string[]>(
    '*[(_type == "destinationPage" || _type == "tour") && language == $lang && defined(path)].path',
    { lang: src.lang },
  );
  return paths.map((p) => p.split('/').slice(1));
}

// ---- home page

/** The cards the old home page showed: six combinations and six tours picked by the client. */
export async function homeCards(lang: Locale): Promise<CardRecord[]> {
  return (await getPage(lang, ''))?.cards ?? [];
}

/** One card per combination page, with the price, length and picture the old home page showed for it. */
export async function comboCards(lang: Locale): Promise<CardRecord[]> {
  const [combos, home] = await Promise.all([pageSummaries(lang, 'combo'), homeCards(lang)]);
  const known = new Map(home.map((c) => [c.href, c]));
  const order = home.map((c) => c.href);
  return combos
    .map(
      (page): CardRecord =>
        known.get(page.href) ?? { title: page.title, href: page.href, image: page.image, meta: [], price: '' },
    )
    .sort((a, b) => {
      const ia = order.indexOf(a.href);
      const ib = order.indexOf(b.href);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
}

export async function featuredTours(lang: Locale): Promise<TourCardData[]> {
  const paths = (await homeCards(lang)).map((c) => trim(c.href)).filter((p) => p.split('/').length >= 3);
  return paths.length > 0 ? listTours(lang, { paths }) : [];
}

// ---- blog

export const blogPosts = (lang: Locale) => pageSummaries(lang, 'blog-post');
export const blogCategories = (lang: Locale) => pageSummaries(lang, 'blog-category');
/** `blog/egypt/map-of-egypt` belongs to the `egypt` category. */
export const categoryOfPost = (post: { path: string }) => post.path.split('/')[1] ?? '';

// ---- search

export type SearchEntry = { title: string; href: string; text: string; kind: 'tour' | 'destination' | 'blog' };

/** What the on-site search looks through: tours, destination pages and blog posts. */
export async function searchEntries(lang: Locale): Promise<SearchEntry[]> {
  const src = await source(lang);
  const [tours, pages] = await Promise.all([
    query<{ path: string; title: string; summary?: string; route?: string[]; duration?: string }[]>(
      '*[_type == "tour" && language == $lang] | order(path asc){ path, title, summary, route, "duration": facts.duration }',
      { lang: src.lang },
    ),
    query<{ kind: PageKind; path: string; title: string; metaDescription?: string }[]>(
      '*[_type in ["destinationPage", "blogPost"] && language == $lang] | order(path asc){ kind, path, title, metaDescription }',
      { lang: src.lang },
    ),
  ]);
  return [
    ...tours.map((t) => ({
      title: t.title,
      href: hrefOf(t.path),
      text: [t.summary, (t.route ?? []).join(' '), t.duration].filter(Boolean).join(' '),
      kind: 'tour' as const,
    })),
    ...pages.map((p) => ({
      title: p.title,
      href: hrefOf(p.path),
      text: p.metaDescription ?? '',
      kind: p.kind === 'blog-post' ? ('blog' as const) : ('destination' as const),
    })),
  ];
}

// ---- sitemap

/** Pages that are written in code, not stored in the CMS: the new landing pages and the hand-made about, contact and FAQ. */
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

/** Pages in the CMS that stay out of the sitemap: the search page is `noindex` and /videos/ redirects to the blog (D18). */
const notListed = new Set(['/search', '/videos']);

/** Every indexable address of a language that really has content, without the language prefix. Empty until that language has its own content. */
export async function sitemapPaths(lang: Locale): Promise<string[]> {
  if (!(await hasNativeContent(lang))) {
    return [];
  }
  const stored = await query<string[]>('*[_type in $types && language == $lang && defined(path)].path', {
    types: allTypes,
    lang,
  });
  const paths = new Set(['/', ...codePages, ...stored.map((p) => `/${trim(p)}`)]);
  return [...paths].filter((p) => !notListed.has(p));
}

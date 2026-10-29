import type { CountryId, Faq, TourStyle } from '@/data/types';
import type { Locale } from '@/i18n/config';
import { formatDate } from '@/i18n/format';
import { cmsPath, countryFolder, publicPath } from '@/i18n/public-paths';
import { toursOfCategory } from './duration';
import { query } from './sanity';
import type {
  CardRecord,
  ImageRef,
  PageBlock,
  PageKind,
  PageRecord,
  PageSection,
  PageSummary,
  TeamMember,
  TourCardData,
  TourRecord,
} from './types';

export type {
  CardRecord,
  ImageRef,
  PageBlock,
  PageKind,
  PageRecord,
  PageSection,
  PageSummary,
  TeamMember,
  TourCardData,
  TourRecord,
};

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
/** How the Japanese site names the countries in its folders (トルコツアー, コンビネーションツアー/トルコ・ギリシャ周遊ツアー). */
const japaneseNames: Record<CountryId, string> = { turkey: 'トルコ', greece: 'ギリシャ', egypt: 'エジプト', jordan: 'ヨルダン', morocco: 'モロッコ' };
const countriesOf = (folder: string) => {
  const english = countryIds.filter((id) => folder.includes(id));
  return english.length > 0 ? english : countryIds.filter((id) => folder.includes(japaneseNames[id]));
};
const privateWords = /private|プライベート|专属|私人|包团/i;
const groupWords = /small|group|少人数|グループ|小团/i;
/**
 * The styles a tour's "Grup türü" text names. A tour offered both ways ("Small-group tour; private tour available on request.",
 * 56 English tours) has both, the one named first first, and shows "Private or small group". The old test only looked for the word
 * "private" anywhere, so those tours read "Private tour" and could not be changed to anything else by editing the text (2026-10-24).
 * Text that names neither style, or is empty, is a small-group tour.
 */
export const stylesOf = (groupType: string): TourStyle[] => {
  const privateAt = groupType.search(privateWords);
  const groupAt = groupType.search(groupWords);
  if (privateAt === -1) {return ['small-group'];}
  if (groupAt === -1) {return ['private'];}
  return privateAt < groupAt ? ['private', 'small-group'] : ['small-group', 'private'];
};
const bucketOf = (days: number | null) => (days === null ? null : days <= 5 ? '3-5' : days <= 9 ? '6-9' : '10+');

const trim = (path: string) => path.replace(/^\/+|\/+$/g, '');
const hrefOf = (path: string) => (path ? `/${path}/` : '/');

// ---- language

/** True when the dataset holds content written in this language. */
export function hasNativeContent(lang: Locale): Promise<boolean> {
  return query<boolean>('count(*[_type in $types && language == $lang]) > 0', { types: allTypes, lang });
}

/** The language whose documents answer a request. The site has one language, so there is no stand-in (`fallback` is always false). */
async function source(lang: Locale): Promise<{ lang: Locale; fallback: boolean }> {
  return { lang, fallback: false };
}

// ---- tours

type RawTourCard = {
  path: string;
  title: string;
  summary?: string;
  parent: string;
  category?: string | null;
  days?: number | null;
  nights?: number | null;
  duration?: string;
  groupType?: string;
  priceEUR?: number | null;
  priceUSD?: number | null;
  route?: string[];
  image?: RawImage;
};

const tourCardFields = `path, title, summary, parent, category, days, nights, "duration": facts.duration, "groupType": facts.groupType, "priceEUR": price.eur, "priceUSD": price.usd, route, "image": coalesce(heroImage, gallery[0]){ ${img} }`;

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
    countries: countriesOf(`${raw.parent} ${raw.category ?? ''}`),
    bucket: bucketOf(days),
    // The old site printed "From: €0" on one tour; a price of zero means no price was set.
    priceEUR: raw.priceEUR && raw.priceEUR > 0 ? raw.priceEUR : null,
    priceUSD: raw.priceUSD && raw.priceUSD > 0 ? raw.priceUSD : null,
    image: image(raw.image),
  };
}

export { toursOfCategory };

export type TourFilter = { parent?: string; category?: string | null; style?: TourStyle; paths?: string[] };

/** Tour cards in path order, optionally narrowed to a country or combination folder, a category, a style or given paths. */
export async function listTours(lang: Locale, filter: TourFilter = {}): Promise<TourCardData[]> {
  const src = await source(lang);
  const conditions = ['_type == "tour"', 'language == $lang'];
  if (filter.parent) {conditions.push('parent == $parent');}
  if (filter.category === null) {conditions.push('!defined(category)');}
  else if (filter.category) {conditions.push('category == $category');}
  if (filter.paths) {conditions.push('path in $paths');}
  const rows = await query<RawTourCard[]>(`*[${conditions.join(' && ')}] | order(path asc){ ${tourCardFields} }`, {
    lang: src.lang,
    parent: filter.parent,
    category: filter.category,
    paths: filter.paths?.map(trim),
  });
  // The style is decided by `stylesOf` (the same rule that labels the cards), not by a text search in the query.
  const cards = rows.map(toCard).filter((card) => !filter.style || card.styles.includes(filter.style));
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
  noindex?: boolean | null;
  canonical?: string | null;
  category?: string | null;
  facts?: Partial<TourRecord['facts']>;
  extraFacts?: { label: string; value: string }[];
  priceNote?: string;
  departures?: string[];
  hotels?: TourRecord['hotels'];
  routeMap?: { intro?: string; image?: RawImage };
  highlights?: string[];
  itinerary?: TourRecord['itinerary'];
  included?: string[];
  excluded?: string[];
  importantNotes?: string[];
  priceSections?: RawSection[];
  cancellationPolicy?: string[];
  gallery?: RawImage[];
  related?: ({ title: string; path: string } | null)[];
  faqs?: Faq[];
};

const tourFields = `${tourCardFields}, category, metaTitle, metaDescription, noindex, "canonical": canonicalUrl, facts, extraFacts[]{ label, value }, "priceNote": price.note, departures, hotels[]{ city, nights, name, category }, "routeMap": { "intro": routeMap.intro, "image": routeMap.image{ ${img} } }, highlights, itinerary[]{ dayLabel, title, text, meals }, included, excluded, importantNotes, "priceSections": priceSections[]{ level, heading, blocks[]{ _type, text, ordered, items, "rows": rows[].cells, "image": image{ ${img} } } }, cancellationPolicy, "gallery": gallery[]{ ${img} }, "related": related[]->{ title, path }, faqs[]{ q, a }`;

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
    path: trim(cmsPath(src.lang, path)),
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
    metaDescription: raw.metaDescription || descriptionFrom(card.summary),
    noindex: raw.noindex === true,
    canonical: raw.canonical || null,
    summary: card.summary,
    countries: card.countries,
    styles: card.styles,
    days: card.days,
    nights: card.nights,
    bucket: card.bucket,
    priceEUR: card.priceEUR,
    priceUSD: card.priceUSD,
    priceNote: raw.priceNote ?? '',
    departures: raw.departures ?? [],
    hotels: raw.hotels ?? [],
    facts: { ...emptyFacts, ...raw.facts },
    extraFacts: raw.extraFacts ?? [],
    route: card.route,
    routeMap: { image: image(raw.routeMap?.image), intro: raw.routeMap?.intro ?? '' },
    highlights: raw.highlights ?? [],
    itinerary: raw.itinerary ?? [],
    included: raw.included ?? [],
    excluded: raw.excluded ?? [],
    importantNotes: raw.importantNotes ?? [],
    priceSections: (raw.priceSections ?? []).map(toSection),
    cancellationPolicy: raw.cancellationPolicy ?? [],
    gallery,
    // The old pages sometimes list the same related tour twice; a visitor should see it once.
    related: [
      ...new Map(
        (raw.related ?? [])
          .filter((r): r is { title: string; path: string } => r !== null)
          .map((r) => [hrefOf(r.path), { title: r.title, href: hrefOf(r.path) }] as const),
      ).values(),
    ],
    faqs: raw.faqs ?? [],
    image: card.image ?? gallery[0] ?? null,
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
  noindex?: boolean | null;
  canonical?: string | null;
  image?: RawImage;
};

type RawSection = { level?: number; heading?: string; blocks?: RawBlock[] };

type RawPage = RawPageSummary & {
  lastUpdated?: string | null;
  shortAnswer?: string;
  author?: { title?: string; path?: string; image?: RawImage } | null;
  sections?: RawSection[];
  cards?: { title: string; href: string; meta?: string[]; price?: string; image?: RawImage }[];
  faqs?: Faq[];
};

const summaryFields = `kind, path, title, metaTitle, metaDescription, noindex, "canonical": canonicalUrl, "image": mainImage{ ${img} }`;
const pageFields = `${summaryFields}, lastUpdated, shortAnswer, "author": author->{ title, path, "image": mainImage{ ${img} } }, sections[]{ level, heading, blocks[]{ _type, text, ordered, items, "rows": rows[].cells, "image": image{ ${img} } } }, cards[]{ title, href, meta, price, "image": image{ ${img} } }, faqs[]{ q, a }`;

const toSection = (s: RawSection): PageSection => ({
  level: s.level ?? 2,
  heading: s.heading ?? '',
  blocks: (s.blocks ?? []).flatMap(toBlock),
});

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
    noindex: raw.noindex === true,
    canonical: raw.canonical || null,
    image: image(raw.image),
  };
}

const monthNumber: Record<string, string> = Object.fromEntries(
  ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].map(
    (m, i) => [m, String(i + 1).padStart(2, '0')],
  ),
);

/**
 * The date a page was last checked. A date typed in Studio wins. Otherwise the old posts' own "Updated: August 2026"
 * line is read, as a month (the old site never gave a day). A page with neither has no date; none is invented.
 */
function updatedOf(date: string | null, sections: PageSection[], lang: Locale): PageRecord['updated'] {
  if (date) {
    return { iso: date, label: formatDate(lang, date), inText: false };
  }
  const line = sections
    .flatMap((s) => s.blocks)
    .slice(0, 6)
    .map((b) => (b.type === 'p' ? /^Updated:\s*([A-Za-z]+)\s+(\d{4})\s*$/.exec(b.text) : null))
    .find(Boolean);
  const month = line ? monthNumber[line[1]!.toLowerCase()] : undefined;
  return line && month ? { iso: `${line[2]}-${month}`, label: `${line[1]} ${line[2]}`, inText: true } : null;
}

/**
 * The description a page gets in search results when the editor left the field empty: the start of its own text, cut at a word, so a new
 * page never goes live without one (the editor can still write a better one in the "Arama sonuçları" fields).
 */
export function descriptionFrom(text: string, max = 155): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) {
    return flat;
  }
  const cut = flat.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 80)).replace(/[,;:\-–—\s]+$/, '')}…`;
}

function toPage(raw: RawPage, lang: Locale, fallback: boolean): PageRecord {
  const sections: PageSection[] = (raw.sections ?? []).map(toSection);
  const cards: CardRecord[] = (raw.cards ?? []).map((c) => ({
    title: c.title,
    href: c.href,
    image: image(c.image),
    meta: c.meta ?? [],
    price: c.price ?? '',
  }));
  const summary = toSummary(raw, lang, fallback);
  if (!summary.metaDescription) {
    const firstText = raw.shortAnswer || sections.flatMap((s) => s.blocks).find((b) => b.type === 'p')?.text || '';
    summary.metaDescription = descriptionFrom(firstText);
  }
  const firstImage = sections.flatMap((s) => s.blocks).find((b) => b.type === 'image');
  return {
    ...summary,
    lastUpdated: raw.lastUpdated ?? null,
    updated: updatedOf(raw.lastUpdated ?? null, sections, lang),
    shortAnswer: raw.shortAnswer ?? '',
    author: raw.author?.title && raw.author.path ? { name: raw.author.title, href: hrefOf(raw.author.path), image: image(raw.author.image) } : null,
    sections,
    cards,
    faqs: raw.faqs ?? [],
    image: summary.image ?? (firstImage?.type === 'image' ? firstImage.image : (cards.find((c) => c.image)?.image ?? null)),
  };
}

/** One page by its path without the language (`''` is the home page). */
export async function getPage(lang: Locale, path: string): Promise<PageRecord | undefined> {
  const src = await source(lang);
  const wanted = trim(cmsPath(src.lang, path));
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
    { types: pageTypes, lang: src.lang, kind, prefix: prefix ? `${trim(cmsPath(src.lang, prefix))}/*` : undefined },
  );
  return rows.map((r) => toSummary(r, lang, src.fallback));
}

/** Title of a page, for breadcrumbs. */
export async function pageTitle(lang: Locale, path: string): Promise<string | undefined> {
  const src = await source(lang);
  const title = await query<string | null>('*[_type in $types && language == $lang && path == $path][0].title', {
    types: pageTypes,
    lang: src.lang,
    path: trim(cmsPath(src.lang, path)),
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
    // Shortest trips first: "3-5 days" before "10 days or more" (a plain sort by address puts "10日以上" before "3～5日間").
    const length = (c: PageSummary) => Number(/\d+/.exec(c.title)?.[0] ?? Number.MAX_SAFE_INTEGER);
    categories.sort((x, y) => length(x) - length(y));
    return { type: 'country', page, tours, categories };
  }
  if (page?.kind === 'combo') {
    return { type: 'combo', page, tours: await toursUnder(lang, first) };
  }
  if (page?.kind === 'category') {
    const [all, parent] = await Promise.all([toursUnder(lang, first), getPage(lang, `destinations/${first}`)]);
    return { type: 'category', page, tours: toursOfCategory(all, page.href), parent };
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

// ---- team

/** The people on the About and Contact pages, in the order set in Studio. */
type RawMember = Omit<TeamMember, 'profileHref' | 'photo'> & { photo: unknown; profile?: string | null };

export async function teamMembers(lang: Locale): Promise<TeamMember[]> {
  const own = await query<RawMember[]>(TEAM_QUERY, { lang });
  return own.map(({ profile, ...r }) => ({
    ...r,
    photo: image(r.photo as unknown as RawImage),
    // A team member who also has an author page links to it, so the page is reachable from the site.
    profileHref: profile ? hrefOf(profile) : null,
  }));
}

const TEAM_QUERY = `*[_type == "teamMember" && language == $lang] | order(order asc){ name, "role": coalesce(role, ""), "email": coalesce(email, ""), "hours": coalesce(hours, ""), "timezone": coalesce(timezone, ""), "photo": photo{ ${img} }, "profile": *[_type == "author" && language == ^.language && lower(title) == lower(^.name)][0].path }`;

// ---- related content

/** Country ids named in a path folder: `turkey-tours` gives turkey, `turkey-greece-tours` gives turkey and greece. */
export const countriesIn = countriesOf;

/**
 * The countries a language has a page for, in the usual order. The old Chinese site has no Morocco tours (the client removed them), so
 * its menus, tiles and filters leave Morocco out instead of linking to a page that is not there. A language that still shows English
 * stand-in pages has all five.
 */
export async function availableCountries(lang: Locale): Promise<CountryId[]> {
  const src = await source(lang);
  const paths = await query<string[]>('*[_type == "destinationPage" && kind == "country" && language == $lang].path', { lang: src.lang });
  const found = new Set(paths.flatMap((p) => countriesOf(p.split('/')[1] ?? '')));
  const ids = countryIds.filter((id) => found.has(id));
  return ids.length > 0 ? ids : countryIds;
}

/** Blog posts about the countries of a folder (a country, a combination), a few of each, newest guides first as the hub orders them. */
export async function blogsAbout(lang: Locale, folder: string, limit = 3): Promise<PageSummary[]> {
  const ids = countriesIn(folder);
  if (ids.length === 0) {
    return [];
  }
  const posts = (await blogPosts(lang)).filter((p) => p.image);
  const perCountry = Math.max(1, Math.ceil(limit / ids.length));
  return ids
    .flatMap((id) => posts.filter((p) => p.path.startsWith(`blog/${id}/`)).slice(0, perCountry))
    .slice(0, limit);
}

/** A few tours of the countries a blog post or folder is about, for the "tours in {country}" block. */
export async function toursAbout(lang: Locale, folder: string, limit = 3): Promise<TourCardData[]> {
  const ids = countriesIn(folder);
  if (ids.length !== 1) {
    return [];
  }
  const tours = (await toursUnder(lang, countryFolder(lang, ids[0]!))).filter((t) => t.image);
  return tours.slice(0, limit);
}

// ---- sitemap

/** Pages that are written in code, not stored in the CMS: the new landing pages and the hand-made about, contact and FAQ. */
const codePages = [
  '/destinations',
  '/tours',
  '/private-tours',
  '/small-group-tours',
  '/plan-my-trip',
  '/about',
  '/contact',
  '/faq',
];

/** Pages in the CMS that stay out of the sitemap: the search page is `noindex` and /videos/ redirects to the blog (D18). */
const notListed = new Set(['/search', '/videos']);

/**
 * Edits before this moment are not trusted as "last modified": the import wrote the same `_updatedAt` to every document, and
 * the audit fixes of 2026-10-19 and 2026-10-20 touched many at once. A page edited from this date on gets a real `lastmod`.
 */
const trustedEditsFrom = '2026-10-21T00:00:00Z';

export type SitemapEntry = { path: string; lastModified: string | null };

/** Every indexable address of a language that really has content, without the language prefix, with the date of its last real edit when there is one. Empty until that language has its own content. */
export async function sitemapEntries(lang: Locale): Promise<SitemapEntry[]> {
  if (!(await hasNativeContent(lang))) {
    return [];
  }
  const stored = await query<{ path: string; updatedAt: string | null }[]>(
    '*[_type in $types && language == $lang && defined(path) && noindex != true]{ path, "updatedAt": _updatedAt }',
    { types: allTypes, lang },
  );
  const entries = new Map<string, string | null>([['/', null]]);
  // Code pages are known by the code's address; some have the old site's name (/about-us).
  for (const page of codePages) {
    entries.set(publicPath(lang, page), null);
  }
  for (const { path, updatedAt } of stored) {
    entries.set(`/${trim(path)}`, updatedAt && updatedAt >= trustedEditsFrom ? updatedAt : null);
  }
  return [...entries].filter(([path]) => !notListed.has(path)).map(([path, lastModified]) => ({ path, lastModified }));
}

/** Every indexable address of a language that really has content, without the language prefix. */
export async function sitemapPaths(lang: Locale): Promise<string[]> {
  return (await sitemapEntries(lang)).map((e) => e.path);
}

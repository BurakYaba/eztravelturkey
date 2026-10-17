import type { CountryId, Faq, TourStyle } from '@/data/types';
import type { Locale } from '@/i18n/config';

/** A picture with its real size, ready for `next/image`. */
export type ImageRef = { src: string; width: number; height: number; alt: string };

/** What a tour card needs. Small on purpose: client components such as the tour browser receive a list of these. */
export type TourCardData = {
  href: string;
  title: string;
  summary: string;
  route: string[];
  duration: string;
  days: number | null;
  nights: number | null;
  styles: TourStyle[];
  countries: CountryId[];
  bucket: '3-5' | '6-9' | '10+' | null;
  /** Starting prices; the client fills in either or both (D40). */
  priceEUR: number | null;
  priceUSD: number | null;
  image: ImageRef | null;
};

type Common = {
  /** Language the visitor asked for. */
  lang: Locale;
  /** True when this language has no content of its own yet and the English page stands in (preview only, P2.11). */
  fallback: boolean;
};

export type TourRecord = Common & {
  /** Path without the language, no slashes at both ends: destinations/turkey-tours/03-to-05-days-tours/<slug>. */
  path: string;
  /** Link for `Link`: `/destinations/.../`. */
  href: string;
  slug: string;
  parent: string;
  category: string | null;
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  countries: CountryId[];
  styles: TourStyle[];
  days: number | null;
  nights: number | null;
  bucket: '3-5' | '6-9' | '10+' | null;
  priceEUR: number | null;
  priceUSD: number | null;
  priceNote: string;
  departures: string[];
  hotels: { city: string; nights: number | null; name: string; category: string }[];
  facts: {
    duration: string;
    guideLanguages: string;
    groupType: string;
    flights: string;
    startingPrice: string;
    cancellation: string;
    difficulty: string;
    season: string;
  };
  extraFacts: { label: string; value: string }[];
  route: string[];
  routeMap: { image: ImageRef | null; intro: string };
  highlights: string[];
  itinerary: { dayLabel: string; title: string; text: string; meals: string }[];
  included: string[];
  excluded: string[];
  importantNotes: string[];
  cancellationPolicy: string[];
  gallery: ImageRef[];
  related: { title: string; href: string }[];
  faqs: Faq[];
  /** Main picture: the first gallery image. */
  image: ImageRef | null;
};

export type PageKind =
  | 'home'
  | 'destinations-hub'
  | 'country'
  | 'combo'
  | 'category'
  | 'blog-hub'
  | 'blog-category'
  | 'blog-post'
  | 'author'
  | 'static';

export type PageBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'image'; image: ImageRef };

export type PageSection = { level: number; heading: string; blocks: PageBlock[] };

export type CardRecord = {
  title: string;
  href: string;
  image: ImageRef | null;
  /** Short facts printed on the old card, such as "07 Nights / 08 Days". */
  meta: string[];
  price: string;
};

/** The short record of a page: enough for a card or a list. */
export type PageSummary = Common & {
  kind: PageKind;
  path: string;
  href: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** Main picture (blog posts and listings use it as the card image). */
  image: ImageRef | null;
};

/** A person on the About and Contact pages. */
export type TeamMember = {
  name: string;
  role: string;
  email: string;
  hours: string;
  timezone: string;
  photo: ImageRef | null;
};

/** The author of a blog post, when the editor chose one. */
export type PostAuthor = { name: string; href: string; image: ImageRef | null };

export type PageRecord = PageSummary & {
  lastUpdated: string | null;
  /**
   * When the page was last checked: `iso` for search engines ("2026-08" or a full date) and `label` for people. The old
   * posts carry it as an "Updated: August 2026" line in their text (`inText`), which is left where it is.
   */
  updated: { iso: string; label: string; inText: boolean } | null;
  /** The answer in a nutshell, shown in a box before the text (blog posts). */
  shortAnswer: string;
  author: PostAuthor | null;
  sections: PageSection[];
  cards: CardRecord[];
  faqs: Faq[];
};

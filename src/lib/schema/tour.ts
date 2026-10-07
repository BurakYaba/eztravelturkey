import { z } from 'zod';

/**
 * Shape of a tour scraped from the old site and normalized to JSON (docs/project-plan.md P1.5 and P1.7).
 * Text is kept as the old site wrote it (principle 2: real tours move over unchanged). This schema is the first draft
 * of the Sanity tour type (Ek C), so field names follow the plan. Only erasable TypeScript syntax is used because the
 * scrape scripts import this file directly with Node's type stripping.
 */
export const imageRef = z.object({
  src: z.string(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  alt: z.string(),
});

export const itineraryDay = z.object({
  /** "DAY 01", "DAY 02-03" and so on, exactly as the old page labels it. */
  dayLabel: z.string(),
  title: z.string(),
  /** Paragraphs separated by a blank line, line breaks kept. */
  text: z.string(),
  /** "Lunch", "Breakfast, Lunch and Dinner"; empty when the old page lists none. */
  meals: z.string(),
});

export const faqItem = z.object({ q: z.string(), a: z.string() });

export const scrapedTour = z.object({
  locale: z.enum(['en', 'zh', 'jp']),
  sourceUrl: z.string(),
  /** Path after the locale prefix, without slashes at both ends: destinations/turkey-tours/03-to-05-days-tours/<slug>. */
  path: z.string(),
  slug: z.string(),
  /** First segment under destinations (a country such as turkey-tours or a combo such as turkey-greece-tours). */
  parent: z.string(),
  /** Duration or package folder (03-to-05-days-tours, greece-cruise-packages); null when the tour sits directly under the parent. */
  category: z.string().nullable(),
  title: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  canonical: z.string(),
  lastUpdated: z.string().nullable(),
  breadcrumb: z.array(z.string()),
  summary: z.string(),
  facts: z.object({
    duration: z.string(),
    guideLanguages: z.string(),
    groupType: z.string(),
    flights: z.string(),
    startingPrice: z.string(),
    cancellation: z.string(),
    difficulty: z.string(),
    season: z.string(),
  }),
  /** Facts the old page shows that this schema does not name yet, so nothing is dropped silently. */
  extraFacts: z.record(z.string(), z.string()),
  nights: z.number().int().nullable(),
  days: z.number().int().nullable(),
  price: z.object({
    amount: z.number().nullable(),
    currency: z.string(),
    unit: z.string(),
    note: z.string(),
    raw: z.string(),
  }),
  route: z.array(z.string()),
  routeMap: z.object({ image: imageRef.nullable(), intro: z.string() }),
  highlights: z.array(z.string()),
  itinerary: z.array(itineraryDay),
  included: z.array(z.string()),
  excluded: z.array(z.string()),
  importantNotes: z.array(z.string()),
  cancellationPolicy: z.array(z.string()),
  gallery: z.array(imageRef),
  related: z.array(z.object({ title: z.string(), url: z.string() })),
  faqs: z.array(faqItem),
  /** JSON-LD blocks found on the old page, untouched. */
  jsonLd: z.array(z.unknown()),
});

export type ScrapedTour = z.infer<typeof scrapedTour>;

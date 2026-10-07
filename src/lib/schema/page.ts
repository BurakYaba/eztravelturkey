import { z } from 'zod';
import { faqItem, imageRef } from './tour.ts';

/**
 * Shape of a non-tour page scraped from the old site (country, category, combo, hubs, blog posts, static pages).
 * The body is kept as an ordered list of sections so the long-form SEO text can be strengthened later without
 * losing what ranks today (docs/project-plan.md P1.4, principle 12). Erasable TypeScript syntax only.
 */
export const pageBlock = z.discriminatedUnion('type', [
  z.object({ type: z.literal('p'), text: z.string() }),
  z.object({ type: z.literal('list'), ordered: z.boolean(), items: z.array(z.string()) }),
  z.object({ type: z.literal('table'), rows: z.array(z.array(z.string())) }),
  z.object({ type: z.literal('image'), src: z.string(), alt: z.string() }),
]);

export const pageSection = z.object({
  /** 1 to 4, or 0 for the text that comes before the first heading. */
  level: z.number().int(),
  heading: z.string(),
  blocks: z.array(pageBlock),
});

export const tourCard = z.object({
  title: z.string(),
  url: z.string(),
  image: imageRef.nullable(),
  /** Short facts shown on the card (nights/days, cities), in the old order. */
  meta: z.array(z.string()),
  price: z.string(),
});

export const scrapedPage = z.object({
  locale: z.enum(['en', 'zh', 'jp']),
  kind: z.string(),
  sourceUrl: z.string(),
  path: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  canonical: z.string(),
  robots: z.string(),
  h1: z.string(),
  lastUpdated: z.string().nullable(),
  breadcrumb: z.array(z.string()),
  sections: z.array(pageSection),
  cards: z.array(tourCard),
  faqs: z.array(faqItem),
  jsonLd: z.array(z.unknown()),
});

export type ScrapedPage = z.infer<typeof scrapedPage>;

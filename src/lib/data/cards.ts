import type { CountryId, TourStyle } from '@/data/types';
import type { Locale } from '@/i18n/config';
import { comboPages, homeCards } from './index';
import type { CardRecord, ImageRef, TourRecord } from './types';

/** What a tour card needs. Small on purpose: client components such as the tour browser receive a list of these. */
export type TourCardData = {
  href: string;
  title: string;
  route: string[];
  duration: string;
  days: number | null;
  nights: number | null;
  styles: TourStyle[];
  countries: CountryId[];
  bucket: TourRecord['bucket'];
  priceEUR: number | null;
  image: ImageRef | null;
};

export const toCardData = (t: TourRecord): TourCardData => ({
  href: t.href,
  title: t.title,
  route: t.route,
  duration: t.facts.duration,
  days: t.days,
  nights: t.nights,
  styles: t.styles,
  countries: t.countries,
  bucket: t.bucket,
  priceEUR: t.priceEUR,
  image: t.image,
});

/** One card per combination page, using the price, length and picture the old home page showed for it. */
export function comboCards(lang: Locale): CardRecord[] {
  const known = new Map(homeCards(lang).map((c) => [c.href, c]));
  return comboPages(lang).map((page) => {
    const card = known.get(page.href);
    return card ?? { title: page.title, href: page.href, image: page.image, meta: [], price: '' };
  });
}

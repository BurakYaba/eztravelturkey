import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { BrowsableTour } from '@/components/tours/ToursBrowser';
import type { TourCardData } from '@/components/tours/TourCard';
import { durationBucket } from '@/data/tours';
import type { Tour } from '@/data/types';

export const toCardData = (t: Tour): TourCardData => ({
  slug: t.slug,
  title: t.title,
  subtitle: t.subtitle,
  route: t.route,
  days: t.days,
  nights: t.nights,
  styles: t.styles,
  fromPriceEUR: t.fromPriceEUR,
  image: t.image,
});

export const toBrowsable = (t: Tour): BrowsableTour => ({
  ...toCardData(t),
  countries: t.countries,
  bucket: durationBucket(t.days),
});

/** Route map picture for a tour: drop public/images/route-maps/<tour-slug>.(webp|png|jpg) and it shows up. */
export function getRouteMapSrc(slug: string): string | null {
  for (const ext of ['webp', 'png', 'jpg', 'jpeg']) {
    if (existsSync(join(process.cwd(), 'public', 'images', 'route-maps', `${slug}.${ext}`))) {
      return `/images/route-maps/${slug}.${ext}`;
    }
  }
  return null;
}

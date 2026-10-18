import type { Locale } from '@/i18n/config';
import type { TourCardData } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { TourCard, type TourCardText } from './TourCard';

/**
 * The tours of a list as plain cards, in the page's first HTML. The interactive list (`ToursBrowser`) reads the address bar and so
 * is drawn in the browser; this is what a search engine and a slow connection see until it takes over. The space above the cards
 * is the height of the filters, so nothing jumps when they appear.
 */
export function TourGrid({
  tours,
  lang,
  text,
  withTabs = false,
}: {
  tours: TourCardData[];
  lang: Locale;
  text: TourCardText;
  /** The browser also draws country tabs above the cards. */
  withTabs?: boolean;
}) {
  return (
    <div>
      <div className={cn('h-[14.75rem] md:h-12', withTabs && 'mb-[5.2rem]')} aria-hidden />
      <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour, i) => (
          <li key={tour.href}>
            <TourCard tour={tour} lang={lang} text={text} className="h-full" priority={i < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}

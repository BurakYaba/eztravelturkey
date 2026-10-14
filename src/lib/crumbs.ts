import type { Crumb } from '@/components/shared/Breadcrumbs';
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import { pageTitle } from '@/lib/data';

/** Breadcrumbs for a page under /destinations: Home, Destinations, country, category, then the page itself. */
export async function destinationCrumbs(lang: Locale, segments: string[], leafName: string): Promise<Crumb[]> {
  const dict = getDictionary(lang);
  const crumbs: Crumb[] = [
    { name: dict.nav.home, path: '/' },
    { name: dict.nav.destinations, path: '/destinations' },
  ];
  for (const [i, upTo] of segments.map((_, n) => segments.slice(0, n + 1)).entries()) {
    const path = `/destinations/${upTo.join('/')}`;
    const id = (upTo[0] ?? '').replace(/-tours$/, '') as keyof typeof dict.countries;
    const known = i === 0 ? dict.countries[id]?.name : undefined;
    if (i === segments.length - 1) {
      crumbs.push({ name: known ?? leafName, path });
    } else {
      crumbs.push({ name: known ?? (await pageTitle(lang, `destinations/${upTo.join('/')}`)) ?? upTo[i] ?? '', path });
    }
  }
  return crumbs;
}

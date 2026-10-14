import type { Crumb } from '@/components/shared/Breadcrumbs';
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import { getPage } from '@/lib/data';

/** Breadcrumbs for a page under /destinations: Home, Destinations, country, category, then the page itself. */
export function destinationCrumbs(lang: Locale, segments: string[], leafName: string): Crumb[] {
  const dict = getDictionary(lang);
  const crumbs: Crumb[] = [
    { name: dict.nav.home, path: '/' },
    { name: dict.nav.destinations, path: '/destinations' },
  ];
  segments.forEach((_, i) => {
    const upTo = segments.slice(0, i + 1);
    const path = `/destinations/${upTo.join('/')}`;
    const id = (upTo[0] ?? '').replace(/-tours$/, '') as keyof typeof dict.countries;
    const known = i === 0 ? dict.countries[id]?.name : undefined;
    if (i === segments.length - 1) {
      crumbs.push({ name: known ?? leafName, path });
      return;
    }
    crumbs.push({ name: known ?? getPage(lang, `destinations${upTo.length ? '/' : ''}${upTo.join('/')}`)?.title ?? upTo[i] ?? '', path });
  });
  return crumbs;
}

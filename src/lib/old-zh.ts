import redirects from '@/data/redirects-zh.json';

/**
 * Addresses of the old eztravelturkey.com that kept their `/zh/` prefix but are not pages any more: the tabs of a tour page
 * (itinerary, reviews, inclusion-rate), their misspelled twins and the old search page. Each goes to the page that holds that
 * content now (docs/project-plan.md, data/mapping/redirects-zh.csv). Built by `scripts/redirects/build-zh-lookup.mjs`;
 * used by `src/proxy.ts`.
 */

/** The same form the build script writes the keys in: every part decoded, trimmed and lowercased, without slashes at the ends. */
const normalize = (pathname: string) =>
  pathname
    .replace(/^\/zh(?=\/|$)/, '')
    .split('/')
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean)
    .join('/');

const table = redirects as Record<string, string>;

/**
 * The tab names of an old tour page, with the misspellings its own links contained (`tour-initerary`, `inclution-rate`, ...). The
 * table has only the spellings the old sitemap listed, so a tab spelled another way goes to its tour page by this rule.
 */
export const tourTabName = /^(tour-)?(itinerary|initerary|itenary|inclusions?|inclusion-rate|inclusions-rate|includes-rate|incllusion-rate|inclution-rate|reviews?)$/;

/** For every tour whose tabs the table knows, the page they go to (it has the exact capitals of the new address). */
const tourOfTabs = new Map<string, string>();
for (const [key, target] of Object.entries(table)) {
  const slash = key.lastIndexOf('/');
  if (slash > 0 && tourTabName.test(key.slice(slash + 1))) {
    tourOfTabs.set(key.slice(0, slash), target);
  }
}

/** The new path for an old `/zh/...` address that is no page any more, or `null`. */
export const oldZhRedirect = (pathname: string): string | null => {
  const key = normalize(pathname);
  if (table[key]) {
    return table[key];
  }
  // The old site served some pages under a second name: the category `10-days-or-longer` (the pages are under `10-days-or-more`)
  // and the Egypt tour as `8-egypt-cultural-trip-8-days`.
  const renamed = key
    .replace(/^destinations\/turkey-tours\/10-days-or-longer(?=\/|$)/, 'destinations/turkey-tours/10-days-or-more')
    .replace(/^destinations\/egypt-tours\/8-egypt-cultural-trip-8-days(?=\/|$)/, 'destinations/egypt-tours/egypt-cultural-trip-8-days');
  if (renamed !== key) {
    return oldZhRedirect(`/zh/${renamed}`) ?? `/zh/${renamed}/`;
  }
  const slash = key.lastIndexOf('/');
  if (slash > 0 && tourTabName.test(key.slice(slash + 1))) {
    return tourOfTabs.get(key.slice(0, slash)) ?? `/zh/${key.slice(0, slash)}/`;
  }
  // Tour groups of the old site that this site does not have: the list of Turkey tours is the nearest page.
  if (/^destinations\/turkey-tours\/(optional-tours|guaranteed-departure-turkey-group-tours)(\/|$)/.test(key)) {
    return '/zh/destinations/turkey-tours/';
  }
  return null;
};

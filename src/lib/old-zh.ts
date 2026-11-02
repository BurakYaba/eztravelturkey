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

/** The new path for an old `/zh/...` address that is no page any more, or `null`. */
export const oldZhRedirect = (pathname: string): string | null =>
  (redirects as Record<string, string>)[normalize(pathname)] ?? null;

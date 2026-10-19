import redirects from '@/data/redirects-jp.json';

/**
 * The old Japanese site, torukoryoko.com. Its addresses are redirected to this site by `proxy.ts` once the domain points
 * here (docs/project-plan.md P7.5, P10). The old Chinese site, eztravelturkey.com, is not handled here: it becomes its own
 * site (D43), which sends the Simplified Chinese addresses (`/cn/...`) to this site.
 */
export const oldJapaneseHosts = new Set(['torukoryoko.com', 'www.torukoryoko.com']);

/**
 * The same form `scripts/redirects/build-jp.mjs` writes the keys of `redirects-jp.json` in: every part of the path
 * decoded, trimmed (the old Japanese hub folder had a blank at the end) and lowercased, without slashes at the ends.
 */
export const normalizeOldPath = (pathname: string) =>
  pathname
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

/** Where an address of the old Japanese site goes on this site, or `null` for an address the old site never had. */
export const japaneseRedirect = (pathname: string): string | null =>
  (redirects as Record<string, string>)[normalizeOldPath(pathname)] ?? null;

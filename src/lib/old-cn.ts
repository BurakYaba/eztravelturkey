import redirects from '@/data/redirects-cn.json';
import { tourTabName } from '@/lib/old-zh';

/**
 * The old eztravelturkey.com also had Simplified Chinese pages under `/cn/` (230 addresses). Simplified Chinese now lives on
 * magnificenttravel.com, so each of those addresses goes there with a permanent redirect (`src/proxy.ts`). The table is built
 * by `scripts/redirects/build-cn.mjs`; the targets are checked with `scripts/redirects/check-cn.mjs`.
 */
export const simplifiedChineseSite = 'https://www.magnificenttravel.com';

/**
 * The same form `build-cn.mjs` writes the keys in: every part of the path decoded, trimmed and lowercased, without slashes at
 * the ends. The `/cn/` prefix is removed first.
 */
export const normalizeOldPath = (pathname: string) =>
  pathname
    .replace(/^\/cn(?=\/|$)/, '')
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

/** The path on magnificenttravel.com for an address of the old `/cn/` pages, or `null` for an address the old site never had. */
export const simplifiedChineseRedirect = (pathname: string): string | null => {
  const key = normalizeOldPath(pathname);
  // The old Simplified Chinese home page (`/cn/`) is not in the table.
  if (key === '') {
    return '/cn/';
  }
  // The old site had some pages under two names; the table keeps one of them.
  const names = [
    key,
    key.replace(/^destinations\/turkey-tours\/10-days-or-more(?=\/|$)/, 'destinations/turkey-tours/10-days-or-longer'),
    key.replace(/^destinations\/egypt-tours\/egypt-cultural-trip-8-days(?=\/|$)/, 'destinations/egypt-tours/8-egypt-cultural-trip-8-days'),
  ];
  const table = redirects as Record<string, string>;
  for (const name of names) {
    if (table[name]) {
      return table[name];
    }
    // A tour tab spelled in a way the table lacks goes where its tour page goes.
    const slash = name.lastIndexOf('/');
    if (slash > 0 && tourTabName.test(name.slice(slash + 1)) && table[name.slice(0, slash)]) {
      return table[name.slice(0, slash)];
    }
  }
  return null;
};

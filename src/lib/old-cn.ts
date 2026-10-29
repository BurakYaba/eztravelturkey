import redirects from '@/data/redirects-cn.json';

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
  return key === '' ? '/cn/' : ((redirects as Record<string, string>)[key] ?? null);
};

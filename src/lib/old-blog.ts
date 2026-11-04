import redirects from '@/data/redirects-blog.json';

/**
 * The old WordPress blog (eztravelturkey.com/blog/, 188 posts, Netport hosting that ends on 2026-11-12) is part of this site now:
 * `/blog/<post>/` becomes `/zh/blog/<country>/<post>/`, a WordPress category page goes to its category here, and every other
 * address of the old blog (feeds, tags, pages, search) goes to the blog hub. The tables were built by
 * `scripts/sanity/import-wp-blog.mjs`. On 2026-11-04 the 98 posts that had no ranking signal or were thin were removed (backup:
 * data/backups/blog-posts-removed-2026-11-04.ndjson); their entries left the table, so their old addresses go to the blog hub.
 * Used by `src/proxy.ts`.
 */

const decode = (segment: string) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

/** Where an address under `/blog/` goes, or `null` when the path is not an address of the old blog. */
export function oldBlogRedirect(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean).map(decode);
  if (parts[0]?.toLowerCase() !== 'blog') {
    return null;
  }
  const rest = parts.slice(1).map((p) => p.trim().toLowerCase());
  const { posts, categories } = redirects as { posts: Record<string, string>; categories: Record<string, string> };
  if (rest.length === 1 && posts[rest[0]!]) {
    return posts[rest[0]!]!;
  }
  if (rest[0] === 'category' && rest[1] && categories[rest[1]]) {
    return categories[rest[1]]!;
  }
  return '/zh/blog/';
}

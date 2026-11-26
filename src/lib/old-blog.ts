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

/**
 * The category folders of this site's blog. `/blog/<category>/` and `/blog/<category>/<post>/` are addresses of this site that
 * lack the `/zh` prefix (search engines read such paths out of the page data), not addresses of the old blog, whose posts sat
 * directly under `/blog/`. Add a folder here when a blog category is added in the Studio.
 */
const siteCategories = new Set(['egypt', 'greece', 'jordan', 'turkey', 'turkey-egypt', 'turkey-greece']);

/** Where an address under `/blog/` goes, or `null` when the path is not under `/blog/`. */
export function oldBlogRedirect(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean).map(decode);
  if (parts[0]?.toLowerCase() !== 'blog') {
    return null;
  }
  const rest = parts.slice(1).map((p) => p.trim().toLowerCase());
  const { posts, categories } = redirects as { posts: Record<string, string>; categories: Record<string, string> };
  if (rest.length <= 2 && siteCategories.has(rest[0] ?? '')) {
    return `/zh/blog/${rest.map(encodeURIComponent).join('/')}/`;
  }
  if (rest.length === 1 && posts[rest[0]!]) {
    return posts[rest[0]!]!;
  }
  if (rest[0] === 'category' && rest[1] && categories[rest[1]]) {
    return categories[rest[1]]!;
  }
  return '/zh/blog/';
}

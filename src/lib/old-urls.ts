import { createHash } from 'node:crypto';

/**
 * Redirects the editors create themselves (docs/project-plan.md P6.14, D36): a blog post lists the old addresses it
 * replaces and each becomes a permanent redirect to the post. The rules are read from Sanity when the site is built
 * (`next.config.ts`), so a change reaches the live site with the next deployment; the Studio webhook asks for one
 * (`/api/revalidate/`) when the list changed. Depends on nothing but `fetch`, because `next.config.ts` loads it.
 */

const projectId = process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w';
const dataset = process.env.SANITY_DATASET ?? 'production';

/** Vercel allows 1,024 redirects in a deployment; some are kept for the code's own rules. */
const maxRules = 900;

export type EditorRedirect = { source: string; destination: string; permanent: true };

type Row = { language: string; path: string; oldUrls?: string[] | null };

/** `https://www.x.com/EN/Blog/a/?b=1` becomes `/en/blog/a/`: what the Studio's validation also does. */
export const normalizeOldUrl = (value: string) =>
  `/${value
    .trim()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[?#].*$/, '')
    .replace(/^\/+|\/+$/g, '')}/`.toLowerCase();

/** The path pattern of `next.config` redirects treats `( ) : * ? + { }` as syntax; an old address means them literally. */
const literal = (path: string) => path.replace(/[()[\]{}:*?+]/g, '\\$&');

async function ask<T>(groq: string): Promise<T> {
  const url = `https://${projectId}.api.sanity.io/v2025-01-01/data/query/${dataset}?query=${encodeURIComponent(groq)}`;
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        return ((await response.json()) as { result: T }).result;
      }
      if (response.status < 500 && response.status !== 429) {
        throw new Error(`Sanity answered ${response.status}`);
      }
    } catch (error) {
      if (attempt >= 5) {
        throw error;
      }
    }
    if (attempt >= 5) {
      throw new Error('Sanity did not answer');
    }
    await new Promise((resolve) => setTimeout(resolve, 400 * attempt * attempt));
  }
}

/** The editors' redirects and a fingerprint of them. The fingerprint changes when any rule is added, changed or removed. */
export async function editorRedirects(): Promise<{ rules: EditorRedirect[]; hash: string }> {
  const { posts, pages } = await ask<{ posts: Row[]; pages: { language: string; path: string }[] }>(
    '{ "posts": *[_type == "blogPost" && count(oldUrls) > 0]{ language, path, oldUrls }, "pages": *[defined(path)]{ language, path } }',
  );
  const live = new Set(pages.map((p) => `/${p.language}/${p.path.replace(/^\/+|\/+$/g, '')}/`.toLowerCase()));
  const used = new Set<string>();
  const rules: EditorRedirect[] = [];
  for (const post of posts) {
    const destination = `/${post.language}/${post.path.replace(/^\/+|\/+$/g, '')}/`;
    for (const old of post.oldUrls ?? []) {
      const from = normalizeOldUrl(old);
      // A page that exists wins over a redirect, a repeated address is used once, and a post never redirects to itself.
      if (!/^\/(en|zh|jp)\/.+\/$/.test(from) || live.has(from) || used.has(from) || from === destination.toLowerCase()) {
        continue;
      }
      used.add(from);
      rules.push({ source: literal(from.replace(/\/$/, '')), destination, permanent: true });
    }
  }
  rules.sort((a, b) => a.source.localeCompare(b.source));
  const kept = rules.slice(0, maxRules);
  if (rules.length > maxRules) {
    // eslint-disable-next-line no-console
    console.warn(`Only the first ${maxRules} editor redirects are used (${rules.length} are listed).`);
  }
  return { rules: kept, hash: createHash('sha1').update(JSON.stringify(kept)).digest('hex').slice(0, 12) };
}

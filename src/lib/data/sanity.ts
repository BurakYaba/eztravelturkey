import { createClient } from '@sanity/client';

// The project id is public (it is in every picture address), so it is the default and nothing has to be set to build.
const projectId = process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w';
const dataset = process.env.SANITY_DATASET ?? 'production';

/** Read-only client. The datasets are public, so no token is needed to read published content. */
const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false, perspective: 'published' });

/** Tag every content request carries; the Sanity webhook (`/api/revalidate`) clears it when something is published. */
export const contentTag = 'content';

/**
 * One GROQ query. The answer is kept in Next's data cache under the `content` tag, so pages are built from the cache and
 * only a publish in the Studio makes the next request fetch again.
 *
 * Sanity answers 429 when more than 25 requests are in flight and sometimes 5xx for a single request. A static build asks
 * for many pages at once, so those answers are tried again a few times with a growing pause instead of failing the build.
 */
export async function query<T>(groq: string, params: Record<string, unknown> = {}): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await client.fetch<T>(groq, params, { cache: 'force-cache', next: { tags: [contentTag] } });
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode ?? 0;
      const temporary = status === 0 || status === 429 || status >= 500;
      if (!temporary || attempt >= 6) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt * attempt + Math.random() * 250));
    }
  }
}

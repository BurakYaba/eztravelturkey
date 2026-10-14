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
 */
export function query<T>(groq: string, params: Record<string, unknown> = {}): Promise<T> {
  return client.fetch<T>(groq, params, { cache: 'force-cache', next: { tags: [contentTag] } });
}

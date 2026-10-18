import { createClient } from '@sanity/client';
import { draftMode } from 'next/headers';

// The project id is public (it is in every picture address), so it is the default and nothing has to be set to build.
const projectId = process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w';
const dataset = process.env.SANITY_DATASET ?? 'production';

/** Read-only client. The datasets are public, so no token is needed to read published content. */
const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false, perspective: 'published' });

/**
 * Reads unpublished changes too, for editors in preview (Draft Mode). Needs a token with read access (Viewer is enough);
 * without it the preview shows the published content. The token stays on the server.
 */
export const previewToken = process.env.SANITY_PREVIEW_TOKEN;
const draftClient = previewToken
  ? createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false, token: previewToken, perspective: 'drafts' })
  : null;

/** The client that checks preview links (it must read the secrets the Studio writes, so it sees everything). */
export const previewClient = previewToken
  ? createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false, token: previewToken, perspective: 'raw' })
  : null;

/** True for a request made by an editor who opened the preview from the Studio. Outside a request (the build) it is false. */
async function inDraftMode(): Promise<boolean> {
  if (!draftClient) {
    return false;
  }
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

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
  const drafts = await inDraftMode();
  for (let attempt = 1; ; attempt++) {
    try {
      return drafts
        ? await draftClient!.fetch<T>(groq, params, { cache: 'no-store' })
        : await client.fetch<T>(groq, params, { cache: 'force-cache', next: { tags: [contentTag] } });
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

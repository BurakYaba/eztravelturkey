import { createClient } from '@sanity/client';
import { draftMode } from 'next/headers';

// The project id is public (it is in every picture address), so it is the default and nothing has to be set to build.
const projectId = process.env.SANITY_PROJECT_ID ?? 'aj0pbi0w';
const dataset = process.env.SANITY_DATASET ?? 'production';

/**
 * Read-only client. The datasets are public, so no token is needed to read published content.
 * It reads through Sanity's CDN: those requests are counted in the much larger CDN allowance instead of the API request allowance
 * (250k a month on the free plan), and Sanity clears the CDN when something is published. Editors' drafts never come from here
 * (see `draftClient`, which reads without the CDN).
 */
const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: true, perspective: 'published' });

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

/** The same dataset without the CDN: it answers with what was just published, at once. */
const freshClient = createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false, perspective: 'published' });

/**
 * A short text that changes whenever something is published, changed or deleted: how many documents there are and when the
 * newest was updated. Read without the CDN and kept under the `content` tag, so it is read again only after a publish.
 *
 * Why it exists: Sanity's CDN keeps answering a query it has seen with the old result for a while after a publish (measured
 * 2026-10-25: about 2 minutes, while the API itself had the new text after 1 second). The webhook cleared the site's cache at
 * once, the page was built again from the CDN's old answer, and that old text stayed until the next publish: editors published
 * and the site did not change. Every content query carries this text as a comment, so after a publish the CDN has never seen the
 * query and takes the answer from the dataset itself.
 */
async function contentVersion(): Promise<string> {
  try {
    const { n, t } = await freshClient.fetch<{ n: number; t: string | null }>(
      '{ "n": count(*), "t": *[defined(_updatedAt)] | order(_updatedAt desc)[0]._updatedAt }',
      {},
      { cache: 'force-cache', next: { tags: [contentTag] } },
    );
    return `${n}-${t ?? ''}`;
  } catch {
    // Without it the CDN is used as before (it catches up on its own); a page must not fail because of this.
    return '';
  }
}

/**
 * One GROQ query. The answer is kept in Next's data cache under the `content` tag, so pages are built from the cache and
 * only a publish in the Studio makes the next request fetch again.
 *
 * Sanity answers 429 when more than 25 requests are in flight and sometimes 5xx for a single request (a 502 lasted over a minute once, 2026-10-19). A static build asks
 * for many pages at once, so those answers are tried again a few times with a growing pause instead of failing the build.
 */
export async function query<T>(groq: string, params: Record<string, unknown> = {}): Promise<T> {
  const drafts = await inDraftMode();
  // A GROQ comment: it changes the query's address (so the CDN cannot answer from before the publish) and nothing else.
  const version = drafts ? '' : await contentVersion();
  const versioned = version ? `${groq}\n// ${version}` : groq;
  for (let attempt = 1; ; attempt++) {
    try {
      return drafts
        ? await draftClient!.fetch<T>(groq, params, { cache: 'no-store' })
        : await client.fetch<T>(versioned, params, { cache: 'force-cache', next: { tags: [contentTag] } });
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode ?? 0;
      const temporary = status === 0 || status === 429 || status >= 500;
      if (!temporary || attempt >= 8) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt * attempt + Math.random() * 400));
    }
  }
}

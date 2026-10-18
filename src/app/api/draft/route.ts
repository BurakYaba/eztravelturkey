import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { previewClient } from '@/lib/data/sanity';

/**
 * Called by the Studio's Presentation tool (docs/project-plan.md P6.5, draft preview): the Studio puts a one-time secret
 * in the dataset, only a signed-in editor can do that, and this route checks it before it turns Draft Mode on. The
 * cookie then makes the editor's browser read unpublished changes; everybody else keeps seeing the published site.
 */
export async function GET(request: Request) {
  if (!previewClient) {
    return new Response('Preview is not set up: SANITY_PREVIEW_TOKEN is missing.', { status: 501 });
  }
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(previewClient, request.url);
  if (!isValid) {
    return new Response('Invalid preview link', { status: 401 });
  }
  (await draftMode()).enable();
  // Only a path on this site: never follow a link to another address.
  redirect(redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/');
}

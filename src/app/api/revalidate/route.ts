import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { contentTag } from '@/lib/data/sanity';
import { editorRedirects } from '@/lib/old-urls';

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/**
 * Called by the Sanity webhook when someone publishes in the Studio: marks all content as stale so the next visit to a
 * page fetches the new text (docs/project-plan.md P6.5). The webhook sends the secret in the `x-revalidate-secret` header.
 */
export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret || !same(request.headers.get('x-revalidate-secret') ?? '', secret)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag(contentTag, { expire: 0 });
  return Response.json({ ok: true, revalidated: contentTag, redeploy: await redeployForRedirects() });
}

/**
 * Redirects the editors typed in blog posts are part of the deployment, not of the cached content. When the list in the
 * CMS differs from the one this deployment was built with, ask Vercel for a new deployment (a Deploy Hook, created once in
 * the Vercel project settings, address in `VERCEL_DEPLOY_HOOK_URL`). Without the hook the new redirects start with the next
 * deployment, whatever causes it. Returns what happened, for the webhook log.
 */
async function redeployForRedirects(): Promise<'not needed' | 'requested' | 'no deploy hook' | 'failed'> {
  try {
    const { hash } = await editorRedirects();
    if (hash === process.env.EDITOR_REDIRECTS_HASH) {
      return 'not needed';
    }
    const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!hook) {
      return 'no deploy hook';
    }
    return (await fetch(hook, { method: 'POST' })).ok ? 'requested' : 'failed';
  } catch {
    return 'failed';
  }
}

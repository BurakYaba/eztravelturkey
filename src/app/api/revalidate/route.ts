import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { contentTag } from '@/lib/data/sanity';

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
  return Response.json({ ok: true, revalidated: contentTag });
}

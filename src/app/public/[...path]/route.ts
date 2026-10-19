import oldImages from '@/data/old-images.json';

/**
 * The pictures of the old English site lived at `/public/thumbs/...` and `/public/uploads/...`, and Google lists them by that
 * address. Each answers a permanent redirect to the picture that replaced it on Sanity's CDN, or 404 when there is none
 * (docs/project-plan.md P7.13; the list is built by `scripts/redirects/build-images.mjs`).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = `/public/${path.map((part) => decodeURIComponent(part)).join('/')}`;
  const target = (oldImages as Record<string, string>)[key];
  return target
    ? new Response(null, { status: 301, headers: { location: target, 'cache-control': 'public, max-age=86400' } })
    : new Response('Not found', { status: 404 });
}

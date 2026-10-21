/**
 * IndexNow proves that the site owner sent a list of addresses by fetching a text file whose name is the key and whose content is
 * the same key (https://www.indexnow.org/documentation). `next.config.ts` serves `/<key>.txt` from here; the key is the
 * `INDEXNOW_KEY` environment variable. Any other name answers 404.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const expected = process.env.INDEXNOW_KEY;
  if (!expected || key !== expected) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(expected, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

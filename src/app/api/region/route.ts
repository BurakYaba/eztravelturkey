import { NextResponse } from 'next/server';

/**
 * The visitor's country, read from the header Vercel adds to every request. The cookie notice uses it to decide whether to
 * appear (src/lib/analytics/consent.ts). Never cached: the answer is different for every visitor. Outside production the
 * country can be set with `?country=DE` to try the notice.
 */
export function GET(request: Request) {
  const forced = process.env.NODE_ENV === 'production' ? null : new URL(request.url).searchParams.get('country');
  const country = forced ?? request.headers.get('x-vercel-ip-country') ?? '';
  return NextResponse.json({ country }, { headers: { 'Cache-Control': 'private, no-store' } });
}

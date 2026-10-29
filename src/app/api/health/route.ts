import { NextResponse } from 'next/server';
import { mailProvider } from '@/lib/mail';

export const dynamic = 'force-dynamic';

const projectId = process.env.SANITY_PROJECT_ID ?? '91izz3mt';
const dataset = process.env.SANITY_DATASET ?? 'production';

/**
 * For an uptime monitor (docs/project-plan.md P9.4): `GET /api/health/` answers 200 when the site can read its content
 * and 503 when it cannot. It asks Sanity's CDN directly for a count, so the answer is never a cached page. The booleans
 * tell the launch check (`scripts/qa/launch-check.mjs`) which settings the deployment has; they contain no secrets.
 */
export async function GET() {
  const started = Date.now();
  let sanity = false;
  try {
    const url = `https://${projectId}.apicdn.sanity.io/v2025-01-01/data/query/${dataset}?query=${encodeURIComponent('count(*[_type == "homePage"])')}`;
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    const body = (await res.json()) as { result?: number };
    sanity = res.ok && typeof body.result === 'number' && body.result > 0;
  } catch {
    sanity = false;
  }
  const mail = mailProvider();
  return NextResponse.json(
    {
      ok: sanity,
      sanity,
      sanityMs: Date.now() - started,
      config: {
        mail: mail,
        mailRecipients: Boolean(process.env.INQUIRY_TO_EMAIL && process.env.INQUIRY_FROM_EMAIL),
        gtm: Boolean(process.env.NEXT_PUBLIC_GTM_ID),
        indexNow: Boolean(process.env.INDEXNOW_KEY),
        turnstile: Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
        revalidateSecret: Boolean(process.env.SANITY_REVALIDATE_SECRET),
        previewToken: Boolean(process.env.SANITY_PREVIEW_TOKEN),
        deployHook: Boolean(process.env.VERCEL_DEPLOY_HOOK_URL),
        aliasRedirect: process.env.REDIRECT_VERCEL_ALIAS === '1',
      },
    },
    { status: sanity ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}

/**
 * Security headers (docs/project-plan.md P9.2, Ek H7.1).
 *
 * The Content-Security-Policy comes in two parts on purpose:
 *
 * 1. `enforcedPolicy`: directives that cannot break anything the site loads, so they are enforced from day one. They stop the
 *    site from being framed by other sites (only the Studio's preview tool may frame it), stop `<base>` and `<object>`
 *    injection, and keep forms posting to the site itself.
 * 2. `reportOnlyPolicy`: the full allow-list of scripts, images, connections and frames. It is only reported, not enforced,
 *    until the Tag Manager container (`GTM-55HWFMHR`) has been reviewed: a tag in it that loads from a host missing here
 *    would silently stop working. Violations are posted to `/api/csp-report/` and appear in the Vercel logs as `[csp]`.
 *    When the logs stay quiet for a week of real traffic, move this policy into `enforcedPolicy`.
 *
 * `'unsafe-inline'` stays in `script-src` because Next.js writes small inline scripts into every page and the site is
 * statically cached, so a per-request nonce is not possible. The allow-list of hosts is still what stops an injected
 * `<script src="https://evil.example">`.
 */

/** Where the Studio is hosted; its preview (Presentation) tool shows the site in a frame and needs permission. */
const studioOrigins = ['https://magnificenttravel.sanity.studio', 'http://localhost:3333'];

const sanityProject = 'aj0pbi0w';

const join = (directives: string[]) => directives.join('; ');

const frameAncestors = `frame-ancestors 'self' ${studioOrigins.join(' ')}`;

export const enforcedPolicy = join([frameAncestors, "base-uri 'self'", "object-src 'none'", "form-action 'self'"]);

const googleMeasurement = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
];

export const reportOnlyPolicy = join([
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${googleMeasurement.slice(0, 2).join(' ')} https://challenges.cloudflare.com https://www.tripadvisor.com https://static.tacdn.com`,
  "style-src 'self' 'unsafe-inline' https://static.tacdn.com",
  `img-src 'self' data: blob: https://cdn.sanity.io ${googleMeasurement.join(' ')} https://*.tripadvisor.com https://www.tripadvisor.jp https://www.tripadvisor.cn https://static.tacdn.com`,
  "font-src 'self' data: https://static.tacdn.com",
  `connect-src 'self' ${googleMeasurement.join(' ')} https://${sanityProject}.api.sanity.io wss://${sanityProject}.api.sanity.io`,
  'frame-src https://challenges.cloudflare.com https://www.googletagmanager.com https://www.tripadvisor.com',
  frameAncestors,
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  'report-uri /api/csp-report/',
]);

/**
 * HSTS without `includeSubDomains` and `preload`: the mail server lives on `mail.magnificenttravel.com` (P9.12) and must
 * stay reachable over plain connections until it has a certificate. Vercel adds its own header on `*.vercel.app`; on the
 * real domain, check the answer with `curl -I https://www.magnificenttravel.com` after the DNS move (P10 launch check).
 */
export const hsts = 'max-age=63072000';

export function securityHeaders(production: boolean): { key: string; value: string }[] {
  const base = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ];
  // `next dev` needs eval and websockets for hot reload, so the policies and HSTS only apply to builds.
  return production
    ? [
        ...base,
        { key: 'Strict-Transport-Security', value: hsts },
        { key: 'Content-Security-Policy', value: enforcedPolicy },
        { key: 'Content-Security-Policy-Report-Only', value: reportOnlyPolicy },
      ]
    : base;
}

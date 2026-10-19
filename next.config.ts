import type { NextConfig } from 'next';
import { editorRedirects } from './src/lib/old-urls';

// The site keeps the old sites' URL structure (docs/project-plan.md D1): language prefix `/en/`, `/cn/`, `/jp/` and a
// trailing slash. Redirects from the old addresses are added in P7.
const nextConfig = (editor: Awaited<ReturnType<typeof editorRedirects>>): NextConfig => ({
  trailingSlash: true,
  // The fingerprint of the editors' redirects this build was made with; `/api/revalidate/` compares it with the CMS (P6.14).
  env: { EDITOR_REDIRECTS_HASH: editor.hash },
  images: {
    // `next dev` resizes big pictures slowly and sometimes drops the connection (the page then keeps loading), so
    // pictures are served as they are while developing. The real optimizer runs in production.
    unoptimized: process.env.NODE_ENV === 'development',
    qualities: [60, 75, 85],
    // Tour, destination and blog pictures live in Sanity.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }],
  },
  async headers() {
    // The simple security headers (Ek H.7). A Content-Security-Policy and frame rules need the list of every outside
    // script the site loads (Turnstile, Tripadvisor, analytics) and come with P9.2.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // The sitemap index. A route folder named sitemap.xml clashes with the sitemap file convention, so it lives apart.
        { source: '/sitemap.xml', destination: '/sitemap-index' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      // D18: the live /en/videos/ page (five YouTube cards) is not rebuilt; its address goes to the blog.
      { source: '/en/videos', destination: '/en/blog/', permanent: true },
      // P6.14: old addresses that editors typed into a blog post in the Studio.
      ...editor.rules,
    ];
  },
});

/**
 * The editors' redirects are read from Sanity at build time. A build that cannot read them stops instead of going live
 * without them (the site that is already live keeps serving). `next dev` goes on without them.
 */
export default async function config(): Promise<NextConfig> {
  try {
    return nextConfig(await editorRedirects());
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    // eslint-disable-next-line no-console
    console.warn('Editor redirects were not loaded:', (error as Error).message);
    return nextConfig({ rules: [], hash: 'none' });
  }
}

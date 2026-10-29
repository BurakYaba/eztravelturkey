import type { NextConfig } from 'next';
import { editorRedirects } from './src/lib/old-urls';
import { securityHeaders } from './src/lib/security-headers';

// The site keeps the old eztravelturkey.com URL structure: language prefix `/zh/` and a trailing slash. Redirects from the old
// addresses (the `/cn/` pages, the WordPress blog) are added with the launch redirects.
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
  // Do not announce the framework in every response (Ek H.7).
  poweredByHeader: false,
  async headers() {
    // Security headers and the Content-Security-Policy (P9.2): see src/lib/security-headers.ts for what is enforced and what is only reported.
    return [{ source: '/:path*', headers: securityHeaders(process.env.NODE_ENV === 'production') }];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // The sitemap index. A route folder named sitemap.xml clashes with the sitemap file convention, so it lives apart.
        { source: '/sitemap.xml', destination: '/sitemap-index' },
        // IndexNow key file (P8.6): `/<key>.txt` answers with the key; any other 32-character name gets a 404 from the route.
        { source: '/:key([a-f0-9]{32}).txt', destination: '/api/indexnow-key/:key' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
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

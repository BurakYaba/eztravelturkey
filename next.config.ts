import type { NextConfig } from 'next';

// The site keeps the old sites' URL structure (docs/project-plan.md D1): language prefix `/en/`, `/zh/`, `/jp/` and a
// trailing slash. Redirects from the old addresses are added in P7.
const nextConfig: NextConfig = {
  trailingSlash: true,
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
    // The sitemap index. A route folder named sitemap.xml clashes with the sitemap file convention, so it lives apart.
    return [{ source: '/sitemap.xml', destination: '/sitemap-index' }];
  },
  async redirects() {
    return [
      // D18: the live /en/videos/ page (five YouTube cards) is not rebuilt; its address goes to the blog.
      { source: '/en/videos', destination: '/en/blog/', permanent: true },
    ];
  },
};

export default nextConfig;

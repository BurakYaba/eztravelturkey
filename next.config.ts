import type { NextConfig } from 'next';

// The site keeps the old sites' URL structure (docs/project-plan.md D1): language prefix `/en/`, `/zh/`, `/jp/` and a
// trailing slash. Redirects from the old addresses are added in P7.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    qualities: [60, 75, 85],
    // Tour, destination and blog pictures live in Sanity.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }],
  },
  async redirects() {
    return [
      // D18: the live /en/videos/ page (five YouTube cards) is not rebuilt; its address goes to the blog.
      { source: '/en/videos', destination: '/en/blog/', permanent: true },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

// The site keeps the old sites' URL structure (docs/project-plan.md D1): language prefix `/en/`, `/zh/`, `/jp/` and a
// trailing slash. Redirects from the old addresses are added in P7.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    qualities: [60, 75, 85],
    // Tour and blog pictures are served from the live site until they are uploaded (P1.10, then Sanity in P6).
    remotePatterns: [{ protocol: 'https', hostname: 'www.magnificenttravel.com', pathname: '/public/**' }],
  },
  // The pages read the scraped JSON with `fs`; make sure it ships with every server function.
  outputFileTracingIncludes: { '/**': ['./content/scraped/**/*'] },
  async redirects() {
    return [
      // D18: the live /en/videos/ page (five YouTube cards) is not rebuilt; its address goes to the blog.
      { source: '/en/videos', destination: '/en/blog/', permanent: true },
    ];
  },
};

export default nextConfig;

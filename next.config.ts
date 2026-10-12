import type { NextConfig } from 'next';

// The site keeps the old sites' URL structure (docs/project-plan.md D1): language prefix `/en/`, `/zh/`, `/jp/` and a
// trailing slash. Redirects from the old addresses are added in P7.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    qualities: [60, 75, 85],
  },
};

export default nextConfig;

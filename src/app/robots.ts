import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    // The index lists the sitemap of every language that has pages of its own (src/app/sitemap.xml/route.ts).
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}

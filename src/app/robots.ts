import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { hasNativeContent } from '@/lib/data';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: locales.filter(hasNativeContent).map((lang) => absoluteUrl(`/sitemap/${lang}.xml`)),
  };
}

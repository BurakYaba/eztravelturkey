import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { hasNativeContent } from '@/lib/data';
import { absoluteUrl } from '@/lib/seo';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const withContent = await Promise.all(locales.map(async (lang) => ((await hasNativeContent(lang)) ? lang : null)));
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: withContent.filter((lang) => lang !== null).map((lang) => absoluteUrl(`/sitemap/${lang}.xml`)),
  };
}

import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { localePath } from '@/i18n/paths';
import { hasNativeContent, sitemapPaths } from '@/lib/data';
import { absoluteUrl } from '@/lib/seo';

/**
 * One sitemap per language that has content of its own (/sitemap/en.xml). A language without its own pages has no
 * sitemap yet, so pages that only stand in with English text never get listed (docs/project-plan.md P2.18).
 * No `lastModified`: the old dates were a bulk date, and a build date would lie.
 */
export function generateSitemaps() {
  return locales.filter(hasNativeContent).map((id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const lang = locales.find((l) => l === id);
  if (!lang) {
    return [];
  }
  return sitemapPaths(lang).map((path) => ({
    url: absoluteUrl(localePath(lang, path)),
    priority: path === '/' ? 1 : path.split('/').length <= 2 ? 0.8 : 0.7,
    changeFrequency: 'weekly' as const,
  }));
}

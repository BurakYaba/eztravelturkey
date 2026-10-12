import type { MetadataRoute } from 'next';
import { combos } from '@/data/combos';
import { destinations } from '@/data/destinations';
import { tours } from '@/data/tours';
import { getArticles } from '@/lib/content';
import { defaultLocale } from '@/i18n/config';
import { localePath } from '@/i18n/paths';
import { absoluteUrl } from '@/lib/seo';

// Interim: English only. P2.7 replaces this with one sitemap per language.
const url = (path: string) => absoluteUrl(localePath(defaultLocale, path));

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = [
    '/',
    '/destinations',
    '/tours',
    '/multi-country-tours',
    '/private-tours',
    '/small-group-tours',
    '/travel-hub',
    '/about',
    '/contact',
    '/faq',
    '/plan-my-trip',
    '/terms-conditions',
    '/privacy-policy',
  ];
  const articles = getArticles();

  return [
    ...statics.map((path) => ({
      url: url(path),
      priority: path === '/' ? 1 : 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...destinations.map((d) => ({
      url: url(`/destinations/${d.id}`),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...combos.map((c) => ({
      url: url(`/multi-country-tours/${c.slug}`),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...tours.map((t) => ({ url: url(`/tours/${t.slug}`), priority: 0.9, changeFrequency: 'weekly' as const })),
    ...articles.map((a) => ({
      url: url(`/travel-hub/${a.slug}`),
      lastModified: a.date,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
  ];
}

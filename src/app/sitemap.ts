import type { MetadataRoute } from 'next';
import { combos } from '@/data/combos';
import { destinations } from '@/data/destinations';
import { tours } from '@/data/tours';
import { getArticles } from '@/lib/content';
import { absoluteUrl } from '@/lib/seo';

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
      url: absoluteUrl(path),
      priority: path === '/' ? 1 : 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...destinations.map((d) => ({
      url: absoluteUrl(`/destinations/${d.id}`),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...combos.map((c) => ({
      url: absoluteUrl(`/multi-country-tours/${c.slug}`),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...tours.map((t) => ({ url: absoluteUrl(`/tours/${t.slug}`), priority: 0.9, changeFrequency: 'weekly' as const })),
    ...articles.map((a) => ({
      url: absoluteUrl(`/travel-hub/${a.slug}`),
      lastModified: a.date,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
  ];
}

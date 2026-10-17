import { locales } from '@/i18n/config';
import { hasNativeContent } from '@/lib/data';
import { absoluteUrl } from '@/lib/seo';

/**
 * The sitemap index: one entry per language that has pages of its own (/sitemap/en.xml and so on). Search engines and
 * robots.txt are pointed here, so a language added later needs no other change (docs/project-plan.md P8.2, Ek H.1).
 */
export async function GET() {
  const withContent = (await Promise.all(locales.map(async (lang) => ((await hasNativeContent(lang)) ? lang : null)))).filter(
    (lang) => lang !== null,
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${withContent.map((lang) => `  <sitemap><loc>${absoluteUrl(`/sitemap/${lang}.xml`)}</loc></sitemap>`).join('\n')}
</sitemapindex>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

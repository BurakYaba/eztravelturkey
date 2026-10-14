import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/pages/ContentPage';
import { JsonLd } from '@/components/shared/JsonLd';
import { defaultLocale, hasLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getPage, languagesWithPage, pagesOfKind } from '@/lib/data';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

type Props = PageProps<'/[lang]/gdpr/[slug]'>;

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    pagesOfKind(lang, 'static')
      .filter((p) => p.path.startsWith('gdpr/'))
      .map((p) => ({ lang, slug: p.path.split('/')[1] ?? '' })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = hasLocale(lang) ? getPage(lang, `gdpr/${slug}`) : undefined;
  if (!hasLocale(lang) || !page) {
    return {};
  }
  return buildMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/${page.path}`,
    lang,
    canonicalLang: page.fallback ? defaultLocale : lang,
    alternateLangs: languagesWithPage(page.path),
  });
}

/** Legal texts (privacy policy, terms and conditions, distance sales agreement) at the old /gdpr/ addresses. */
export default async function GdprPage({ params }: Props) {
  const { lang, slug } = await params;
  const page = hasLocale(lang) ? getPage(lang, `gdpr/${slug}`) : undefined;
  if (!hasLocale(lang) || !page) {
    notFound();
  }
  const crumbs = [
    { name: getDictionary(lang).nav.home, path: '/' },
    { name: page.title, path: page.href },
  ];
  return (
    <>
      <ContentPage page={page} crumbs={crumbs} />
      <JsonLd data={[breadcrumbJsonLd(lang, crumbs)]} />
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/pages/ContentPage';
import { JsonLd } from '@/components/shared/JsonLd';
import { defaultLocale, hasLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getPage, languagesWithPage, pagesOfKind } from '@/lib/data';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

type Props = PageProps<'/[lang]/authors/[name]'>;

export function generateStaticParams() {
  return locales.flatMap((lang) => pagesOfKind(lang, 'author').map((p) => ({ lang, name: p.path.split('/')[1] ?? '' })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, name } = await params;
  const page = hasLocale(lang) ? getPage(lang, `authors/${name}`) : undefined;
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
    picture: page.image,
  });
}

export default async function AuthorPage({ params }: Props) {
  const { lang, name } = await params;
  const page = hasLocale(lang) ? getPage(lang, `authors/${name}`) : undefined;
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

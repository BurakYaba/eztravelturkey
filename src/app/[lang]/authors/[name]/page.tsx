import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/pages/ContentPage';
import { JsonLd } from '@/components/shared/JsonLd';
import { defaultLocale, hasLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getPage, alternatesOf, pageSummaries } from '@/lib/data';
import { authorJsonLd, breadcrumbJsonLd, buildMetadata, editorSeo } from '@/lib/seo';

type Props = PageProps<'/[lang]/authors/[name]'>;

export async function generateStaticParams() {
  const lists = await Promise.all(
    locales.map(async (lang) => ({ lang, authors: await pageSummaries(lang, 'author') })),
  );
  return lists.flatMap(({ lang, authors }) => authors.map((p) => ({ lang, name: p.path.split('/')[1] ?? '' })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, name } = await params;
  const page = hasLocale(lang) ? await getPage(lang, `authors/${name}`) : undefined;
  if (!hasLocale(lang) || !page) {
    return {};
  }
  return buildMetadata({
    title: page.metaTitle,
    absoluteTitle: true,
    description: page.metaDescription,
    path: `/${page.path}`,
    lang,
    canonicalLang: page.fallback ? defaultLocale : lang,
    alternates: await alternatesOf(lang, page.path),
    picture: page.image,
    ...editorSeo(page),
  });
}

export default async function AuthorPage({ params }: Props) {
  const { lang, name } = await params;
  const page = hasLocale(lang) ? await getPage(lang, `authors/${name}`) : undefined;
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
      <JsonLd
        data={[
          breadcrumbJsonLd(lang, crumbs),
          authorJsonLd({
            lang,
            name: page.title,
            description: page.metaDescription,
            path: page.href,
            imageUrl: page.image?.src ?? null,
          }),
        ]}
      />
    </>
  );
}

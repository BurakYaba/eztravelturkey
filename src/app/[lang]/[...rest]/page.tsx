import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/pages/ContentPage';
import { JsonLd } from '@/components/shared/JsonLd';
import { hasLocale, locales } from '@/i18n/config';
import { decodeSegments } from '@/i18n/public-paths';
import { getDictionary } from '@/i18n/dictionaries';
import { alternatesOf, getPage, pageSummaries } from '@/lib/data';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

type Props = PageProps<'/[lang]/[...rest]'>;

/** Text pages that have a route of their own (or are served by one): not listed here. */
const routed = new Set(['about', 'about-us', '会社概要', 'contact', '問い合わせ先', 'faq', 'search']);

export async function generateStaticParams() {
  const lists = await Promise.all(locales.map(async (lang) => ({ lang, pages: await pageSummaries(lang, 'static') })));
  return lists.flatMap(({ lang, pages }) =>
    pages.filter((p) => !routed.has(p.path) && !p.path.startsWith('gdpr/')).map((p) => ({ lang, rest: p.path.split('/') })),
  );
}

const pageOf = async (lang: string, rest: string[]) => {
  const path = rest.join('/');
  if (!hasLocale(lang) || routed.has(path)) {
    return undefined;
  }
  const page = await getPage(lang, path);
  return page?.kind === 'static' && !page.fallback ? page : undefined;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, rest: encoded } = await params;
  const rest = decodeSegments(encoded);
  const page = await pageOf(lang, rest);
  if (!hasLocale(lang) || !page) {
    return {};
  }
  return buildMetadata({
    title: page.metaTitle,
    absoluteTitle: true,
    description: page.metaDescription,
    path: `/${page.path}`,
    lang,
    alternates: await alternatesOf(lang, page.path),
  });
}

/**
 * A text page of the Chinese or Japanese site at its old address (privacy policy, terms, how to book). Any other address
 * under a language that no page claims is a real 404 with the language's own 404 page.
 */
export default async function TextPage({ params }: Props) {
  const { lang, rest: encoded } = await params;
  const rest = decodeSegments(encoded);
  const page = await pageOf(lang, rest);
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

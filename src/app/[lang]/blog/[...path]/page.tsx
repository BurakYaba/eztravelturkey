import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogCard } from '@/components/pages/BlogCard';
import { ContentPage } from '@/components/pages/ContentPage';
import { PageSections } from '@/components/pages/PageSections';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { defaultLocale, hasLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { blogCategories, blogPosts, getPage, languagesWithPage, type PageRecord } from '@/lib/data';
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  buildMetadata,
  collectionPageJsonLd,
  itemListJsonLd,
} from '@/lib/seo';

type Props = PageProps<'/[lang]/blog/[...path]'>;

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    [...blogCategories(lang), ...blogPosts(lang)].map((p) => ({ lang, path: p.path.split('/').slice(1) })),
  );
}

const lookup = (lang: Parameters<typeof getPage>[0], path: string[]): PageRecord | undefined => {
  if (path.length > 2) {
    return undefined;
  }
  const page = getPage(lang, ['blog', ...path].join('/'));
  return page && (page.kind === 'blog-category' || page.kind === 'blog-post') ? page : undefined;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, path } = await params;
  const page = hasLocale(lang) ? lookup(lang, path) : undefined;
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
    type: page.kind === 'blog-post' ? 'article' : 'website',
  });
}

export default async function BlogRoute({ params }: Props) {
  const { lang, path } = await params;
  const page = hasLocale(lang) ? lookup(lang, path) : undefined;
  if (!hasLocale(lang) || !page) {
    notFound();
  }
  const dict = getDictionary(lang);
  const hub = getPage(lang, 'blog');
  const crumbs = [
    { name: dict.nav.home, path: '/' },
    { name: hub?.title ?? dict.nav.travelGuides, path: '/blog' },
  ];

  if (page.kind === 'blog-category') {
    const posts = blogPosts(lang).filter((p) => p.path.startsWith(`${page.path}/`));
    const allCrumbs = [...crumbs, { name: page.title, path: page.href }];
    return (
      <>
        <PageBanner title={page.title} description={page.metaDescription} crumbs={allCrumbs} />
        <section className="section-y">
          <div className="container-x">
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.path}>
                  <BlogCard post={post} className="h-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
        {page.sections.length > 0 && (
          <section className="section-y bg-cream-100/50">
            <div className="container-x max-w-3xl">
              <PageSections sections={page.sections} />
            </div>
          </section>
        )}
        <QuoteBand />
        <JsonLd
          data={[
            collectionPageJsonLd(lang, page.title, `/${page.path}`, page.metaDescription),
            itemListJsonLd(
              lang,
              page.title,
              posts.map((p) => ({ name: p.title, path: p.href })),
            ),
            breadcrumbJsonLd(lang, allCrumbs),
          ]}
        />
      </>
    );
  }

  const category = getPage(lang, page.path.split('/').slice(0, 2).join('/'));
  const allCrumbs = [
    ...crumbs,
    ...(category ? [{ name: category.title, path: category.href }] : []),
    { name: page.title, path: page.href },
  ];
  return (
    <>
      <ContentPage page={page} crumbs={allCrumbs} />
      <QuoteBand />
      <JsonLd
        data={[
          blogPostingJsonLd({
            lang,
            title: page.title,
            description: page.metaDescription,
            path: `/${page.path}`,
            imageUrl: page.image?.src ?? '/images/logo.png',
            date: page.lastUpdated,
          }),
          breadcrumbJsonLd(lang, allCrumbs),
        ]}
      />
    </>
  );
}

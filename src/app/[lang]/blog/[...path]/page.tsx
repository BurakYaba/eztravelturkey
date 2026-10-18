import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogCard } from '@/components/pages/BlogCard';
import { BlogPost } from '@/components/pages/BlogPost';
import { PageSections } from '@/components/pages/PageSections';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { defaultLocale, hasLocale, locales, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { blogCategories, blogPosts, getPage, alternatesOf, type PageRecord } from '@/lib/data';
import { blogPostingJsonLd, breadcrumbJsonLd, buildMetadata, collectionPageJsonLd, editorSeo, itemListJsonLd } from '@/lib/seo';

type Props = PageProps<'/[lang]/blog/[...path]'>;

export async function generateStaticParams() {
  const lists = await Promise.all(
    locales.map(async (lang) => ({ lang, pages: [...(await blogCategories(lang)), ...(await blogPosts(lang))] })),
  );
  return lists.flatMap(({ lang, pages }) => pages.map((p) => ({ lang, path: p.path.split('/').slice(1) })));
}

async function lookup(lang: Locale, path: string[]): Promise<PageRecord | undefined> {
  if (path.length > 2) {
    return undefined;
  }
  const page = await getPage(lang, ['blog', ...path].join('/'));
  return page && (page.kind === 'blog-category' || page.kind === 'blog-post') ? page : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, path } = await params;
  const page = hasLocale(lang) ? await lookup(lang, path) : undefined;
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
    type: page.kind === 'blog-post' ? 'article' : 'website',
    ...editorSeo(page),
  });
}

export default async function BlogRoute({ params }: Props) {
  const { lang, path } = await params;
  const page = hasLocale(lang) ? await lookup(lang, path) : undefined;
  if (!hasLocale(lang) || !page) {
    notFound();
  }
  const dict = getDictionary(lang);
  const hub = await getPage(lang, 'blog');
  const crumbs = [
    { name: dict.nav.home, path: '/' },
    { name: hub?.title ?? dict.nav.travelGuides, path: '/blog' },
  ];

  if (page.kind === 'blog-category') {
    const posts = (await blogPosts(lang)).filter((p) => p.path.startsWith(`${page.path}/`));
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

  const categoryTitle = await getPage(lang, page.path.split('/').slice(0, 2).join('/'));
  const allCrumbs = [
    ...crumbs,
    ...(categoryTitle ? [{ name: categoryTitle.title, path: categoryTitle.href }] : []),
    { name: page.title, path: page.href },
  ];
  return (
    <>
      <BlogPost page={page} crumbs={allCrumbs} />
      <QuoteBand />
      <JsonLd
        data={[
          blogPostingJsonLd({
            lang,
            title: page.title,
            description: page.metaDescription,
            path: `/${page.path}`,
            imageUrl: page.image?.src ?? '/images/logo.png',
            modified: page.updated?.iso ?? null,
            author: page.author ? { name: page.author.name, path: page.author.href } : null,
          }),
          breadcrumbJsonLd(lang, allCrumbs),
        ]}
      />
    </>
  );
}

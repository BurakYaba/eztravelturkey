import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogCard } from '@/components/pages/BlogCard';
import { PageSections } from '@/components/pages/PageSections';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { TextLink } from '@/components/shared/Button';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { blogCategories, blogPosts, getPage, languagesWithPage } from '@/lib/data';
import { breadcrumbJsonLd, buildMetadata, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';

type Props = PageProps<'/[lang]/blog'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const page = hasLocale(lang) ? getPage(lang, 'blog') : undefined;
  if (!hasLocale(lang) || !page) {
    return {};
  }
  return buildMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: '/blog',
    lang,
    canonicalLang: page.fallback ? defaultLocale : lang,
    alternateLangs: languagesWithPage('blog'),
  });
}

export default async function BlogHub({ params }: Props) {
  const { lang } = await params;
  const page = hasLocale(lang) ? getPage(lang, 'blog') : undefined;
  if (!hasLocale(lang) || !page) {
    notFound();
  }
  const dict = getDictionary(lang);
  const posts = blogPosts(lang);
  const categories = blogCategories(lang);
  const crumbs = [
    { name: dict.nav.home, path: '/' },
    { name: page.title, path: '/blog' },
  ];
  return (
    <>
      <PageBanner title={page.title} description={page.metaDescription} crumbs={crumbs} />
      <section className="section-y">
        <div className="container-x">
          <ul className="mb-8 flex flex-wrap gap-x-6 gap-y-2">
            {categories.map((c) => (
              <li key={c.path}>
                <TextLink href={c.href}>{c.title}</TextLink>
              </li>
            ))}
          </ul>
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
          collectionPageJsonLd(lang, page.title, '/blog', page.metaDescription),
          itemListJsonLd(
            lang,
            page.title,
            posts.map((p) => ({ name: p.title, path: p.href })),
          ),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

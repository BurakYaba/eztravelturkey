import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogCard } from '@/components/pages/BlogCard';
import { Link } from '@/i18n/link';
import { PageSections } from '@/components/pages/PageSections';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { blogCategories, blogPosts, getPage, alternatesOf } from '@/lib/data';
import { breadcrumbJsonLd, buildMetadata, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';

type Props = PageProps<'/[lang]/blog'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const page = hasLocale(lang) ? await getPage(lang, 'blog') : undefined;
  if (!hasLocale(lang) || !page) {
    return {};
  }
  return buildMetadata({
    title: page.metaTitle,
    absoluteTitle: true,
    description: page.metaDescription,
    path: '/blog',
    lang,
    canonicalLang: page.fallback ? defaultLocale : lang,
    alternates: await alternatesOf(lang, 'blog'),
  });
}

export default async function BlogHub({ params }: Props) {
  const { lang } = await params;
  const page = hasLocale(lang) ? await getPage(lang, 'blog') : undefined;
  if (!hasLocale(lang) || !page) {
    notFound();
  }
  const dict = getDictionary(lang);
  const [posts, categories] = await Promise.all([blogPosts(lang), blogCategories(lang)]);
  const crumbs = [
    { name: dict.nav.home, path: '/' },
    { name: page.title, path: '/blog' },
  ];
  // The "Map of X" guides are the posts readers come for most; they get their own row before the rest.
  const isMap = (path: string) => (path.split('/').pop() ?? '').startsWith('map-of-');
  const maps = posts.filter((p) => isMap(p.path));
  const rest = posts.filter((p) => !isMap(p.path));
  const countOf = (path: string) => posts.filter((p) => p.path.startsWith(`${path}/`)).length;
  return (
    <>
      <PageBanner title={page.title} description={page.metaDescription} crumbs={crumbs} />
      <section className="section-y pb-0">
        <div className="container-x">
          <nav aria-label={dict.blog.categories}>
            <ul className="flex flex-wrap gap-2.5">
              {categories.map((c) => (
                <li key={c.path}>
                  <Link
                    href={c.href}
                    className="border-navy-900/25 text-navy-900 hover:border-navy-900 hover:bg-cream-100 inline-flex min-h-11 items-center gap-2 rounded-full border bg-white px-4 text-[0.95rem] font-semibold transition">
                    {c.title}
                    <span className="text-muted text-sm font-normal">{countOf(c.path)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
      {maps.length > 0 && (
        <section className="section-y pb-0">
          <div className="container-x">
            <SectionHeading title={dict.blog.featured} />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {maps.map((post) => (
                <li key={post.path}>
                  <BlogCard post={post} className="h-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <section className="section-y">
        <div className="container-x">
          <SectionHeading title={dict.blog.allGuides} />
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
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

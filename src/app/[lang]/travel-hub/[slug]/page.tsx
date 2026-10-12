import type { Metadata } from 'next';
import { Link } from '@/i18n/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import { ArticleCard } from '@/components/shared/ArticleCard';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/shared/JsonLd';
import { Newsletter } from '@/components/shared/Newsletter';
import { Photo } from '@/components/shared/Photo';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TourCard } from '@/components/tours/TourCard';
import { site } from '@/data/site';
import { getTour } from '@/data/tours';
import { getArticle, getArticles } from '@/lib/content';
import { blogPostingJsonLd, breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { getLocale } from '@/i18n/server';
import { toCardData } from '@/lib/tours';
import { formatDate } from '@/lib/utils';

type Params = { slug: string };

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) {
    return {};
  }
  return buildMetadata({
    title: a.title,
    description: a.description,
    path: `/travel-hub/${a.slug}`,
    image: a.image,
    type: 'article',
  });
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const lang = await getLocale();
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    notFound();
  }

  const path = `/travel-hub/${article.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Travel Hub', path: '/travel-hub' },
    { name: article.title, path },
  ];
  const tours = article.tours.map((s) => getTour(s)).filter((t): t is NonNullable<typeof t> => Boolean(t));
  const more = getArticles()
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .concat(getArticles().filter((a) => a.slug !== article.slug && a.category !== article.category))
    .slice(0, 3);

  return (
    <>
      <header className="border-cream-200 bg-cream-50 border-b">
        <div className="container-x grid items-center gap-8 py-10 md:py-14 lg:grid-cols-2 lg:gap-12">
          <div>
            <Breadcrumbs items={crumbs} className="mb-6" />
            <p className="eyebrow">{article.category}</p>
            <h1 className="h-display mt-2">{article.title}</h1>
            <p className="text-ink/90 mt-4 text-lg">{article.description}</p>
            <p className="text-muted mt-4 text-sm">
              By {site.name} editorial team, {formatDate(article.date)}, {article.readingMinutes} min read
            </p>
          </div>
          <div className="shadow-card relative aspect-[4/3] overflow-hidden rounded-lg">
            <Photo id={article.image} sizes="(min-width: 1024px) 50vw, 100vw" priority />
          </div>
        </div>
      </header>

      <div className="container-x grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="prose-article text-lg">
          <ReactMarkdown rehypePlugins={[rehypeSlug]}>{article.body}</ReactMarkdown>
        </article>
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="bg-cream-100 rounded-lg p-5">
            <h2 className="text-xl">Plan this trip with us</h2>
            <p className="text-muted mt-2">
              Tell us your dates and interests and we will reply with an itinerary and quote.
            </p>
            <Link
              href="/plan-my-trip"
              className="bg-gold-600 hover:bg-gold-700 mt-4 inline-flex h-11 items-center justify-center rounded-lg px-5 font-semibold text-white transition">
              Plan My Trip
            </Link>
          </div>
        </aside>
      </div>

      {tours.length > 0 && (
        <section className="section-y border-cream-200 bg-cream-100/60 border-t">
          <div className="container-x">
            <SectionHeading title="Related tours" link={{ href: '/tours', label: 'View all tours' }} />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((t) => (
                <li key={t.slug}>
                  <TourCard tour={toCardData(t)} className="h-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section-y">
        <div className="container-x">
          <SectionHeading title="Keep reading" link={{ href: '/travel-hub', label: 'All articles' }} />
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {more.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} className="h-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Newsletter />
      <QuoteBand />
      <JsonLd
        data={[
          blogPostingJsonLd({ lang,
            title: article.title,
            description: article.description,
            path,
            image: article.image,
            date: article.date,
          }),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

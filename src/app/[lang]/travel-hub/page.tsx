import { Link } from '@/i18n/link';
import { HubBrowser } from '@/components/shared/HubBrowser';
import { JsonLd } from '@/components/shared/JsonLd';
import { Newsletter } from '@/components/shared/Newsletter';
import { PageBanner } from '@/components/shared/PageBanner';
import { Photo } from '@/components/shared/Photo';
import { TrustBar } from '@/components/shared/TrustBar';
import { ButtonLink } from '@/components/shared/Button';
import { getTour } from '@/data/tours';
import { articleCategories, getArticles } from '@/lib/content';
import { breadcrumbJsonLd, localizedMetadata, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';
import { formatDate } from '@/lib/utils';

const description =
  'Practical guides and inspiration for Turkey, Greece, Egypt, Jordan and Morocco: when to go, what to see and how to plan a trip with confidence.';

export const generateMetadata = localizedMetadata({
  title: 'Travel Hub: Travel Guides',
  description,
  path: '/travel-hub',
  image: 'santorini-sunset',
});

export default async function TravelHubPage() {
  const lang = await getLocale();
  const articles = getArticles();
  const [featured] = articles;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Travel Hub', path: '/travel-hub' },
  ];
  const related = featured.tours.map((s) => getTour(s)).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <>
      <PageBanner
        title="Travel Hub"
        eyebrow="Travel insights and inspiration"
        description="Practical guides and inspiration for Turkey, Greece, Egypt, Jordan and Morocco."
        image="santorini-sunset"
        crumbs={crumbs}
      />
      <TrustBar />

      <section className="section-y">
        <div className="container-x">
          <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="shadow-card relative aspect-[4/3] overflow-hidden rounded-lg">
              <Photo id={featured.image} sizes="(min-width: 1024px) 50vw, 100vw" priority />
            </div>
            <div>
              <p className="eyebrow">Featured article</p>
              <h2 className="h-section mt-2">{featured.title}</h2>
              <p className="text-ink/90 mt-3 text-lg">{featured.description}</p>
              <p className="text-muted mt-3 text-sm">
                {formatDate(featured.date)}, {featured.readingMinutes} min read
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                <ButtonLink href={`/travel-hub/${featured.slug}`} arrow>
                  Read the Article
                </ButtonLink>
                {related.length > 0 && (
                  <div className="text-sm">
                    <p className="text-navy-900 font-semibold">Related tours</p>
                    <ul className="mt-1 space-y-0.5">
                      {related.map((t) => (
                        <li key={t.slug}>
                          <Link href={`/tours/${t.slug}`} className="text-gold-700 underline underline-offset-4">
                            {t.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section-y bg-cream-100/60">
        <div className="container-x">
          <h2 className="h-section mb-8">All articles</h2>
          <HubBrowser
            articles={articles.map((a) => ({
              slug: a.slug,
              title: a.title,
              description: a.description,
              category: a.category,
              date: a.date,
              image: a.image,
              order: a.order,
              tours: a.tours,
              readingMinutes: a.readingMinutes,
            }))}
            categories={articleCategories()}
          />
        </div>
      </section>

      <Newsletter />
      <JsonLd
        data={[
          collectionPageJsonLd(lang, 'Travel Hub', '/travel-hub', description),
          itemListJsonLd(lang, 
            'Travel guides',
            articles.map((a) => ({ name: a.title, path: `/travel-hub/${a.slug}` })),
          ),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

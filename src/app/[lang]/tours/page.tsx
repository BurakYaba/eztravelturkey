import { Suspense } from 'react';
import { JsonLd } from '@/components/shared/JsonLd';
import { MultiCountryCta } from '@/components/shared/MultiCountryCta';
import { PageBanner } from '@/components/shared/PageBanner';
import { TrustBar } from '@/components/shared/TrustBar';
import { browserText } from '@/components/tours/browser-text';
import { TourGrid } from '@/components/tours/TourGrid';
import { ToursBrowser } from '@/components/tours/ToursBrowser';
import { allTours, availableCountries } from '@/lib/data';
import { dictMetadata } from '@/lib/dict-meta';
import { breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

export const generateMetadata = dictMetadata((d) => d.ui.pages.tours, { path: '/tours', image: 'santorini-sunset' });

export default async function ToursPage() {
  const lang = await getLocale();
  const dictionary = getDictionary(lang);
  const { ui, nav } = dictionary;
  const t = ui.pages.tours;
  const tours = await allTours(lang);
  const crumbs = [
    { name: nav.home, path: '/' },
    { name: t.crumb, path: '/tours' },
  ];
  return (
    <>
      <PageBanner title={t.title} description={t.banner} image="santorini-sunset" crumbs={crumbs} />
      <section className="container-x py-10 md:py-12">
        <p className="text-ink/90 mb-8 max-w-3xl text-lg">{t.lead}</p>
        <h2 className="sr-only">{dictionary.destination.allTours}</h2>
        <Suspense fallback={<TourGrid tours={tours} lang={lang} text={dictionary.card} withTabs />}>
          <ToursBrowser
            tours={tours}
            lang={lang}
            cardText={dictionary.card}
            text={browserText(dictionary, await availableCountries(lang))}
          />
        </Suspense>
      </section>
      <TrustBar />
      <MultiCountryCta />
      <JsonLd
        data={[
          collectionPageJsonLd(lang, t.crumb, '/tours', t.description),
          itemListJsonLd(
            lang,
            t.crumb,
            tours.map((tour) => ({ name: tour.title, path: tour.href })),
          ),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

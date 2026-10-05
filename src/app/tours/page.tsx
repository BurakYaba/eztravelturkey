import { Suspense } from 'react';
import { JsonLd } from '@/components/shared/JsonLd';
import { MultiCountryCta } from '@/components/shared/MultiCountryCta';
import { PageBanner } from '@/components/shared/PageBanner';
import { TrustBar } from '@/components/shared/TrustBar';
import { ToursBrowser } from '@/components/tours/ToursBrowser';
import { tours } from '@/data/tours';
import { breadcrumbJsonLd, buildMetadata, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';
import { toBrowsable } from '@/lib/tours';

const description =
  'Browse private, small group and multi-country tours across Turkey, Greece, Egypt and Jordan. Filter by destination, travel style and duration.';

export const metadata = buildMetadata({
  title: 'Explore Our Tours',
  description,
  path: '/tours',
  image: 'santorini-sunset',
});

export default function ToursPage() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Tours', path: '/tours' },
  ];
  return (
    <>
      <PageBanner
        title="Explore Our Tours"
        description="Private, small group and multi-country journeys designed around you."
        image="santorini-sunset"
        crumbs={crumbs}
      />
      <section className="container-x py-10 md:py-12">
        <p className="text-ink/90 mb-8 max-w-3xl text-lg">
          From the timeless wonders of Turkey to the sun-drenched islands of Greece and the ancient treasures of Egypt
          and Jordan, our tours bring you closer to the most extraordinary destinations. Travel your way, with the same
          exceptional care.
        </p>
        <Suspense fallback={<div className="h-96" aria-hidden />}>
          <ToursBrowser tours={tours.map(toBrowsable)} />
        </Suspense>
      </section>
      <TrustBar />
      <MultiCountryCta />
      <JsonLd
        data={[
          collectionPageJsonLd('Tours', '/tours', description),
          itemListJsonLd(
            'Tours',
            tours.map((t) => ({ name: `${t.title}: ${t.subtitle}`, path: `/tours/${t.slug}` })),
          ),
          breadcrumbJsonLd(crumbs),
        ]}
      />
    </>
  );
}

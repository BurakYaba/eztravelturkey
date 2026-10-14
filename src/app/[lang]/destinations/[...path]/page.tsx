import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DestinationPage } from '@/components/pages/DestinationPage';
import { TourDetail } from '@/components/pages/TourDetail';
import { JsonLd } from '@/components/shared/JsonLd';
import { defaultLocale, hasLocale, locales } from '@/i18n/config';
import { destinationCrumbs } from '@/lib/crumbs';
import { destinationParams, languagesWithPage, resolveDestination } from '@/lib/data';
import {
  breadcrumbJsonLd,
  buildMetadata,
  collectionPageJsonLd,
  faqJsonLd,
  itemListJsonLd,
  touristTripJsonLd,
} from '@/lib/seo';

type Props = PageProps<'/[lang]/destinations/[...path]'>;

export async function generateStaticParams() {
  const lists = await Promise.all(locales.map(async (lang) => ({ lang, paths: await destinationParams(lang) })));
  return lists.flatMap(({ lang, paths }) => paths.map((path) => ({ lang, path })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, path } = await params;
  const match = hasLocale(lang) ? await resolveDestination(lang, path) : null;
  if (!hasLocale(lang) || !match) {
    return {};
  }
  const record = match.type === 'tour' ? match.tour : match.page;
  return buildMetadata({
    title: record.metaTitle,
    description: record.metaDescription,
    path: `/${record.path}`,
    lang,
    canonicalLang: record.fallback ? defaultLocale : lang,
    alternateLangs: await languagesWithPage(record.path),
    picture: match.type === 'tour' ? match.tour.image : match.page.image,
    type: 'website',
  });
}

export default async function DestinationRoute({ params }: Props) {
  const { lang, path } = await params;
  if (!hasLocale(lang)) {
    notFound();
  }
  const match = await resolveDestination(lang, path);
  if (!match) {
    notFound();
  }

  if (match.type === 'tour') {
    const { tour } = match;
    const crumbs = await destinationCrumbs(lang, path, tour.title);
    return (
      <>
        <TourDetail tour={tour} crumbs={crumbs} />
        <JsonLd
          data={[
            touristTripJsonLd({
              lang,
              name: tour.title,
              description: tour.metaDescription,
              path: `/${tour.path}`,
              imageUrl: tour.image?.src ?? '/images/logo.png',
              priceEUR: tour.priceEUR,
              stops: tour.route,
            }),
            breadcrumbJsonLd(lang, crumbs),
            ...(tour.faqs.length > 0 ? [faqJsonLd(tour.faqs)] : []),
          ]}
        />
      </>
    );
  }

  const { page, tours } = match;
  const crumbs = await destinationCrumbs(lang, path, page.title);
  return (
    <>
      <DestinationPage
        page={page}
        tours={tours}
        categories={match.type === 'country' ? match.categories : []}
        crumbs={crumbs}
        crossSell={match.type !== 'combo'}
      />
      <JsonLd
        data={[
          collectionPageJsonLd(lang, page.title, `/${page.path}`, page.metaDescription),
          itemListJsonLd(
            lang,
            page.title,
            tours.map((t) => ({ name: t.title, path: t.href })),
          ),
          breadcrumbJsonLd(lang, crumbs),
          ...(page.faqs.length > 0 ? [faqJsonLd(page.faqs)] : []),
        ]}
      />
    </>
  );
}

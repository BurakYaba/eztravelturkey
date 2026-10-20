import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import {
  DestinationsRow,
  FeaturedTours,
  HubPreview,
  MultiCountryRail,
  ReviewsSection,
  WaysToTravel,
  WhyTravel,
} from '@/components/home/HomeSections';
import { Accordion } from '@/components/shared/Accordion';
import { JsonLd } from '@/components/shared/JsonLd';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrustBar } from '@/components/shared/TrustBar';
import { homeFaqs } from '@/data/faqs';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { alternatesOf, getPage } from '@/lib/data';
import { buildMetadata, faqJsonLd, webPageJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';

// English: brand first, all five countries, under 60 characters (P3.12: the old title was 86 and left Morocco out).
const title = 'Magnificent Travel: Turkey, Greece, Egypt, Jordan & Morocco';
const description =
  'Private, small group and multi-country tours across Turkey, Greece, Egypt, Jordan and Morocco, planned by a licensed local operator since 1997.';

/**
 * The title and description come from the home page document of the language (the Studio's "Ana sayfa"); the texts above are only
 * the fallback for a document that has none. The big heading in the hero comes from the document's H1 field the same way.
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const page = await getPage(locale, '');
  const own = page && !page.fallback;
  return buildMetadata({
    title: own && page.metaTitle ? page.metaTitle : title,
    description: own && page.metaDescription ? page.metaDescription : description,
    path: '/',
    lang: locale,
    absoluteTitle: true,
    alternates: await alternatesOf(locale, ''),
  });
}

export default async function HomePage() {
  const lang = await getLocale();
  const { ui } = getDictionary(lang);
  // The questions of the old home page (the CMS copy). English falls back to the first draft's seven; the other languages show none without their own.
  const doc = await getPage(lang, '');
  const faqs = doc?.faqs.length ? doc.faqs : lang === 'en' ? homeFaqs.slice(0, 7) : [];
  return (
    <>
      <Hero title={doc && !doc.fallback && doc.title ? doc.title : undefined} />
      <TrustBar className="mt-10" notes />
      <WhyTravel />
      <MultiCountryRail />
      <DestinationsRow />
      <WaysToTravel />
      <FeaturedTours />
      <HubPreview />
      <ReviewsSection />
      {faqs.length > 0 && (
        <section className="section-y bg-cream-100/60">
          <div className="container-x max-w-3xl">
            <SectionHeading
              title={ui.home.faq.title}
              description={ui.home.faq.text}
              link={{ href: '/faq', label: ui.home.faq.all }}
            />
            <Accordion items={faqs.map((f, i) => ({ id: `faq-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
          </div>
        </section>
      )}
      <QuoteBand />
      <JsonLd
        data={[
          webPageJsonLd(
            lang,
            doc && !doc.fallback && doc.metaTitle ? doc.metaTitle : title,
            '/',
            'WebPage',
            description,
          ),
          ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
        ]}
      />
    </>
  );
}

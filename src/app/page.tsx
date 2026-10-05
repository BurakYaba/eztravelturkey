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
import { buildMetadata, webPageJsonLd } from '@/lib/seo';

const title = 'Turkey, Greece, Egypt and Jordan Tours and Multi-Country Packages';
const description =
  'Private, small group and multi-country tours across Turkey, Greece, Egypt, Jordan and Morocco, planned by a licensed local operator since 1997.';

export const metadata = buildMetadata({ title: `${title} | Magnificent Travel`, description, path: '/' });

export default function HomePage() {
  const faqs = homeFaqs.slice(0, 7);
  return (
    <>
      <Hero />
      <TrustBar className="mt-10" notes />
      <WhyTravel />
      <DestinationsRow />
      <WaysToTravel />
      <FeaturedTours />
      <MultiCountryRail />
      <HubPreview />
      <ReviewsSection />
      <section className="section-y bg-cream-100/60">
        <div className="container-x max-w-3xl">
          <SectionHeading
            title="Frequently asked questions"
            description="Everything you need to know about traveling with Magnificent Travel."
            link={{ href: '/faq', label: 'View all FAQs' }}
          />
          <Accordion items={faqs.map((f, i) => ({ id: `faq-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
        </div>
      </section>
      <QuoteBand />
      <JsonLd data={webPageJsonLd(title, '/', 'WebPage', description)} />
    </>
  );
}

import { PageSections } from '@/components/pages/PageSections';
import { Accordion } from '@/components/shared/Accordion';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { faqGroups } from '@/data/faqs';
import { getPage } from '@/lib/data';
import { docMetadata } from '@/lib/page-meta';
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';

const description =
  'Answers about booking, payments, cancellation, travel documents, money, and what to expect on a Magnificent Travel tour.';

export const generateMetadata = docMetadata({
  title: 'Frequently Asked Questions',
  description,
  path: '/faq',
  image: 'travel-planning',
});

export default async function FaqPage() {
  const lang = await getLocale();
  // The questions and answers of the old FAQ page, as they were. The grouped answers written for the first draft are
  // only used when the CMS has no page yet.
  const doc = await getPage(lang, 'faq');
  const items = doc?.faqs.length ? doc.faqs : faqGroups.flatMap((g) => g.items);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ];
  return (
    <>
      <PageBanner
        title={doc?.title || 'Frequently Asked Questions'}
        description="Everything you need to know about traveling with Magnificent Travel."
        image="travel-planning"
        crumbs={crumbs}
      />
      <section className="section-y">
        <div className="container-x max-w-3xl">
          {doc && doc.sections.length > 0 && <PageSections sections={doc.sections} className="mb-10" />}
          <Accordion items={items.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
        </div>
      </section>
      <QuoteBand
        title="Still have a question?"
        text="Message us on WhatsApp or send a request and a travel specialist will reply."
      />
      <JsonLd
        data={[
          webPageJsonLd(lang, doc?.title ?? 'Frequently Asked Questions', '/faq', 'WebPage', description),
          faqJsonLd(items),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

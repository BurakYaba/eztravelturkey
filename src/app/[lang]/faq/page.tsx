import { PageSections } from '@/components/pages/PageSections';
import { Accordion } from '@/components/shared/Accordion';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { faqGroups } from '@/data/faqs';
import { getPage } from '@/lib/data';
import { docMetadata } from '@/lib/page-meta';
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

const description =
  'Answers about booking, payments, cancellation, travel documents, money, and what to expect on a Magnificent Travel tour.';

export const generateMetadata = docMetadata({
  title: 'Frequently Asked Questions',
  description,
  path: '/faq',
  image: 'travel-planning',
  dictionary: (d) => ({ title: d.ui.pages.faq.title, description: d.ui.pages.faq.banner }),
});

export default async function FaqPage() {
  const lang = await getLocale();
  const { ui, nav } = getDictionary(lang);
  const t = ui.pages.faq;
  // The questions and answers of the old FAQ page, as they were. The grouped answers written for the first draft are
  // only used when the CMS has no page yet.
  const doc = await getPage(lang, 'faq');
  const items = doc?.faqs.length ? doc.faqs : lang === 'en' ? faqGroups.flatMap((g) => g.items) : [];
  const crumbs = [
    { name: nav.home, path: '/' },
    { name: t.crumb, path: '/faq' },
  ];
  return (
    <>
      <PageBanner title={doc?.title || t.title} description={t.banner} image="travel-planning" crumbs={crumbs} />
      <section className="section-y">
        <div className="container-x max-w-3xl">
          {doc && doc.sections.length > 0 && <PageSections sections={doc.sections} className="mb-10" />}
          <Accordion items={items.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
        </div>
      </section>
      <QuoteBand title={t.bandTitle} text={t.bandText} />
      <JsonLd
        data={[
          webPageJsonLd(lang, doc?.title ?? t.title, '/faq', 'WebPage', description),
          ...(items.length > 0 ? [faqJsonLd(items)] : []),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

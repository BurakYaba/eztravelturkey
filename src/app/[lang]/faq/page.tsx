import { PageSections } from '@/components/pages/PageSections';
import { Accordion } from '@/components/shared/Accordion';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { getPage } from '@/lib/data';
import { docMetadata } from '@/lib/page-meta';
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

export const generateMetadata = docMetadata({
  path: '/faq',
  image: 'travel-planning',
  dictionary: (d) => ({ title: d.ui.pages.faq.title, description: d.ui.pages.faq.banner }),
});

export default async function FaqPage() {
  const lang = await getLocale();
  const { ui, nav } = getDictionary(lang);
  const t = ui.pages.faq;
  // The questions and answers of the old FAQ page, as they were.
  const doc = await getPage(lang, 'faq');
  const items = doc?.faqs ?? [];
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
          webPageJsonLd(lang, doc?.title ?? t.title, '/faq', 'WebPage', doc?.metaDescription),
          ...(items.length > 0 ? [faqJsonLd(items)] : []),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

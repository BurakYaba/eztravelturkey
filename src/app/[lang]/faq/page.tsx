import { Accordion } from '@/components/shared/Accordion';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { faqGroups } from '@/data/faqs';
import { breadcrumbJsonLd, localizedMetadata, webPageJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';

const description =
  'Answers about booking, payments, cancellation, travel documents, money, and what to expect on a Magnificent Travel tour.';

export const generateMetadata = localizedMetadata({
  title: 'Frequently Asked Questions',
  description,
  path: '/faq',
  image: 'travel-planning',
});

export default async function FaqPage() {
  const lang = await getLocale();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ];
  return (
    <>
      <PageBanner
        title="Frequently Asked Questions"
        description="Everything you need to know about traveling with Magnificent Travel."
        image="travel-planning"
        crumbs={crumbs}
      />
      <section className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <nav aria-label="FAQ topics" className="lg:sticky lg:top-32 lg:self-start">
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {faqGroups.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    className="border-cream-200 text-navy-900 hover:border-gold-500/60 lg:hover:bg-cream-100 block rounded-lg border bg-white px-4 py-2.5 font-semibold transition lg:border-transparent lg:bg-transparent">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="max-w-3xl space-y-12">
            {faqGroups.map((g) => (
              <section key={g.id} id={g.id} className="scroll-mt-32">
                <h2 className="mb-5 text-3xl">{g.title}</h2>
                <Accordion items={g.items.map((f, i) => ({ id: `${g.id}-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
              </section>
            ))}
          </div>
        </div>
      </section>
      <QuoteBand
        title="Still have a question?"
        text="Message us on WhatsApp or send a request and a travel specialist will reply."
      />
      <JsonLd
        data={[webPageJsonLd(lang, 'Frequently Asked Questions', '/faq', 'WebPage', description), breadcrumbJsonLd(lang, crumbs)]}
      />
    </>
  );
}

import { Airplane, Bed, Boat, UserFocus } from '@phosphor-icons/react/dist/ssr';
import { Accordion } from '@/components/shared/Accordion';
import { ComboCard } from '@/components/shared/ComboCard';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrustBar } from '@/components/shared/TrustBar';
import { comboCards } from '@/lib/data';
import { dictMetadata } from '@/lib/dict-meta';
import { homeFaqs } from '@/data/faqs';
import { breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

export const generateMetadata = dictMetadata((d) => d.ui.pages.multi, {
  path: '/multi-country-tours',
  image: 'santorini-domes',
});

const icons = [Airplane, Boat, Bed, UserFocus];

export default async function MultiCountryPage() {
  const lang = await getLocale();
  const { ui, nav } = getDictionary(lang);
  const t = ui.pages.multi;
  const combos = await comboCards(lang);
  // The questions about multi-country trips are picked from the English FAQ; the old Chinese and Japanese sites had none for this page.
  const faqs = lang === 'en' ? [5, 7, 15, 13].map((i) => homeFaqs[i]).filter((f) => f !== undefined) : [];
  const crumbs = [
    { name: nav.home, path: '/' },
    { name: t.title, path: '/multi-country-tours' },
  ];
  return (
    <>
      <PageBanner title={t.title} description={t.banner} image="santorini-domes" crumbs={crumbs} />
      <TrustBar />
      <section className="section-y">
        <div className="container-x">
          <SectionHeading title={t.listTitle} description={t.listText} />
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {combos.map((c) => (
              <li key={c.href} className="reveal">
                <ComboCard combo={c} className="h-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section-y bg-cream-100/60">
        <div className="container-x">
          <SectionHeading title={t.teamTitle} description={t.teamText} />
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.items.map(({ title, text }, i) => {
              const Icon = icons[i] ?? Airplane;
              return (
                <li key={title} className="flex gap-4">
                  <Icon size={34} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                  <div>
                    <h3 className="font-sans text-base font-semibold tracking-normal">{title}</h3>
                    <p className="text-muted mt-1 text-[0.95rem]">{text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      {faqs.length > 0 && (
        <section className="section-y">
          <div className="container-x max-w-3xl">
            <SectionHeading title={t.faqTitle} link={{ href: '/faq', label: t.faqAll }} />
            <Accordion items={faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
          </div>
        </section>
      )}
      <QuoteBand title={t.bandTitle} text={t.bandText} image="mykonos" />
      <JsonLd
        data={[
          collectionPageJsonLd(lang, t.title, '/multi-country-tours', t.description),
          itemListJsonLd(
            lang,
            t.list,
            combos.map((c) => ({ name: c.title, path: c.href })),
          ),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

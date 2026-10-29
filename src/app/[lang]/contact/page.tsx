import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { TeamBlock } from '@/components/shared/TeamBlock';
import { QuoteForm } from '@/components/shared/QuoteForm';
import { getPage } from '@/lib/data';
import { docMetadata } from '@/lib/page-meta';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/seo';
import { PageSections } from '@/components/pages/PageSections';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

export const generateMetadata = docMetadata({
  path: '/contact',
  image: 'istanbul-skyline',
  dictionary: (d) => ({ title: d.ui.pages.contact.title, description: d.ui.pages.contact.banner }),
});

export default async function ContactPage() {
  const lang = await getLocale();
  const doc = await getPage(lang, 'contact');
  // The contact details of the old Contact page, next to the form.
  const { ui, nav } = getDictionary(lang);
  const localCrumbs = [
    { name: nav.home, path: '/' },
    { name: ui.pages.contact.crumb, path: '/contact' },
  ];
  const details = (doc?.sections ?? []).filter((s) => s.blocks.some((b) => b.type === 'list'));
  return (
    <>
      <PageBanner
        title={doc?.title ?? ui.pages.contact.title}
        description={ui.pages.contact.banner}
        image="istanbul-skyline"
        crumbs={localCrumbs}
      />
      <section className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
          <div>{details.length > 0 && <PageSections sections={details} />}</div>
          <div>
            <h2 className="h-section">{ui.pages.contact.formTitle}</h2>
            <p className="text-muted mt-2 mb-5">{ui.pages.contact.formText}</p>
            <QuoteForm variant="contact" />
          </div>
        </div>
      </section>
      <TeamBlock className="section-y bg-cream-100/60" />
      <JsonLd
        data={[
          webPageJsonLd(lang, doc?.title ?? ui.pages.contact.title, '/contact', 'ContactPage', doc?.metaDescription),
          breadcrumbJsonLd(lang, localCrumbs),
        ]}
      />
    </>
  );
}

import type { PageRecord } from '@/lib/data/types';
import { Accordion } from '../shared/Accordion';
import type { Crumb } from '../shared/Breadcrumbs';
import { PageBanner } from '../shared/PageBanner';
import { PageSections } from './PageSections';

/** Interim page for a scraped text page (blog post, author, legal text): banner, then the text as it was. */
export function ContentPage({ page, crumbs, byline }: { page: PageRecord; crumbs: Crumb[]; byline?: string }) {
  return (
    <>
      <PageBanner title={page.title} description={byline} picture={page.image} crumbs={crumbs} />
      <section className="section-y">
        <div className="container-x max-w-3xl">
          <PageSections sections={page.sections} />
          {page.faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="h-section mb-6">Frequently asked questions</h2>
              <Accordion items={page.faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

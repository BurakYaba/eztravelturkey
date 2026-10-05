import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { cancellationTables, termsSections } from '@/data/policies';
import { breadcrumbJsonLd, buildMetadata, webPageJsonLd } from '@/lib/seo';

const description =
  'Booking terms for Magnificent Travel tours: payment schedule, cancellation charges, travel documents, insurance and liability.';

export const metadata = buildMetadata({
  title: 'Terms and Conditions',
  description,
  path: '/terms-conditions',
  image: 'travel-planning',
});

export default function TermsPage() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Terms and Conditions', path: '/terms-conditions' },
  ];
  return (
    <>
      <PageBanner
        title="Terms and Conditions"
        description="Please read these terms before you book."
        image="travel-planning"
        crumbs={crumbs}
      />
      <section className="section-y">
        <div className="container-x max-w-3xl space-y-10">
          <p className="text-ink/90 text-lg">
            By requesting or booking a tour with Magnificent Travel you accept these terms. They apply to all tours
            unless your written proposal states otherwise.
          </p>
          {termsSections.map((s) => (
            <section key={s.title}>
              <h2 className="text-2xl">{s.title}</h2>
              <p className="text-ink/90 mt-2">{s.body}</p>
            </section>
          ))}
          <section>
            <h2 className="text-2xl">Cancellation charges</h2>
            <div className="mt-5 grid gap-6">
              {cancellationTables.map((t) => (
                <div key={t.title} className="border-cream-200 shadow-card overflow-hidden rounded-lg border bg-white">
                  <h3 className="bg-cream-100 px-4 py-3 font-sans text-base font-semibold tracking-normal">
                    {t.title}
                  </h3>
                  <table className="w-full text-left">
                    <thead className="sr-only">
                      <tr>
                        <th>Notice given</th>
                        <th>Charge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.rows.map(([when, fee]) => (
                        <tr key={when} className="border-cream-200 border-t">
                          <th scope="row" className="text-navy-900 px-4 py-3 font-medium">
                            {when}
                          </th>
                          <td className="text-ink px-4 py-3">{fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
      <JsonLd data={[webPageJsonLd('Terms and Conditions', '/terms-conditions'), breadcrumbJsonLd(crumbs)]} />
    </>
  );
}

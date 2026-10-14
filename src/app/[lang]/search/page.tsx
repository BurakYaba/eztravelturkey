import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PageBanner } from '@/components/shared/PageBanner';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata } from '@/lib/seo';
import { SearchClient } from './SearchClient';

type Props = PageProps<'/[lang]/search'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const { search } = getDictionary(locale);
  // Result pages stay out of the index: they are endless and thin (docs/project-plan.md P2.13).
  return buildMetadata({ title: search.title, description: search.placeholder, path: '/search', lang: locale, noindex: true });
}

export default async function SearchPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) {
    notFound();
  }
  const dict = getDictionary(lang);
  const t = dict.search;
  return (
    <>
      <PageBanner
        title={t.title}
        crumbs={[
          { name: dict.nav.home, path: '/' },
          { name: t.title, path: '/search' },
        ]}
      />
      <section className="section-y">
        <div className="container-x">
          <Suspense>
            <SearchClient
              labels={{
                placeholder: t.placeholder,
                button: t.button,
                empty: t.empty,
                hint: t.hint,
                results: t.results,
                kinds: { tour: t.kindTour, destination: t.kindDestination, blog: t.kindBlog },
              }}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}

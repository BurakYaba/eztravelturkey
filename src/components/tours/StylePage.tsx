import { Suspense } from 'react';
import { Accordion } from '../shared/Accordion';
import { JsonLd } from '../shared/JsonLd';
import { MultiCountryCta } from '../shared/MultiCountryCta';
import { PageBanner } from '../shared/PageBanner';
import { QuoteBand } from '../shared/QuoteBand';
import { SectionHeading } from '../shared/SectionHeading';
import { TrustBar } from '../shared/TrustBar';
import { ToursBrowser } from './ToursBrowser';
import type { ImageId } from '@/data/images';
import { toursForStyle } from '@/lib/data';
import { toCardData } from '@/lib/data/cards';
import { getLocale } from '@/i18n/server';
import type { Faq } from '@/data/types';
import { breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';

type Props = {
  style: 'private' | 'small-group';
  path: string;
  title: string;
  lead: string;
  description: string;
  image: ImageId;
  points: { title: string; text: string }[];
  faqs: Faq[];
};

export async function StylePage({ style, path, title, lead, description, image, points, faqs }: Props) {
  const lang = await getLocale();
  const list = toursForStyle(lang, style);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Tour Styles', path: '/tours' },
    { name: title, path },
  ];
  return (
    <>
      <PageBanner title={title} description={lead} image={image} crumbs={crumbs} />
      <TrustBar />
      <section className="section-y">
        <div className="container-x">
          <SectionHeading title={`How ${title.toLowerCase()} work`} />
          <ul className="grid gap-x-10 gap-y-7 md:grid-cols-2">
            {points.map((p) => (
              <li key={p.title}>
                <h3 className="font-sans text-lg font-semibold tracking-normal">{p.title}</h3>
                <p className="text-muted mt-1">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section-y bg-cream-100/60">
        <div className="container-x">
          <SectionHeading title={`Available ${title.toLowerCase()}`} />
          <Suspense fallback={<div className="h-96" aria-hidden />}>
            <ToursBrowser tours={list.map(toCardData)} lockedStyle={style} />
          </Suspense>
        </div>
      </section>
      <section className="section-y">
        <div className="container-x max-w-3xl">
          <SectionHeading title="Questions about this style" />
          <Accordion items={faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
        </div>
      </section>
      <MultiCountryCta />
      <QuoteBand />
      <JsonLd
        data={[
          collectionPageJsonLd(lang, title, path, description),
          itemListJsonLd(
            lang,
            title,
            list.map((t) => ({ name: t.title, path: t.href })),
          ),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

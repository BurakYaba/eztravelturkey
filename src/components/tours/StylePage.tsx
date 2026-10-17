import { Suspense } from 'react';
import { Accordion } from '../shared/Accordion';
import { JsonLd } from '../shared/JsonLd';
import { MultiCountryCta } from '../shared/MultiCountryCta';
import { PageBanner } from '../shared/PageBanner';
import { QuoteBand } from '../shared/QuoteBand';
import { SectionHeading } from '../shared/SectionHeading';
import { TrustBar } from '../shared/TrustBar';
import { browserText } from './browser-text';
import { TourGrid } from './TourGrid';
import { ToursBrowser } from './ToursBrowser';
import type { ImageId } from '@/data/images';
import { availableCountries, toursForStyle } from '@/lib/data';
import { format, getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';
import { breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';

type Props = {
  style: 'private' | 'small-group';
  path: string;
  image: ImageId;
};

/** A tour style page (private, small group). Its words are in the dictionary of the page language. */
export async function StylePage({ style, path, image }: Props) {
  const lang = await getLocale();
  const dictionary = getDictionary(lang);
  const { ui, nav } = dictionary;
  const text = ui.pages.styles[style === 'private' ? 'private' : 'smallGroup'];
  const common = ui.pages.styles;
  const list = await toursForStyle(lang, style);
  const crumbs = [
    { name: nav.home, path: '/' },
    { name: common.crumb, path: '/tours' },
    { name: text.title, path },
  ];
  return (
    <>
      <PageBanner title={text.title} description={text.lead} image={image} crumbs={crumbs} />
      <TrustBar />
      <section className="section-y">
        <div className="container-x">
          <SectionHeading
            title={format(common.how, { title: lang === 'en' ? text.title.toLowerCase() : text.title })}
          />
          <ul className="grid gap-x-10 gap-y-7 md:grid-cols-2">
            {text.points.map((p) => (
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
          <SectionHeading
            title={format(common.available, { title: lang === 'en' ? text.title.toLowerCase() : text.title })}
          />
          <Suspense fallback={<TourGrid tours={list} lang={lang} text={dictionary.card} />}>
            <ToursBrowser
              tours={list}
              lockedStyle={style}
              lang={lang}
              cardText={dictionary.card}
              text={browserText(dictionary, await availableCountries(lang))}
            />
          </Suspense>
        </div>
      </section>
      <section className="section-y">
        <div className="container-x max-w-3xl">
          <SectionHeading title={common.faqTitle} />
          <Accordion items={text.faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
        </div>
      </section>
      <MultiCountryCta />
      <QuoteBand />
      <JsonLd
        data={[
          collectionPageJsonLd(lang, text.title, path, text.description),
          itemListJsonLd(
            lang,
            text.title,
            list.map((t) => ({ name: t.title, path: t.href })),
          ),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}

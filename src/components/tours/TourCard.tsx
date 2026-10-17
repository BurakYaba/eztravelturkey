import { Link } from '@/i18n/link';
import { ArrowRight, Clock, UsersThree } from '@phosphor-icons/react/dist/ssr';
import type { TourCardData } from '@/lib/data/types';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/utils';
import { Picture } from '../shared/Picture';
import { TourPrice } from './TourPrice';

export type TourCardText = Dictionary['card'];

const styleLabel = (styles: string[], text: TourCardText) =>
  styles.length > 1 ? text.either : styles[0] === 'private' ? text.private : text.smallGroup;

export function TourCard({
  tour,
  lang,
  text,
  className,
  priority,
}: {
  tour: TourCardData;
  lang: Locale;
  text: TourCardText;
  className?: string;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        'group border-cream-200 shadow-card hover:shadow-lift relative flex flex-col overflow-hidden rounded-lg border bg-white transition duration-300 hover:-translate-y-1',
        className,
      )}>
      <div className="bg-cream-100 relative aspect-[3/2] overflow-hidden">
        {tour.image && (
          <Picture
            image={tour.image}
            alt=""
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="h-card">
          <Link href={tour.href} className="after:absolute after:inset-0 after:content-['']">
            {tour.title}
          </Link>
        </h3>
        {tour.route.length > 0 && <p className="text-muted mt-2 text-sm">{tour.route.join(', ')}</p>}

        <dl className="text-ink mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{text.duration}</dt>
            <Clock size={17} className="text-gold-600" aria-hidden />
            <dd>{tour.duration}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{text.style}</dt>
            <UsersThree size={17} className="text-gold-600" aria-hidden />
            <dd>{styleLabel(tour.styles, text)}</dd>
          </div>
        </dl>

        <div className="border-cream-200 mt-auto flex items-end justify-between gap-3 border-t pt-4">
          <TourPrice lang={lang} eur={tour.priceEUR} usd={tour.priceUSD} text={text} className="min-w-0" />
          <span className="text-navy-900 inline-flex shrink-0 items-center gap-1.5 font-semibold whitespace-nowrap">
            {text.view}
            <ArrowRight size={16} weight="bold" className="transition group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}

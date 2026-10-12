import { Link } from '@/i18n/link';
import { ArrowRight, Clock, UsersThree } from '@phosphor-icons/react/dist/ssr';
import type { ImageId } from '@/data/images';
import { cn, eur } from '@/lib/utils';
import { Photo } from '../shared/Photo';

export type TourCardData = {
  slug: string;
  title: string;
  subtitle: string;
  route: string[];
  days: number;
  nights: number;
  styles: string[];
  fromPriceEUR: number;
  image: ImageId;
};

const styleLabel = (styles: string[]) =>
  styles.length > 1 ? 'Private or small group' : styles[0] === 'private' ? 'Private' : 'Small group';

export function TourCard({
  tour,
  className,
  priority,
}: {
  tour: TourCardData;
  className?: string;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        'group border-cream-200 shadow-card hover:shadow-lift relative flex flex-col overflow-hidden rounded-lg border bg-white transition duration-300 hover:-translate-y-1',
        className,
      )}>
      <div className="relative aspect-[3/2] overflow-hidden">
        <Photo
          id={tour.image}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="h-card">
          <Link href={`/tours/${tour.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {tour.title}
          </Link>
        </h3>
        <p className="text-gold-700 mt-1 font-medium">{tour.subtitle}</p>
        <p className="text-muted mt-2 text-sm">{tour.route.join(', ')}</p>

        <dl className="text-ink mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Duration</dt>
            <Clock size={17} className="text-gold-600" aria-hidden />
            <dd>
              {tour.nights} nights, {tour.days} days
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Style</dt>
            <UsersThree size={17} className="text-gold-600" aria-hidden />
            <dd>{styleLabel(tour.styles)}</dd>
          </div>
        </dl>

        <div className="border-cream-200 mt-auto flex items-end justify-between gap-3 border-t pt-4">
          <p className="leading-tight">
            <span className="text-muted block text-xs">From</span>
            <span className="font-display text-navy-900 text-2xl font-semibold">{eur(tour.fromPriceEUR)}</span>
            <span className="text-muted text-sm"> per person</span>
          </p>
          <span className="text-navy-900 inline-flex items-center gap-1.5 font-semibold">
            View itinerary
            <ArrowRight size={16} weight="bold" className="transition group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}

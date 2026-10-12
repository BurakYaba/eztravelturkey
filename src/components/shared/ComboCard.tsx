import { Link } from '@/i18n/link';
import { ArrowRight, Clock } from '@phosphor-icons/react/dist/ssr';
import type { Combo } from '@/data/types';
import { cn, eur } from '@/lib/utils';
import { Photo } from './Photo';

export function ComboCard({ combo, className }: { combo: Combo; className?: string }) {
  return (
    <article
      className={cn(
        'group border-cream-200 shadow-card hover:shadow-lift relative flex flex-col overflow-hidden rounded-lg border bg-white transition duration-300 hover:-translate-y-1',
        className,
      )}>
      <div className="grid aspect-[3/2] grid-cols-2 overflow-hidden">
        <div className="relative">
          <Photo
            id={combo.image}
            sizes="(min-width: 1024px) 190px, 40vw"
            className="transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="relative">
          <Photo
            id={combo.image2}
            sizes="(min-width: 1024px) 190px, 40vw"
            className="transition duration-500 group-hover:scale-105"
          />
        </div>
        <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-white" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="h-card">
          <Link href={`/multi-country-tours/${combo.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {combo.name} Tours
          </Link>
        </h3>
        <p className="text-ink mt-1 flex items-center gap-1.5 text-sm">
          <Clock size={17} className="text-gold-600" aria-hidden />
          {combo.daysMin} to {combo.daysMax} days
        </p>
        <p className="text-muted mt-2 text-sm">
          {combo.route.slice(0, 6).join(', ')}
          {combo.route.length > 6 ? ' and more' : ''}
        </p>
        <div className="border-cream-200 mt-auto flex items-end justify-between gap-3 border-t pt-4">
          <p className="leading-tight">
            <span className="text-muted block text-xs">From</span>
            <span className="font-display text-navy-900 text-2xl font-semibold">{eur(combo.fromPriceEUR)}</span>
            <span className="text-muted text-sm"> per person</span>
          </p>
          <span className="text-navy-900 inline-flex items-center gap-1.5 font-semibold">
            View route
            <ArrowRight size={16} weight="bold" className="transition group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}

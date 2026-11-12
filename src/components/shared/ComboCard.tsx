import { Link } from '@/i18n/link';
import { ArrowRight, Clock } from '@phosphor-icons/react/dist/ssr';
import type { CardRecord } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { getDictionaryForPage } from '@/i18n/server';
import { Picture } from './Picture';

/** A multi-country combination, from the card the old site showed for it. */
export async function ComboCard({
  combo,
  className,
  sizes = '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw',
  quality,
}: {
  combo: CardRecord;
  className?: string;
  /** The picture's `sizes`: a card in a narrow rail is narrower than the screen. */
  sizes?: string;
  quality?: number;
}) {
  const { card, ui } = await getDictionaryForPage();
  return (
    <article
      className={cn(
        'group border-cream-200 shadow-card hover:shadow-lift relative flex flex-col overflow-hidden rounded-lg border bg-white transition duration-300 hover:-translate-y-1',
        className,
      )}>
      <div className="bg-cream-100 relative aspect-[3/2] overflow-hidden">
        {combo.image && (
          <Picture
            image={combo.image}
            alt=""
            sizes={sizes}
            quality={quality}
            className="transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="h-card">
          <Link href={combo.href} className="after:absolute after:inset-0 after:content-['']">
            {combo.title}
          </Link>
        </h3>
        {combo.meta[0] && (
          <p className="text-ink mt-2 flex items-center gap-1.5 text-sm">
            <Clock size={17} className="text-gold-600" aria-hidden />
            {combo.meta[0]}
          </p>
        )}
        <div className="border-cream-200 mt-auto flex items-end justify-between gap-3 border-t pt-4">
          <p className="leading-tight">
            {combo.price && (
              <>
                <span className="text-muted block text-xs">{card.from}</span>
                <span className="font-display text-navy-900 text-2xl font-semibold">{combo.price}</span>
                <span className="text-muted text-sm"> {card.perPerson}</span>
              </>
            )}
          </p>
          <span className="text-navy-900 inline-flex items-center gap-1.5 font-semibold">
            {ui.combo.view}
            <ArrowRight size={16} weight="bold" className="transition group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}

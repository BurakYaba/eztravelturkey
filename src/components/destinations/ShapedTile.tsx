import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import type { ImageId } from '@/data/images';
import type { CountryId } from '@/data/types';
import { cn } from '@/lib/utils';
import { Photo } from '../shared/Photo';

type Props = {
  href: string;
  title: string;
  note: string;
  image: ImageId;
  country: CountryId;
  className?: string;
  sizes?: string;
  /** Soft shadow color behind the cut-out shape (CSS color). */
  shadow?: string;
};

// Horseshoe arches narrow toward the base, so their caption needs more side room.
const captionInset: Partial<Record<CountryId, string>> = { morocco: 'inset-x-[14%]' };

/**
 * Tile whose outline follows the architecture of its destination: pointed Ottoman arch, Doric pediment,
 * stepped pyramid, Nabataean merlons or Moroccan horseshoe arch. The outline is an SVG used as a mask,
 * so the shadow is applied on a wrapper with drop-shadow.
 */
export function ShapedTile({
  href,
  title,
  note,
  image,
  country,
  className,
  sizes = '(min-width: 1024px) 24vw, 50vw',
  shadow = 'rgb(0 0 0 / 0.35)',
}: Props) {
  const mask = `url(/ornaments/shape-${country}.svg)`;
  return (
    <div className={cn('group @container', className)} style={{ filter: `drop-shadow(0 14px 18px ${shadow})` }}>
      <Link
        href={href}
        className="bg-navy-900 relative block aspect-[4/5] overflow-hidden transition duration-300 group-hover:-translate-y-1"
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}>
        <Photo id={image} sizes={sizes} className="transition duration-700 group-hover:scale-105" />
        <span
          aria-hidden
          className="from-navy-950/90 via-navy-950/25 absolute inset-0 bg-gradient-to-t to-transparent"
        />
        <span
          className={cn(
            'absolute bottom-0 flex items-end justify-between gap-2 p-3 @[15rem]:p-5',
            captionInset[country] ?? 'inset-x-0',
          )}>
          <span className="min-w-0">
            <span className="font-display block text-lg leading-tight font-semibold text-white @[15rem]:text-2xl">
              {title}
            </span>
            <span className="mt-1 hidden text-sm text-white/90 @[15rem]:line-clamp-3 @[15rem]:block">{note}</span>
          </span>
          <span className="group-hover:bg-gold-600 hidden size-9 shrink-0 place-items-center rounded-lg bg-white/15 text-white backdrop-blur-sm transition @[15rem]:grid">
            <ArrowRight size={18} weight="bold" aria-hidden />
          </span>
        </span>
      </Link>
    </div>
  );
}

import { Link } from '@/i18n/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import type { ImageId } from '@/data/images';
import { cn } from '@/lib/utils';
import { Photo } from './Photo';

type Props = {
  href: string;
  title: string;
  note: string;
  image: ImageId;
  className?: string;
  sizes?: string;
};

export function DestinationTile({
  href,
  title,
  note,
  image,
  className,
  sizes = '(min-width: 1024px) 200px, 50vw',
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'group bg-navy-900 shadow-card hover:shadow-lift @container relative block aspect-[3/4] overflow-hidden rounded-lg transition duration-300 hover:-translate-y-1',
        className,
      )}>
      <Photo id={image} sizes={sizes} className="transition duration-700 group-hover:scale-105" />
      <span aria-hidden className="from-navy-950/90 via-navy-950/25 absolute inset-0 bg-gradient-to-t to-transparent" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 @[15rem]:p-4">
        <span className="min-w-0">
          <span className="font-display block text-lg leading-tight font-semibold text-white @[15rem]:text-2xl">
            {title}
          </span>
          <span className="mt-1 hidden text-sm text-white/85 @[15rem]:block">{note}</span>
        </span>
        <span className="group-hover:bg-gold-600 hidden size-9 shrink-0 place-items-center rounded-lg bg-white/15 text-white backdrop-blur-sm transition @[15rem]:grid">
          <ArrowRight size={18} weight="bold" aria-hidden />
        </span>
      </span>
    </Link>
  );
}

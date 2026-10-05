import type { CSSProperties } from 'react';
import type { CountryId } from '@/data/types';
import { cn } from '@/lib/utils';

type Kind = 'tile' | 'band' | 'skyline';

type Props = {
  country: CountryId;
  kind: Kind;
  color: string;
  className?: string;
  /** Pixel height for bands, any CSS length for skylines. Ignored for tiles. */
  height?: string | number;
  /** Tile edge length in px (tiles only). */
  tileSize?: number;
  opacity?: number;
  style?: CSSProperties;
};

/**
 * Draws one of the SVG ornaments from public/ornaments in a flat color by using it as a CSS mask.
 * Purely decorative, so it is hidden from assistive technology.
 */
export function Ornament({ country, kind, color, className, height, tileSize = 72, opacity, style }: Props) {
  const url = `url(/ornaments/${country}-${kind}.svg)`;
  const size = kind === 'tile' ? `${tileSize}px ${tileSize}px` : 'auto 100%';
  const repeat = kind === 'tile' ? 'repeat' : 'repeat-x';
  const position = kind === 'tile' ? '0 0' : kind === 'skyline' ? '40% 100%' : 'center';
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none', className)}
      style={{
        backgroundColor: color,
        opacity,
        height: kind === 'tile' ? undefined : height,
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: size,
        WebkitMaskSize: size,
        maskRepeat: repeat,
        WebkitMaskRepeat: repeat,
        maskPosition: position,
        WebkitMaskPosition: position,
        ...style,
      }}
    />
  );
}

/** Short centered frieze that sits above a section heading. */
export function OrnamentRule({ country, color, className }: { country: CountryId; color: string; className?: string }) {
  return (
    <Ornament
      country={country}
      kind="band"
      color={color}
      height={34}
      className={cn('mx-auto mb-5 w-56 max-w-full', className)}
    />
  );
}

import type { ReactNode } from 'react';
import type { Destination } from '@/data/types';
import type { DestinationTheme } from '@/data/destination-themes';
import { Breadcrumbs, type Crumb } from '../shared/Breadcrumbs';
import { Photo } from '../shared/Photo';
import { Ornament } from './Ornament';

type Props = {
  destination: Destination;
  theme: DestinationTheme;
  crumbs: Crumb[];
  actions?: ReactNode;
};

/** Skyline height shared by the hero padding and the silhouette so the text never sits on the rooftops. */
const SKYLINE = 'clamp(96px, 11.6vw, 280px)';

/**
 * Destination page header: text from the left edge, photo bleeding in from the right, a tile pattern faintly
 * behind the copy, and the destination's skyline rising along the bottom in the next section's color.
 */
export function DestinationHero({ destination: d, theme, crumbs, actions }: Props) {
  return (
    <section className="bg-cream-50 relative isolate overflow-hidden">
      <div className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[68%]">
        <Photo id={d.heroImage} sizes="(min-width: 1024px) 68vw, 100vw" priority />
        <div aria-hidden className="bg-cream-50/80 absolute inset-0 lg:hidden" />
        <div aria-hidden className="fade-left absolute inset-0 hidden lg:block" />
      </div>

      <Ornament
        country={d.id}
        kind="tile"
        color={theme.ink}
        tileSize={theme.tileSize}
        opacity={0.1}
        className="absolute inset-y-0 left-0 -z-10 w-full [mask-composite:intersect] lg:w-[48%]"
        style={{
          maskImage: `url(/ornaments/${d.id}-tile.svg), linear-gradient(90deg, #000 20%, transparent 100%)`,
          WebkitMaskImage: `url(/ornaments/${d.id}-tile.svg), linear-gradient(90deg, #000 20%, transparent 100%)`,
          maskSize: `${theme.tileSize}px ${theme.tileSize}px, 100% 100%`,
          WebkitMaskSize: `${theme.tileSize}px ${theme.tileSize}px, 100% 100%`,
          maskRepeat: 'repeat, no-repeat',
          WebkitMaskRepeat: 'repeat, no-repeat',
          maskPosition: '0 0, 0 0',
          WebkitMaskPosition: '0 0, 0 0',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      />

      <div className="container-wide pt-10 md:pt-14" style={{ paddingBottom: `calc(${SKYLINE} + 1.5rem)` }}>
        <Breadcrumbs items={crumbs} className="mb-6" />
        <div className="max-w-xl">
          <p className="eyebrow" style={{ color: theme.ink }}>
            {theme.eyebrow}
          </p>
          <h1 className="h-display mt-3">{d.name} Tours</h1>
          <p className="text-ink/85 mt-4 text-lg">{d.summary}</p>
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>

      <Ornament
        country={d.id}
        kind="skyline"
        color={theme.deep}
        height={SKYLINE}
        className="absolute inset-x-0 bottom-[-1px]"
      />
    </section>
  );
}

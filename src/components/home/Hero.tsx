import { ButtonLink } from '../shared/Button';
import { HeroImage } from './HeroImage';
import { SearchBar } from './SearchBar';

export function Hero() {
  return (
    <>
      <section className="bg-cream-50 relative isolate overflow-hidden">
        {/* Photo: a block above the text on phones, the full background from md up. */}
        <div className="relative h-60 sm:h-72 md:absolute md:inset-0 md:h-auto">
          <HeroImage />
          <div
            aria-hidden
            className="from-cream-50 md:fade-left absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
          />
        </div>

        <div className="container-wide relative pt-6 pb-24 md:flex md:min-h-[540px] md:items-center md:pt-20 md:pb-28 lg:min-h-[600px]">
          <div className="max-w-xl">
            <p className="eyebrow rise" style={{ '--d': 50 } as React.CSSProperties}>
              Turkey, Greece, Egypt, Jordan, Morocco
            </p>
            <h1 className="h-display rise mt-3" style={{ '--d': 120 } as React.CSSProperties}>
              Journeys Worth Remembering
            </h1>
            <p className="rise text-ink/85 mt-4 text-lg md:text-xl" style={{ '--d': 200 } as React.CSSProperties}>
              Thoughtfully designed private, small group and <span className="whitespace-nowrap">multi-country</span>{' '}
              tours.
            </p>
            <div className="rise mt-7 flex flex-wrap gap-3" style={{ '--d': 280 } as React.CSSProperties}>
              <ButtonLink href="/tours" size="lg" arrow>
                Explore Tours
              </ButtonLink>
              <ButtonLink href="/plan-my-trip" size="lg" variant="secondary">
                Plan My Trip
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
      <SearchBar />
    </>
  );
}

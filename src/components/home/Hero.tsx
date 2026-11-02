import { availableCountries } from '@/lib/data';
import { getDictionaryForPage, getLocale } from '@/i18n/server';
import { ButtonLink } from '../shared/Button';
import { HeroImage } from './HeroImage';
import { SearchBar } from './SearchBar';

/**
 * `title` is the H1 and `text` the paragraph under it, both typed in the home page document in the Studio; without them the
 * dictionary's words are shown.
 */
export async function Hero({ title, text }: { title?: string; text?: string }) {
  const { ui, countries } = await getDictionaryForPage();
  const available = await availableCountries(await getLocale());
  const t = ui.home.hero;
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
          <div className="max-w-2xl">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="h-display mt-3">{title ?? t.title}</h1>
            <p className="text-ink/85 mt-4 max-w-xl text-lg md:text-xl">{text || t.text}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/tours" size="lg" arrow>
                {t.explore}
              </ButtonLink>
              <ButtonLink href="/plan-my-trip" size="lg" variant="secondary">
                {t.plan}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
      <SearchBar text={ui.home.search} countries={available.map((id) => ({ id, name: countries[id].name }))} />
    </>
  );
}

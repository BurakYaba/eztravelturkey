import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { ButtonLink } from '@/components/shared/Button';
import { Link } from '@/i18n/link';
import { getLocale } from '@/i18n/server';
import { getDictionary } from '@/i18n/dictionaries';

/** The 404 page of every language: says what happened, offers search and the main ways forward. */
export default async function NotFound() {
  const lang = await getLocale();
  const dict = getDictionary(lang);
  const t = dict.notFound;
  const popular = [
    { label: dict.nav.destinations, href: '/destinations' },
    { label: dict.nav.allTours, href: '/tours' },
    { label: dict.nav.multiCountry, href: '/multi-country-tours' },
    { label: dict.nav.travelGuides, href: '/blog' },
    { label: dict.nav.contact, href: '/contact' },
  ];
  return (
    <section className="container-x flex min-h-[60dvh] flex-col items-start justify-center py-20">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="h-display mt-3 max-w-xl">{t.title}</h1>
      <p className="text-muted mt-4 max-w-lg text-lg">{t.text}</p>

      <form action={`/${lang}/search/`} method="get" role="search" className="mt-7 flex w-full max-w-lg gap-3">
        <label htmlFor="not-found-search" className="sr-only">
          {dict.search.placeholder}
        </label>
        <input
          id="not-found-search"
          name="q"
          type="search"
          placeholder={dict.search.placeholder}
          className="border-navy-900/30 text-ink placeholder:text-muted/80 focus:border-navy-900 focus:ring-gold-500/50 h-12 w-full rounded-lg border bg-white px-4 text-[0.97rem] focus:ring-2 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-navy-900 hover:bg-navy-800 inline-flex h-12 shrink-0 items-center gap-2 rounded-lg px-5 font-semibold text-white">
          <MagnifyingGlass size={18} weight="bold" aria-hidden />
          {dict.search.button}
        </button>
      </form>

      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink href="/tours" size="lg" arrow>
          {t.tours}
        </ButtonLink>
        <ButtonLink href="/" size="lg" variant="secondary">
          {t.home}
        </ButtonLink>
      </div>

      <h2 className="mt-10 font-sans text-sm font-semibold tracking-[0.14em] uppercase">{t.popular}</h2>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {popular.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-navy-900 font-medium underline underline-offset-4">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

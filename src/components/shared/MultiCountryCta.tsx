import { Link } from '@/i18n/link';
import { ArrowRight, Compass } from '@phosphor-icons/react/dist/ssr';
import { getLocale } from '@/i18n/server';
import { comboCards } from '@/lib/data';
import { ButtonLink } from './Button';
import { Picture } from './Picture';

/** Cross-sell for visitors browsing single-country tours. */
export async function MultiCountryCta() {
  const picks = (await comboCards(await getLocale())).slice(0, 3);
  return (
    <section className="section-y bg-cream-100/70">
      <div className="container-x grid items-center gap-8 lg:grid-cols-[1.1fr_2fr_auto]">
        <div>
          <h2 className="h-section">Planning more than one country?</h2>
          <p className="text-muted mt-3">
            Combine destinations and see even more with our multi-country tours, or let us design a journey just for
            you.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {picks.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="group border-cream-200 shadow-card hover:shadow-lift block overflow-hidden rounded-lg border bg-white transition hover:-translate-y-1">
                <div className="bg-cream-100 relative aspect-[16/9]">
                  {c.image && (
                    <Picture
                      image={c.image}
                      sizes="(min-width: 640px) 220px, 100vw"
                      className="transition duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="text-navy-900 flex items-center justify-between gap-2 p-3 font-semibold">
                  {c.title}
                  <ArrowRight size={16} weight="bold" aria-hidden className="transition group-hover:translate-x-1" />
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <ButtonLink href="/plan-my-trip" size="lg" className="lg:self-center">
          <Compass size={20} aria-hidden />
          Plan a Custom Trip
        </ButtonLink>
      </div>
    </section>
  );
}

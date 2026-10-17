import { Clock, EnvelopeSimple } from '@phosphor-icons/react/dist/ssr';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';
import { teamMembers } from '@/lib/data';
import { Picture } from './Picture';
import { SectionHeading } from './SectionHeading';

/**
 * The people behind the site: portrait, role, email and working hours. They come from Studio ("Team"), so the client
 * can add or change them without a developer. With nobody entered the block leaves itself out.
 */
export async function TeamBlock({ className }: { className?: string }) {
  const lang = await getLocale();
  const { team: t } = getDictionary(lang);
  const people = await teamMembers(lang);
  if (people.length === 0) {
    return null;
  }
  return (
    <section className={className ?? 'section-y'}>
      <div className="container-x">
        <SectionHeading title={t.title} description={t.text} />
        <ul className="grid gap-6 md:grid-cols-2 lg:max-w-5xl">
          {people.map((person) => (
            <li
              key={person.name}
              className="border-cream-200 shadow-card flex gap-5 rounded-lg border bg-white p-4 sm:p-5">
              {person.photo && (
                <div className="bg-cream-100 relative aspect-4/5 w-28 shrink-0 self-start overflow-hidden rounded-lg sm:w-32">
                  <Picture image={person.photo} sizes="128px" quality={85} />
                </div>
              )}
              <div className="min-w-0 self-center">
                <h3 className="text-2xl">{person.name}</h3>
                {person.role && <p className="text-gold-700 mt-0.5 font-semibold">{person.role}</p>}
                <ul className="mt-4 space-y-2 text-[0.95rem]">
                  {person.hours && (
                    <li className="flex gap-2.5">
                      <Clock size={20} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                      <span className="text-ink">
                        <span className="sr-only">{t.hours}: </span>
                        {person.hours}
                        {person.timezone && <span className="text-muted block text-sm">{person.timezone}</span>}
                      </span>
                    </li>
                  )}
                  {person.email && (
                    <li className="flex gap-2.5">
                      <EnvelopeSimple size={20} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                      <span className="min-w-0">
                        <span className="sr-only">{t.email}: </span>
                        <a
                          href={`mailto:${person.email}`}
                          className="text-navy-900 font-semibold break-all underline decoration-gold-500/60 underline-offset-4">
                          {person.email}
                        </a>
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

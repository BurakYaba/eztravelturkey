import { CalendarCheck, Headset, ShieldCheck, Star, UsersThree } from '@phosphor-icons/react/dist/ssr';
import { site } from '@/data/site';
import { format } from '@/i18n/dictionaries';
import { getDictionaryForPage } from '@/i18n/server';
import { cn } from '@/lib/utils';

export async function TrustBar({ className, notes = false }: { className?: string; notes?: boolean }) {
  const { ui } = await getDictionaryForPage();
  const t = ui.trust;
  const items = [
    {
      icon: CalendarCheck,
      label: format(t.since, { year: site.founded }),
      note: format(t.years, { years: site.stats.years }),
    },
    { icon: Star, label: format(t.rating, { rating: site.stats.rating }), note: t.ratingNote },
    { icon: ShieldCheck, label: t.licensed, note: format(t.license, { no: site.licenseNo }) },
    { icon: UsersThree, label: format(t.travelers, { count: site.stats.travelers }), note: t.travelersNote },
    { icon: Headset, label: t.support, note: t.supportNote },
  ];
  return (
    <section aria-label={t.label} className={cn('border-cream-200 bg-cream-100/70 border-y', className)}>
      <div className="container-x">
        <ul className="lg:divide-cream-200 grid grid-cols-2 gap-x-4 gap-y-5 py-5 md:grid-cols-3 lg:grid-cols-5 lg:divide-x">
          {items.map(({ icon: Icon, label, note }) => (
            <li
              key={label}
              className="flex items-center gap-3 lg:justify-center lg:px-3 [&:last-child]:col-span-2 md:[&:last-child]:col-span-1">
              <Icon size={30} weight="regular" className="text-gold-600 shrink-0" aria-hidden />
              <span className="leading-tight">
                <span className="text-navy-900 block text-[0.95rem] font-semibold">{label}</span>
                {notes && <span className="text-muted block text-sm">{note}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

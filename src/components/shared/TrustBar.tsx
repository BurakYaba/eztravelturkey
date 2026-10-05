import { CalendarCheck, Headset, ShieldCheck, Star, UsersThree } from '@phosphor-icons/react/dist/ssr';
import { site } from '@/data/site';
import { cn } from '@/lib/utils';

const items = [
  { icon: CalendarCheck, label: `Since ${site.founded}`, note: `Trusted for over ${site.stats.years} years` },
  { icon: Star, label: `${site.stats.rating} on Tripadvisor`, note: 'Excellent traveler reviews' },
  { icon: ShieldCheck, label: 'Licensed Tour Operator', note: `License No. ${site.licenseNo}` },
  { icon: UsersThree, label: `${site.stats.travelers} Travelers`, note: 'From around the world' },
  { icon: Headset, label: '24/7 Local Support', note: 'While you travel' },
];

export function TrustBar({ className, notes = false }: { className?: string; notes?: boolean }) {
  return (
    <section aria-label="Why travelers trust us" className={cn('border-cream-200 bg-cream-100/70 border-y', className)}>
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

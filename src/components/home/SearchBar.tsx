'use client';

import { useRouter } from 'next/navigation';
import { useId, type FormEvent, type ReactNode } from 'react';
import { CalendarBlank, CaretDown, Compass, MapPin, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { useLocale } from '@/i18n/locale-context';
import { localizeHref } from '@/i18n/paths';
import { multiCountryHref } from '@/i18n/public-paths';
import { Button } from '../shared/Button';

function Select({
  label,
  icon,
  id,
  name,
  children,
}: {
  label: string;
  icon: ReactNode;
  id: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-1 lg:px-4">
      <span className="text-gold-500" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="text-gold-100 block text-xs font-semibold tracking-wide">
          {label}
        </label>
        <div className="relative">
          <select
            id={id}
            name={name}
            className="[&>option]:text-ink min-h-11 w-full cursor-pointer appearance-none truncate bg-transparent py-2 pr-6 text-base font-medium text-white focus:outline-none">
            {children}
          </select>
          <CaretDown
            size={14}
            weight="bold"
            aria-hidden
            className="text-gold-100 pointer-events-none absolute top-1/2 right-0 -translate-y-1/2"
          />
        </div>
      </div>
    </div>
  );
}

type Text = {
  label: string;
  destination: string;
  destinationAny: string;
  multi: string;
  style: string;
  styleAny: string;
  private: string;
  smallGroup: string;
  duration: string;
  durationAny: string;
  d35: string;
  d69: string;
  d10: string;
  button: string;
};

/** Sends visitors to the tours listing with filters already applied. The words come from the server in the page language. */
export function SearchBar({ text, countries }: { text: Text; countries: { id: string; name: string }[] }) {
  const router = useRouter();
  const lang = useLocale();
  const uid = useId();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const destination = String(data.get('destination') ?? '');
    if (destination === 'multi') {
      router.push(localizeHref(lang, multiCountryHref(lang)));
      return;
    }
    const params = new URLSearchParams();
    for (const key of ['destination', 'style', 'duration']) {
      const value = String(data.get(key) ?? '');
      if (value) {
        params.set(key, value);
      }
    }
    router.push(localizeHref(lang, `/tours${params.size ? `?${params}` : ''}`));
  }

  return (
    <div className="container-wide relative z-10 -mt-14 md:-mt-16">
      <form
        onSubmit={onSubmit}
        aria-label={text.label}
        className="bg-navy-900 shadow-lift mx-auto grid max-w-[74rem] gap-4 rounded-lg p-4 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center lg:divide-x lg:divide-white/15 lg:p-5">
        <Select label={text.destination} id={`${uid}-d`} name="destination" icon={<MapPin size={26} />}>
          <option value="">{text.destinationAny}</option>
          {countries.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
          <option value="multi">{text.multi}</option>
        </Select>
        <Select label={text.style} id={`${uid}-s`} name="style" icon={<Compass size={26} />}>
          <option value="">{text.styleAny}</option>
          <option value="private">{text.private}</option>
          <option value="small-group">{text.smallGroup}</option>
        </Select>
        <Select label={text.duration} id={`${uid}-t`} name="duration" icon={<CalendarBlank size={26} />}>
          <option value="">{text.durationAny}</option>
          <option value="3-5">{text.d35}</option>
          <option value="6-9">{text.d69}</option>
          <option value="10+">{text.d10}</option>
        </Select>
        <Button type="submit" size="lg" className="sm:col-span-3 lg:col-span-1 lg:ml-3">
          <MagnifyingGlass size={20} weight="bold" aria-hidden />
          {text.button}
        </Button>
      </form>
    </div>
  );
}

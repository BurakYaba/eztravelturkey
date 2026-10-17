'use client';

import { useRouter } from 'next/navigation';
import { useId, type FormEvent, type ReactNode } from 'react';
import { CalendarBlank, CaretDown, Compass, MapPin, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { destinations } from '@/data/destinations';
import { useLocale } from '@/i18n/locale-context';
import { localizeHref } from '@/i18n/paths';
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

/** Sends visitors to the tours listing with filters already applied. */
export function SearchBar() {
  const router = useRouter();
  const lang = useLocale();
  const uid = useId();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const destination = String(data.get('destination') ?? '');
    if (destination === 'multi') {
      router.push(localizeHref(lang, '/multi-country-tours'));
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
        aria-label="Find a tour"
        className="bg-navy-900 shadow-lift mx-auto grid max-w-[74rem] gap-4 rounded-lg p-4 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center lg:divide-x lg:divide-white/15 lg:p-5">
        <Select label="Destination" id={`${uid}-d`} name="destination" icon={<MapPin size={26} />}>
          <option value="">Where would you like to go?</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
          <option value="multi">Multi-country tours</option>
        </Select>
        <Select label="Travel style" id={`${uid}-s`} name="style" icon={<Compass size={26} />}>
          <option value="">Any style</option>
          <option value="private">Private</option>
          <option value="small-group">Small group</option>
        </Select>
        <Select label="Duration" id={`${uid}-t`} name="duration" icon={<CalendarBlank size={26} />}>
          <option value="">Any duration</option>
          <option value="3-5">3 to 5 days</option>
          <option value="6-9">6 to 9 days</option>
          <option value="10+">10 days or more</option>
        </Select>
        <Button type="submit" size="lg" className="sm:col-span-3 lg:col-span-1 lg:ml-3">
          <MagnifyingGlass size={20} weight="bold" aria-hidden />
          Search Tours
        </Button>
      </form>
    </div>
  );
}

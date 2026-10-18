'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useId, useMemo, type ReactNode } from 'react';
import { ArrowCounterClockwise, CalendarBlank, CaretDown, Compass, MapPin } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { ButtonLink } from '../shared/Button';
import type { TourCardData } from '@/lib/data/types';
import type { Locale } from '@/i18n/config';
import { TourCard, type TourCardText } from './TourCard';

export type BrowsableTour = TourCardData;

function Filter({
  label,
  icon,
  id,
  value,
  onChange,
  children,
}: {
  label: string;
  icon: ReactNode;
  id: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="text-gold-600 pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2" aria-hidden>
        {icon}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-navy-900/30 text-navy-900 focus:border-navy-900 focus:ring-gold-500/50 h-12 w-full cursor-pointer appearance-none rounded-lg border bg-white pr-9 pl-11 text-[0.97rem] font-medium focus:ring-2 focus:outline-none">
        {children}
      </select>
      <CaretDown
        size={14}
        weight="bold"
        aria-hidden
        className="text-navy-900 pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2"
      />
    </div>
  );
}

type Props = {
  tours: BrowsableTour[];
  /** Fixes one filter (for example the style pages), hiding that control. */
  lockedStyle?: 'private' | 'small-group';
  /** The list is already one country's tours (a country page): no destination filter and no country tabs. */
  singleCountry?: boolean;
  lang: Locale;
  /** Card texts in the page language, passed from the server so the client does not carry every dictionary. */
  cardText: TourCardText;
  /** The words of the filters and the country names, in the page language. */
  text: BrowserText;
};

export type BrowserText = {
  allTours: string;
  destination: string;
  allDestinations: string;
  style: string;
  anyStyle: string;
  privateOption: string;
  smallOption: string;
  privateTours: string;
  smallTours: string;
  duration: string;
  anyDuration: string;
  d35: string;
  d69: string;
  d10: string;
  reset: string;
  tour: string;
  tours: string;
  filterByCountry: string;
  emptyTitle: string;
  emptyText: string;
  planButton: string;
  countries: { id: string; name: string }[];
};

export function ToursBrowser({ tours, lockedStyle, singleCountry = false, lang, cardText, text }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const uid = useId();

  const destination = search.get('destination') ?? '';
  const style = lockedStyle ?? search.get('style') ?? '';
  const duration = search.get('duration') ?? '';

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(search.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false });
  };

  const results = useMemo(
    () =>
      tours.filter(
        (t) =>
          (!destination || (t.countries as string[]).includes(destination)) &&
          (!style || (t.styles as string[]).includes(style)) &&
          (!duration || t.bucket === duration),
      ),
    [tours, destination, style, duration],
  );

  const filtered = Boolean(destination || duration || (!lockedStyle && style));
  const tabs = [{ id: '', name: text.allTours }, ...text.countries];

  return (
    <div>
      <div
        className={cn(
          'grid gap-3 md:items-center',
          singleCountry ? 'md:grid-cols-[1fr_1fr_auto]' : 'md:grid-cols-[1fr_1fr_1fr_auto]',
        )}>
        {!singleCountry && (
          <Filter
            label={text.destination}
            id={`${uid}-d`}
            icon={<MapPin size={20} />}
            value={destination}
            onChange={(v) => setParam('destination', v)}>
            <option value="">{text.allDestinations}</option>
            {text.countries.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Filter>
        )}
        {lockedStyle ? (
          <div className="border-cream-200 bg-cream-100 text-navy-900 flex h-12 items-center gap-3 rounded-lg border px-3.5 font-medium">
            <Compass size={20} className="text-gold-600" aria-hidden />
            {lockedStyle === 'private' ? text.privateTours : text.smallTours}
          </div>
        ) : (
          <Filter
            label={text.style}
            id={`${uid}-s`}
            icon={<Compass size={20} />}
            value={style}
            onChange={(v) => setParam('style', v)}>
            <option value="">{text.anyStyle}</option>
            <option value="private">{text.privateOption}</option>
            <option value="small-group">{text.smallOption}</option>
          </Filter>
        )}
        <Filter
          label={text.duration}
          id={`${uid}-t`}
          icon={<CalendarBlank size={20} />}
          value={duration}
          onChange={(v) => setParam('duration', v)}>
          <option value="">{text.anyDuration}</option>
          <option value="3-5">{text.d35}</option>
          <option value="6-9">{text.d69}</option>
          <option value="10+">{text.d10}</option>
        </Filter>
        <div className="flex items-center gap-4 md:pl-3">
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            disabled={!filtered}
            className="text-navy-900 inline-flex min-h-11 items-center gap-1.5 font-semibold underline underline-offset-4 disabled:pointer-events-none disabled:opacity-40">
            <ArrowCounterClockwise size={16} weight="bold" aria-hidden />
            {text.reset}
          </button>
          <p className="text-muted whitespace-nowrap" aria-live="polite">
            <strong className="text-navy-900">{results.length}</strong> {results.length === 1 ? text.tour : text.tours}
          </p>
        </div>
      </div>

      {!singleCountry && (
        <div
          role="tablist"
          aria-label={text.filterByCountry}
          className="no-scrollbar border-cream-200 mt-8 flex gap-1 overflow-x-auto border-b">
          {tabs.map((tab) => {
            const active = destination === tab.id;
            return (
              <button
                key={tab.id || 'all'}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setParam('destination', tab.id)}
                className={cn(
                  'font-display -mb-px shrink-0 border-b-2 px-4 py-3 text-lg font-semibold transition',
                  active ? 'border-gold-600 text-gold-700' : 'text-navy-900 hover:text-gold-700 border-transparent',
                )}>
                {tab.name}
              </button>
            );
          })}
        </div>
      )}

      {results.length > 0 ? (
        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((tour, i) => (
            <li key={tour.href}>
              <TourCard tour={tour} lang={lang} text={cardText} className="h-full" priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-cream-200 shadow-card mt-8 rounded-lg border bg-white p-8 text-center md:p-12">
          <h2 className="text-2xl">{text.emptyTitle}</h2>
          <p className="text-muted mx-auto mt-2 max-w-lg">{text.emptyText}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/plan-my-trip" arrow>
              {text.planButton}
            </ButtonLink>
            <button
              type="button"
              onClick={() => router.replace(pathname, { scroll: false })}
              className="border-navy-900/25 text-navy-900 hover:border-navy-900 h-11 rounded-lg border bg-white px-5 font-semibold">
              {text.reset}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

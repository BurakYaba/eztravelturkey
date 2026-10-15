'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { CaretDown } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { useActiveTab } from './TourTabs';

type Props = {
  id: string;
  label: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * One section of a tour page. From lg up it is a tab panel: only the selected tab's panel is shown. Below lg the same
 * content is an accordion panel, so nine sections stay easy to scan with a thumb instead of a cramped tab strip.
 */
export function TourPanel({ id, label, defaultOpen = false, className, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  const tabs = useActiveTab();
  const selected = !tabs || tabs.active === id;

  // A link to #itinerary (and so on) should land on an open panel.
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === `#${id}`) {
        setOpen(true);
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [id]);

  return (
    <section
      id={id}
      className={cn(
        'max-lg:border-cream-200 max-lg:mt-3 max-lg:rounded-lg max-lg:border max-lg:bg-white lg:pt-10',
        !selected && 'lg:hidden',
        open && 'max-lg:border-gold-500/60 max-lg:shadow-card',
        className,
      )}>
      <h2 className="font-display text-navy-900 text-xl leading-snug lg:hidden">
        <button
          type="button"
          id={`${uid}-button`}
          aria-expanded={open}
          aria-controls={`${uid}-panel`}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 rounded-lg px-4 py-4 text-left">
          {label}
          <CaretDown
            size={20}
            weight="bold"
            aria-hidden
            className={cn('text-gold-700 shrink-0 transition-transform duration-300', open && 'rotate-180')}
          />
        </button>
      </h2>
      <div
        id={`${uid}-panel`}
        data-open={open}
        className="tour-panel acc-panel lg:block"
        role="region"
        aria-labelledby={`${uid}-button`}>
        <div className="lg:overflow-visible">
          <div className="max-lg:px-4 max-lg:pb-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

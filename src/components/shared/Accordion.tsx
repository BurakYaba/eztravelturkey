'use client';

import { useId, useState, type ReactNode } from 'react';
import { CaretDown } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';

export type AccordionItem = {
  id: string;
  title: ReactNode;
  /** Optional leading badge, for example the day number in an itinerary. */
  badge?: ReactNode;
  content: ReactNode;
};

type Props = {
  items: AccordionItem[];
  defaultOpen?: string[];
  className?: string;
  size?: 'md' | 'lg';
};

export function Accordion({ items, defaultOpen = [], className, size = 'md' }: Props) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const uid = useId();

  const toggle = (id: string) => setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const panelId = `${uid}-${item.id}-panel`;
        const buttonId = `${uid}-${item.id}-button`;
        return (
          <div
            key={item.id}
            className={cn(
              'rounded-lg border bg-white transition-colors',
              isOpen ? 'border-gold-500/60 shadow-card' : 'border-cream-200',
            )}>
            <h3 className="font-sans text-base font-semibold tracking-normal">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  'text-navy-900 flex w-full items-center gap-4 rounded-lg px-4 text-left',
                  size === 'lg' ? 'py-4 md:px-5' : 'py-3.5',
                )}>
                {item.badge}
                <span className="flex-1">{item.title}</span>
                <CaretDown
                  size={18}
                  weight="bold"
                  aria-hidden
                  className={cn('text-gold-700 shrink-0 transition-transform duration-300', isOpen && 'rotate-180')}
                />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} data-open={isOpen} className="acc-panel">
              <div>
                <div className={cn('text-muted px-4 pb-5', size === 'lg' && 'md:px-5', item.badge ? 'md:pl-20' : '')}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';

type Props = {
  /** The cards, as `<li>` items; their width decides how many are in view. */
  children: ReactNode;
  previousLabel: string;
  nextLabel: string;
  className?: string;
};

/**
 * A row of cards that scrolls sideways inside its container (not past the edge of the page), with previous and next
 * buttons. The buttons show only when there is more to see (their space is always kept, so the page does not jump), and each one is disabled at its end. Touch and trackpad
 * scrolling and the keyboard work as usual; the buttons are an addition for mouse users, who have no scroll bar here.
 */
export function ScrollRail({ children, previousLabel, nextLabel, className }: Props) {
  const list = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = list.current;
    if (!el) {
      return;
    }
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    const el = list.current;
    if (!el) {
      return;
    }
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [measure]);

  const go = (direction: 1 | -1) => {
    const el = list.current;
    if (!el) {
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: reduced ? 'auto' : 'smooth' });
  };

  const button =
    'border-navy-900/20 text-navy-900 hover:bg-navy-900 flex size-11 items-center justify-center rounded-full border bg-white transition hover:text-white disabled:pointer-events-none disabled:opacity-35';

  return (
    <div className={className}>
      {/* The small side padding keeps the card shadows from being cut by the scroll box. */}
      <ul ref={list} className="no-scrollbar -mx-1 flex scroll-px-1 snap-x snap-mandatory gap-5 overflow-x-auto px-1 pt-1 pb-5">{children}</ul>
      <div className={cn('flex justify-end gap-2', edge.start && edge.end && 'invisible')}>
        <button type="button" aria-label={previousLabel} disabled={edge.start} onClick={() => go(-1)} className={button}>
          <CaretLeft size={18} weight="bold" aria-hidden />
        </button>
        <button type="button" aria-label={nextLabel} disabled={edge.end} onClick={() => go(1)} className={button}>
          <CaretRight size={18} weight="bold" aria-hidden />
        </button>
      </div>
    </div>
  );
}

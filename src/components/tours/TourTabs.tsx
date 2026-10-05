'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type TabItem = { id: string; label: string };

const LINE = 213;

/** Sticky section tabs with a scroll-spy highlight, built on IntersectionObserver. */
export function TourTabs({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const locked = useRef(false);
  const refresh = useRef<() => void>(() => undefined);

  useEffect(() => {
    const sections = tabs.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => Boolean(el));
    const update = () => {
      if (locked.current) {
        return;
      }
      let current = tabs[0]?.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= LINE) {
          current = section.id;
        }
      }
      setActive(current);
    };
    refresh.current = update;
    // A thin band just under the sticky bars. A section entering or leaving it re-evaluates the current tab.
    const bottomInset = Math.max(0, window.innerHeight - LINE + 5);
    const observer = new IntersectionObserver(update, {
      rootMargin: `-158px 0px -${bottomInset}px 0px`,
      threshold: [0, 1],
    });
    update();
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [tabs]);

  // While the page glides to a clicked tab, keep that tab highlighted and re-check once the scroll settles.
  const onTabClick = (id: string) => {
    locked.current = true;
    setActive(id);
    window.setTimeout(() => {
      locked.current = false;
      refresh.current();
    }, 1100);
  };

  return (
    <div className="border-cream-200 bg-cream-50/95 sticky top-[80px] z-30 border-b backdrop-blur">
      <nav aria-label="Tour sections" className="container-x">
        <ul className="no-scrollbar flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <li key={tab.id} className="shrink-0">
              <a
                href={`#${tab.id}`}
                onClick={() => onTabClick(tab.id)}
                aria-current={active === tab.id ? 'true' : undefined}
                className={cn(
                  'relative block px-4 py-4 text-[0.95rem] font-semibold transition-colors',
                  active === tab.id ? 'text-gold-700' : 'text-navy-900 hover:text-gold-700',
                )}>
                {tab.label}
                <span
                  aria-hidden
                  className={cn(
                    'bg-gold-600 absolute inset-x-4 bottom-0 h-0.5 transition-opacity',
                    active === tab.id ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

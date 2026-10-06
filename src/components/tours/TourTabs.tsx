'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

export type TabItem = { id: string; label: string };

type TabsState = { active: string; select: (id: string) => void };

const TabsContext = createContext<TabsState | null>(null);

/** The tab currently shown on large screens. Panels outside a provider behave as always visible. */
export const useActiveTab = () => useContext(TabsContext);

/** Height of the site header plus the sticky tab strip. A tab change scrolls back up to this line if needed. */
const STICKY_OFFSET = 138;

/**
 * Holds which tour tab is selected. From lg up only that tab's panel is shown; below lg the same panels are
 * accordions and this state is not used. The selection follows the URL hash so a tab can be linked to.
 */
export function TourTabsProvider({ tabs, children }: { tabs: TabItem[]; children: ReactNode }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (tabs.some((t) => t.id === id)) {
        setActive(id);
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [tabs]);

  const select = useCallback((id: string) => {
    setActive(id);
    window.history.replaceState(null, '', `#${id}`);
    // If the visitor is deep in a long tab, bring the top of the new tab into view under the sticky bars.
    const panels = document.getElementById('tour-panels');
    if (panels) {
      const top = panels.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
      if (window.scrollY > top) {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, []);

  return <TabsContext.Provider value={{ active, select }}>{children}</TabsContext.Provider>;
}

/** Sticky tab strip, shown from lg up. Phones use the accordion panels instead. */
export function TourTabs({ tabs }: { tabs: TabItem[] }) {
  const state = useContext(TabsContext);
  const listRef = useRef<HTMLUListElement>(null);
  const active = state?.active ?? tabs[0]?.id;

  // Keep the selected tab inside the strip when the tabs overflow (narrow desktop windows).
  useEffect(() => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (list && tab) {
      const left = tab.offsetLeft - 24;
      const right = tab.offsetLeft + tab.offsetWidth + 24;
      if (left < list.scrollLeft) {
        list.scrollTo({ left, behavior: 'smooth' });
      } else if (right > list.scrollLeft + list.clientWidth) {
        list.scrollTo({ left: right - list.clientWidth, behavior: 'smooth' });
      }
    }
  }, [active]);

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const index = tabs.findIndex((t) => t.id === active);
    let next = -1;
    if (e.key === 'ArrowRight') {
      next = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = tabs.length - 1;
    }
    if (next >= 0) {
      e.preventDefault();
      state?.select(tabs[next].id);
      listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
    }
  };

  return (
    <div className="border-cream-200 bg-cream-50/95 sticky top-20 z-30 hidden border-b backdrop-blur lg:block">
      <nav aria-label="Tour sections" className="container-x">
        <ul
          ref={listRef}
          role="tablist"
          aria-label="Tour sections"
          onKeyDown={onKeyDown}
          className="no-scrollbar flex gap-0.5 overflow-x-auto xl:gap-1">
          {tabs.map((tab) => {
            const selected = active === tab.id;
            return (
              <li key={tab.id} role="presentation" className="shrink-0">
                <button
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={tab.id}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => state?.select(tab.id)}
                  className={cn(
                    'relative block px-3 py-4 text-[0.95rem] font-semibold whitespace-nowrap transition-colors xl:px-4',
                    selected ? 'text-gold-700' : 'text-navy-900 hover:text-gold-700',
                  )}>
                  {tab.label}
                  <span
                    aria-hidden
                    className={cn(
                      'bg-gold-600 absolute inset-x-3 bottom-0 h-0.5 transition-opacity xl:inset-x-4',
                      selected ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

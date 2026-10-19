'use client';

import { VisualEditing, type HistoryAdapter, type HistoryAdapterNavigate } from '@sanity/visual-editing/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

/**
 * The connection between the page and the Studio's preview (Presentation) tool. Without it the tool reports that it
 * cannot connect and asks the editor to "continue anyway". With it:
 * - the Studio reloads the page after a change in the document (`refresh`);
 * - the Studio learns which page the editor moved to (`history`), so its address bar and the document panel follow the
 *   links the editor clicks inside the preview, and the Studio can move the page too.
 * It is rendered only in Draft Mode (see `PreviewBar`), so visitors never load it.
 */
export function VisualEditingBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | null>(null);

  // Tell the Studio where the page is whenever it changes.
  useEffect(() => {
    navigate?.({ type: 'push', url: `${pathname}${search ? `?${search}` : ''}` });
  }, [navigate, pathname, search]);

  const history = useMemo<HistoryAdapter>(
    () => ({
      subscribe: (onNavigate) => {
        setNavigate(() => onNavigate);
        return () => setNavigate(null);
      },
      update: (update) => {
        if (update.type === 'push') {
          router.push(update.url);
        } else if (update.type === 'pop') {
          router.back();
        } else if (update.type === 'replace') {
          router.replace(update.url);
        }
      },
    }),
    [router],
  );

  return (
    <VisualEditing
      portal
      history={history}
      refresh={() => {
        // Draft Mode reads the CMS without a cache, so asking Next.js for the page again shows the saved draft.
        router.refresh();
        return Promise.resolve();
      }}
    />
  );
}

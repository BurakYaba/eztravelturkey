'use client';

import { VisualEditing } from '@sanity/visual-editing/react';
import { useRouter } from 'next/navigation';

/**
 * The connection between the page and the Studio's preview (Presentation) tool. Without it the tool reports that it
 * cannot connect and asks the editor to "continue anyway". With it the Studio can reload the page after a change
 * (`refresh`) and knows which address the page is at. It is rendered only in Draft Mode (see `PreviewBar`), so
 * visitors never load it.
 */
export function VisualEditingBridge() {
  const router = useRouter();
  return (
    <VisualEditing
      portal
      refresh={() => {
        // Draft Mode reads the CMS without a cache, so asking Next.js for the page again shows the saved draft.
        router.refresh();
        return Promise.resolve();
      }}
    />
  );
}

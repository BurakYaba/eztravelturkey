'use client';

import dynamic from 'next/dynamic';

/**
 * Loads the Studio preview bridge only when it is rendered, that is only in Draft Mode (see `PreviewBar`).
 *
 * A client component that a server component renders conditionally still puts its script into the page of every
 * visitor, because the layout lists all its client chunks. The bridge pulls in about 600 KB of Studio code (198 KB
 * compressed), none of which a visitor uses; measured on the home page it cost roughly one second of main-thread time
 * (docs/baseline, P9.13). `dynamic` moves that code into a chunk that is requested only when the component renders.
 */
const VisualEditingBridge = dynamic(() => import('./VisualEditingBridge').then((m) => m.VisualEditingBridge), {
  ssr: false,
});

export function VisualEditingLoader() {
  return <VisualEditingBridge />;
}

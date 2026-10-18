import { draftMode } from 'next/headers';

/**
 * A bar at the top of every page while an editor looks at unpublished changes (Draft Mode). It is for the editors only
 * and stays in English; visitors never see it because the cookie that turns it on is set by the Studio's preview link.
 */
export async function PreviewBar() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) {
    return null;
  }
  return (
    <aside role="status" className="bg-navy-900 flex flex-wrap items-center justify-center gap-3 px-4 py-2 text-sm text-white">
      <span>Preview: you see changes that are not published yet.</span>
      <form method="POST" action="/api/draft/disable/">
        <button type="submit" className="rounded border border-white/60 px-3 py-1 font-medium hover:bg-white/10">
          Leave preview
        </button>
      </form>
    </aside>
  );
}

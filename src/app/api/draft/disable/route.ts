import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/** Leaves the preview (the button of the preview bar, or the Studio). A POST, so link prefetching cannot trigger it. */
export async function POST(request: Request) {
  (await draftMode()).disable();
  const back = new URL(request.url).searchParams.get('to') ?? '/';
  redirect(back.startsWith('/') && !back.startsWith('//') ? back : '/');
}

/** The Studio's Presentation tool turns the preview off with a GET. */
export async function GET(request: Request) {
  return POST(request);
}

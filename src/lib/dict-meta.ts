import type { Metadata } from 'next';
import type { ImageId } from '@/data/images';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n/dictionaries';
import { buildMetadata } from '@/lib/seo';

/**
 * `generateMetadata` for a page laid out in code whose title and description are words of the dictionary, so that the
 * Chinese and Japanese pages do not carry English search results. The language's counterpart pages (hreflang) come from the CMS.
 */
export const dictMetadata =
  (
    pick: (dictionary: Dictionary) => { title: string; description: string },
    input: { path: string; image?: ImageId },
  ) =>
  async ({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> => {
    const { lang } = await params;
    const locale = hasLocale(lang) ? lang : defaultLocale;
    const { title, description } = pick(getDictionary(locale));
    return buildMetadata({
      title,
      description,
      path: input.path,
      lang: locale,
      image: input.image,
    });
  };

import type { Metadata } from 'next';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n/dictionaries';
import { getPage } from '@/lib/data';
import type { ImageId } from '@/data/images';
import { buildMetadata, editorSeo } from '@/lib/seo';

/**
 * `generateMetadata` for a page that is laid out in code but whose title and description live in the CMS (about, contact, FAQ,
 * destinations hub). The old site's title is kept as it was (principle 12): a ranking page does not change its title
 * without a reason. The description of the CMS is kept whatever its length (the 120 to 160 limit is for Latin letters);
 * a page without one takes the words of the dictionary.
 */
export const docMetadata =
  (input: {
    path: string;
    image?: ImageId;
    /** The page's title and description when the CMS has none. */
    dictionary: (dictionary: Dictionary) => { title: string; description: string };
  }) =>
  async ({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> => {
    const { lang } = await params;
    const locale = hasLocale(lang) ? lang : defaultLocale;
    const page = await getPage(locale, input.path.replace(/^\//, ''));
    const words = input.dictionary(getDictionary(locale));
    const own = page?.metaDescription ?? '';
    return buildMetadata({
      title: page?.metaTitle || words.title,
      description: own.length > 0 ? own : words.description,
      path: input.path,
      lang: locale,
      image: input.image,
      absoluteTitle: Boolean(page?.metaTitle),
      ...(page ? editorSeo(page) : {}),
    });
  };

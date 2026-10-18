import type { Metadata } from 'next';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n/dictionaries';
import { alternatesOf, getPage } from '@/lib/data';
import type { ImageId } from '@/data/images';
import { buildMetadata, editorSeo } from '@/lib/seo';

/**
 * `generateMetadata` for a page that is laid out in code but whose title and description live in the CMS (about, contact, FAQ,
 * destinations hub). The old site's title is kept as it was (principle 12): a ranking page does not change its title
 * without a reason. English uses the old description only when it is 120 to 160 characters long (Ek H.3; the old About
 * description was 195), otherwise the one written in code. The Chinese and Japanese descriptions are kept whatever their length
 * (that limit is for Latin letters); a page without one takes the words of the dictionary.
 */
export const docMetadata =
  (input: {
    path: string;
    title: string;
    description: string;
    image?: ImageId;
    /** The page's title and description in the other languages, for a page whose old site gave none. */
    dictionary?: (dictionary: Dictionary) => { title: string; description: string };
  }) =>
  async ({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> => {
    const { lang } = await params;
    const locale = hasLocale(lang) ? lang : defaultLocale;
    const page = await getPage(locale, input.path.replace(/^\//, ''));
    const words = locale === defaultLocale || !input.dictionary ? input : input.dictionary(getDictionary(locale));
    const own = page?.metaDescription ?? '';
    const useOwn = locale === defaultLocale ? own.length >= 120 && own.length <= 160 : own.length > 0;
    return buildMetadata({
      title: page?.metaTitle || words.title,
      description: useOwn ? own : words.description,
      path: input.path,
      lang: locale,
      canonicalLang: page?.fallback ? defaultLocale : locale,
      alternates: await alternatesOf(locale, input.path.replace(/^\//, '')),
      image: input.image,
      absoluteTitle: Boolean(page?.metaTitle),
      ...(page ? editorSeo(page) : {}),
    });
  };

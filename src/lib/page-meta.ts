import type { Metadata } from 'next';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { getPage, languagesWithPage } from '@/lib/data';
import type { ImageId } from '@/data/images';
import { buildMetadata } from '@/lib/seo';

/**
 * `generateMetadata` for a page that is laid out in code but whose title and description live in the CMS (about, contact,
 * FAQ, destinations hub). The old site's title is kept as it was (principle 12): a ranking page does not change its title
 * without a reason. The old description is used only when it is 120 to 160 characters long (Ek H.3; the old About
 * description was 195), otherwise the one written in code. Without a CMS document the code's own text is used.
 */
export const docMetadata =
  (input: { path: string; title: string; description: string; image?: ImageId }) =>
  async ({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> => {
    const { lang } = await params;
    const locale = hasLocale(lang) ? lang : defaultLocale;
    const page = await getPage(locale, input.path.replace(/^\//, ''));
    const longEnough = page && page.metaDescription.length >= 120 && page.metaDescription.length <= 160;
    return buildMetadata({
      title: page?.metaTitle || input.title,
      description: longEnough ? page.metaDescription : input.description,
      path: input.path,
      lang: locale,
      canonicalLang: page?.fallback ? defaultLocale : locale,
      alternateLangs: await languagesWithPage(input.path.replace(/^\//, '')),
      image: input.image,
      absoluteTitle: Boolean(page?.metaTitle),
    });
  };

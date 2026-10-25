import { defineField, defineType, type ValidationContext } from 'sanity';
import { autoPathInput } from '../components/AutoPathInput';
import {
  faqsField,
  languageField,
  mainImageField,
  metaDescriptionField,
  metaTitleField,
  pageFields,
  pathField,
  titleField,
} from './fields';

/**
 * Every text page type shares the same fields. The `kind` tells the site how to use the page and is set by the type
 * (destination pages and hub pages choose it themselves).
 */
const kindField = (options: { value: string; title: string }[], initial: string, editable: boolean) =>
  defineField({
    name: 'kind',
    title: 'Sayfa türü',
    type: 'string',
    options: { list: options, layout: 'radio' },
    initialValue: initial,
    readOnly: !editable,
    validation: (rule) => rule.required(),
  });

const kinds = {
  destinationPage: [
    { value: 'country', title: 'Ülke' },
    { value: 'combo', title: 'Çok ülkeli kombinasyon' },
    { value: 'category', title: 'Kategori (süre veya paket)' },
  ],
  hubPage: [
    { value: 'destinations-hub', title: 'Destinasyonlar ana sayfası' },
    { value: 'blog-hub', title: 'Blog ana sayfası' },
  ],
};

function pageType(
  name: string,
  title: string,
  kind: string,
  kindOptions?: { value: string; title: string }[],
  extraFields: ReturnType<typeof defineField>[] = [],
  replaceFields: Record<string, ReturnType<typeof defineField>> = {},
) {
  return defineType({
    name,
    title,
    type: 'document',
    fields: [
      pageFields[0]!,
      kindField(kindOptions ?? [{ value: kind, title }], kind, Boolean(kindOptions)),
      ...pageFields.slice(1).map((field) => replaceFields[field.name] ?? field),
      ...extraFields,
    ],
    orderings: [{ title: 'Sayfa adresi', name: 'path', by: [{ field: 'path', direction: 'asc' }] }],
    preview: { select: { title: 'title', subtitle: 'path', media: 'mainImage' } },
  });
}

export const destinationPage = pageType('destinationPage', 'Destinasyon sayfası', 'country', kinds.destinationPage, [], {
  path: { ...pathField, components: { input: autoPathInput('destinationPage') } },
});
/** Posts created before this day were moved from the old site and may stay without an author. */
const legacyCutoff = '2026-10-19';

/** The old addresses of a post, as the editor may paste them: `/en/blog/x/y/`, without the last slash or with the whole domain. */
export const normalizeOldUrl = (value: string) =>
  `/${value
    .trim()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[?#].*$/, '')
    .replace(/^\/+|\/+$/g, '')}/`.toLowerCase();

/** Fields only blog posts have: who wrote it, the answer in a nutshell and when the facts were last checked. */
const blogFields = [
  defineField({
    name: 'author',
    title: 'Yazar',
    type: 'reference',
    to: [{ type: 'author' }],
    description:
      'Yazının altında imza olarak ve yazar kartında gösterilir. Seçmezseniz yazıda imza görünmez ve arama motorlarına yazar olarak "Magnificent Travel" bildirilir; yazıyı yazan veya inceleyen bir kişi varsa seçmeniz önerilir (okurlar ve arama motorları adı belli bir yazara güvenir).',
    validation: (rule) =>
      rule
        .custom((value, context: ValidationContext) => {
          // The posts moved from the old site have no author and are credited to Magnificent Travel (structured data). A new post without
          // one is allowed too (only a warning): the site does the same for it, and as an error this stopped the editors from publishing a new post,
          // since the only author record is one person's (2026-10-25).
          const created = (context.document as { _createdAt?: string } | undefined)?._createdAt ?? '';
          return value || (created && created < legacyCutoff) ? true : 'Yazar seçilmedi: yazıda imza görünmez. Yayınlanabilir.';
        })
        .warning(),
  }),
  defineField({
    name: 'shortAnswer',
    title: 'Kısa cevap',
    type: 'text',
    rows: 3,
    description: 'Yazının sorusuna 40-60 kelimelik cevap. Metnin başında vurgulu bir kutuda gösterilir.',
    validation: (rule) => rule.max(400).warning('Kısa cevabı yaklaşık 60 kelimenin altında tutun.'),
  }),
  defineField({
    name: 'lastUpdated',
    title: 'Son güncelleme',
    type: 'date',
    description: 'Yazıdaki bilgilerin son kontrol edildiği gün. Sayfada ve arama sonuçlarında gösterilir.',
  }),
  defineField({
    name: 'oldUrls',
    title: 'Bu yazının eski adresleri (yönlendirme)',
    type: 'array',
    of: [{ type: 'string' }],
    description:
      'Yalnızca bu yazı eski sitedeki bir yazının yerine geçiyorsa: eski adresi yapıştırın, örneğin /en/blog/turkey/old-name/. Bu adresi açan ziyaretçiler ve Google bu yazıya yönlendirilir (kalıcı yönlendirme). Yönlendirme, yayından yaklaşık 5 dakika sonraki site güncellemesiyle başlar.',
    validation: (rule) =>
      rule.custom(async (values: string[] | undefined, context: ValidationContext) => {
        if (!values?.length) {return true;}
        const doc = context.document as { _id?: string; language?: string; path?: string } | undefined;
        const id = (doc?._id ?? '').replace(/^drafts\./, '');
        const own = `/${doc?.language ?? 'en'}/${doc?.path ?? ''}/`;
        const client = context.getClient({ apiVersion: '2025-01-01' });
        const seen = new Set<string>();
        for (const value of values) {
          const url = normalizeOldUrl(value);
          const match = /^\/(en|cn|jp)\/(.+)\/$/.exec(url);
          if (!match) {return `${value}: eski sayfanın adresini /en/, /cn/ veya /jp/ ile başlayacak şekilde yazın.`;}
          if (url === own.toLowerCase()) {return `${value}: bu, yazının kendi adresi.`;}
          if (seen.has(url)) {return `${value}: iki kez yazılmış.`;}
          seen.add(url);
          const [, language, path] = match;
          const clash = await client.fetch<{ title: string } | null>(
            '*[defined(path) && language == $language && path == $path && !(_id in [$id, "drafts." + $id])][0]{ title }',
            { language, path, id },
          );
          if (clash) {return `${value}: bu adreste zaten bir sayfa var ("${clash.title}"), bu yüzden yönlendirilemez.`;}
          const taken = await client.fetch<{ title: string } | null>(
            '*[_type == "blogPost" && !(_id in [$id, "drafts." + $id]) && $url in oldUrls[]][0]{ title }',
            { url, id },
          );
          if (taken) {return `${value}: "${taken.title}" yazısında zaten kullanılıyor.`;}
        }
        return true;
      }),
  }),
];

export const blogPost = pageType('blogPost', 'Blog yazısı', 'blog-post', undefined, blogFields, {
  path: { ...pathField, components: { input: autoPathInput('blogPost') } },
});
export const blogCategory = pageType('blogCategory', 'Blog kategorisi', 'blog-category', undefined, [], {
  path: { ...pathField, components: { input: autoPathInput('blogCategory') } },
});
export const author = pageType('author', 'Yazar', 'author', undefined, [], {
  path: { ...pathField, components: { input: autoPathInput('author') } },
});
export const staticPage = pageType('staticPage', 'Metin sayfası (hakkımızda, yasal)', 'static', undefined, [], {
  path: { ...pathField, components: { input: autoPathInput('staticPage') } },
});
export const hubPage = pageType('hubPage', 'Ana bölüm sayfası', 'destinations-hub', kinds.hubPage);

/** The home page of a language: its meta texts and the cards (combinations and tours) it features. */
export const homePage = defineType({
  name: 'homePage',
  title: 'Ana sayfa',
  type: 'document',
  fields: [
    languageField,
    defineField({ name: 'kind', title: 'Sayfa türü', type: 'string', initialValue: 'home', readOnly: true }),
    { ...titleField, title: 'Ana başlık (H1)', description: 'Ana sayfanın en üstündeki büyük başlık.' },
    metaTitleField,
    metaDescriptionField,
    mainImageField,
    { ...faqsField, description: 'Ana sayfanın altında görünen sorular.' },
    defineField({
      name: 'cards',
      title: 'Öne çıkan kartlar',
      type: 'array',
      // Hidden: the home page draws its cards from the tours and combinations themselves, not from this list, so editing it
      // changed nothing on the site.
      hidden: true,
      description: 'Ana sayfanın öne çıkardığı kombinasyonlar ve turlar, sırayla.',
      of: [
        defineField({
          name: 'card',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Başlık', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'href', title: 'Bağlantı', type: 'string', description: 'Site adresi, örneğin /destinations/turkey-greece-tours/' }),
            defineField({ name: 'meta', title: 'Kısa bilgiler', type: 'array', of: [{ type: 'string' }] }),
            defineField({ name: 'price', title: 'Fiyat metni', type: 'string' }),
            defineField({ name: 'image', title: 'Görsel', type: 'picture' }),
          ],
          preview: { select: { title: 'title', subtitle: 'href', media: 'image' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'language' } },
});

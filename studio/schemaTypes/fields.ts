import { defineField, defineType, type ValidationContext } from 'sanity';
import { lengthHint } from '../components/LengthHint';

/** Languages of the site. Every language has its own documents (docs/project-plan.md D9). */
export const languages = [
  { title: 'English', value: 'en' },
  { title: '简体中文', value: 'cn' },
  { title: '日本語', value: 'jp' },
];

export const languageField = defineField({
  name: 'language',
  title: 'Dil',
  type: 'string',
  description: 'Bu belgenin yazıldığı dil. Her dilin kendi belgeleri vardır. Belge kaydedildikten sonra değiştirilemez; başka bir dil için yeni belge açın.',
  options: { list: languages, layout: 'radio' },
  // Changing it by accident moved a page into another language's list (and would break that language's page when published).
  readOnly: ({ document }) => Boolean(document?._createdAt),
  validation: (rule) => rule.required(),
});

/**
 * The address of the page without the language, no slash at the start or end, no spaces. It must follow the old site's
 * pattern (for example `destinations/turkey-tours/06-to-09-days-tours/my-tour`) and be unique within the language.
 */
export const pathField = defineField({
  name: 'path',
  title: 'Sayfa adresi',
  type: 'string',
  description:
    'Dil kısmı ve baştaki/sondaki eğik çizgiler olmadan adres. Benzer bir sayfanın desenini kopyalayın. Örnek: blog/turkey/best-time-to-visit-turkey',
  validation: (rule) =>
    rule.required().custom(async (value: string | undefined, context: ValidationContext) => {
      if (!value) {return true;}
      const doc = context.document as { _id?: string; language?: string } | undefined;
      // One imported Japanese tour has a space in its address ("11日間 トルコ＆エジプト周遊ツアー"). The site serves it (the space
      // becomes %20) and the old-site redirects point to it, but the Studio refused to publish it (2026-10-23). Japanese
      // addresses may therefore contain a space; every other language still may not.
      const spaceAllowed = doc?.language === 'jp';
      if (/^\/|\/$|\/\//.test(value) || (!spaceAllowed && /\s/.test(value))) {return 'Boşluk, baştaki veya sondaki eğik çizgi ve çift eğik çizgi kullanmayın.';}
      // The old Japanese addresses carry capitals (T-01, TM-02): a tour moved from that site could not be published again without this.
      if (value !== value.toLowerCase() && doc?.language !== 'jp') {return 'Yalnızca küçük harf kullanın.';}
      const id = (doc?._id ?? '').replace(/^drafts\./, '');
      const taken = await context
        .getClient({ apiVersion: '2025-01-01' })
        .fetch<number>(
          'count(*[defined(path) && path == $path && language == $language && !(_id in [$id, "drafts." + $id])])',
          { path: value, language: doc?.language ?? '', id },
        );
      return taken > 0 ? 'Bu dilde başka bir sayfa bu adresi zaten kullanıyor.' : true;
    }),
});

/** Links the same page in the three languages: pages with the same value are translations of each other. */
export const translationGroupField = defineField({
  name: 'translationGroup',
  title: 'Diğer dillerdeki aynı sayfa',
  type: 'string',
  description:
    'Burada aynı kodu taşıyan farklı dillerdeki sayfalar aynı sayfadır. Dil menüsü ve arama motorları (hreflang) bu sayfalar arasında geçiş yapar. Karşılığı olmayan sayfada boş bırakın.',
});

export const titleField = defineField({
  name: 'title',
  title: 'Sayfa başlığı (H1)',
  type: 'string',
  description: 'Sayfanın ana başlığı.',
  validation: (rule) => rule.required(),
});

export const metaTitleField = defineField({
  name: 'metaTitle',
  title: 'Arama sonucu başlığı',
  type: 'string',
  description: 'Google\'da görünür. Site adı sonuna eklenir. Yaklaşık 50-60 karakter.',
  components: { input: lengthHint(30, 60) },
  validation: (rule) => rule.required().max(70).warning('Yaklaşık 60 karakteri aşarsa Google başlığı kesebilir.'),
});

export const metaDescriptionField = defineField({
  name: 'metaDescription',
  title: 'Arama sonucu açıklaması',
  type: 'text',
  rows: 3,
  description:
    'Google\'da başlığın altında görünür. Yaklaşık 120-160 karakter. Boş bırakırsanız sayfanın ilk cümleleri kullanılır; kendiniz yazmanız daha iyidir.',
  components: { input: lengthHint(120, 160) },
  validation: (rule) => rule.required().max(200).warning('Yaklaşık 160 karakteri aşarsa Google açıklamayı kesebilir.'),
});

/** A picture. The alt text describes it for people who cannot see it and for search engines. */
export const picture = defineType({
  name: 'picture',
  title: 'Görsel',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternatif metin (görsel açıklaması)',
      type: 'string',
      description: 'Görselde ne olduğunu birkaç kelimeyle yazın. Görseli göremeyen kişiler ve arama motorları bunu okur.',
      validation: (rule) => rule.required().error('Yayınlamadan önce görseli birkaç kelimeyle tarif edin.'),
    }),
  ],
});

export const faq = defineType({
  name: 'faq',
  title: 'Soru ve cevap',
  type: 'object',
  fields: [
    defineField({ name: 'q', title: 'Soru', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'a', title: 'Cevap', type: 'text', rows: 4, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'q', subtitle: 'a' } },
});

export const faqsField = defineField({
  name: 'faqs',
  title: 'Sık sorulan sorular',
  type: 'array',
  of: [{ type: 'faq' }],
});

export const mainImageField = defineField({
  name: 'mainImage',
  title: 'Ana görsel',
  type: 'picture',
  description: 'Sayfanın üstünde ve kartlarda gösterilir.',
});

// ---- the body of a page: sections made of paragraphs, lists, tables and pictures

export const paragraph = defineType({
  name: 'paragraph',
  title: 'Paragraf',
  type: 'object',
  fields: [defineField({ name: 'text', title: 'Metin', type: 'text', rows: 4, validation: (rule) => rule.required() })],
  preview: {
    select: { title: 'text' },
    prepare: ({ title }) => ({ title: String(title ?? '').slice(0, 90), subtitle: 'Paragraf' }),
  },
});

export const list = defineType({
  name: 'list',
  title: 'Liste',
  type: 'object',
  fields: [
    defineField({ name: 'ordered', title: 'Numaralı liste', type: 'boolean', initialValue: false }),
    defineField({
      name: 'items',
      title: 'Maddeler',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare: ({ items }) => ({ title: `${(items as string[] | undefined)?.length ?? 0} madde`, subtitle: 'Liste' }),
  },
});

export const tableRow = defineType({
  name: 'tableRow',
  title: 'Tablo satırı',
  type: 'object',
  fields: [defineField({ name: 'cells', title: 'Hücreler', type: 'array', of: [{ type: 'string' }] })],
  preview: {
    select: { cells: 'cells' },
    prepare: ({ cells }) => ({ title: ((cells as string[] | undefined) ?? []).join(' | ') }),
  },
});

export const table = defineType({
  name: 'table',
  title: 'Tablo',
  type: 'object',
  fields: [defineField({ name: 'rows', title: 'Satırlar', type: 'array', of: [{ type: 'tableRow' }] })],
  preview: {
    select: { rows: 'rows' },
    prepare: ({ rows }) => ({ title: `${(rows as unknown[] | undefined)?.length ?? 0} satır`, subtitle: 'Tablo' }),
  },
});

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Görsel',
  type: 'object',
  fields: [defineField({ name: 'image', title: 'Görsel', type: 'picture', validation: (rule) => rule.required() })],
  preview: {
    select: { media: 'image', title: 'image.alt' },
    prepare: ({ media, title }) => ({ media, title: title ?? 'Görsel', subtitle: 'Görsel' }),
  },
});

export const section = defineType({
  name: 'section',
  title: 'Bölüm',
  type: 'object',
  fields: [
    defineField({
      name: 'level',
      title: 'Başlık düzeyi',
      type: 'number',
      description: 'Ana bölüm için 2, alt bölüm için 3, ilk başlıktan önceki metin için 0.',
      options: { list: [0, 2, 3, 4] },
      initialValue: 2,
    }),
    defineField({ name: 'heading', title: 'Başlık', type: 'string' }),
    defineField({
      name: 'blocks',
      title: 'İçerik',
      type: 'array',
      of: [{ type: 'paragraph' }, { type: 'list' }, { type: 'table' }, { type: 'imageBlock' }],
    }),
  ],
  preview: {
    select: { title: 'heading', blocks: 'blocks' },
    prepare: ({ title, blocks }) => ({
      title: title || '(başlık yok)',
      subtitle: `${(blocks as unknown[] | undefined)?.length ?? 0} blok`,
    }),
  },
});

export const sectionsField = defineField({
  name: 'sections',
  title: 'Sayfa metni',
  type: 'array',
  description: 'Sayfanın metni, bölüm bölüm.',
  of: [{ type: 'section' }],
});

/** Keeps a page out of search results (Google) and out of the sitemap. The page still opens for people who have the link. */
export const noindexField = defineField({
  name: 'noindex',
  title: 'Arama motorlarından gizle',
  type: 'boolean',
  description: 'Yalnızca Google\'da görünmesini istemediğiniz sayfada açın, örneğin taslak bir kampanya sayfası. Normalde kapalıdır.',
  initialValue: false,
});

/** Overrides the address search engines treat as the main one for the page. Normally left empty. */
export const canonicalUrlField = defineField({
  name: 'canonicalUrl',
  title: 'Arama motorları için ana adres (isteğe bağlı)',
  type: 'string',
  description:
    'Boş bırakın. Yalnızca aynı metin sitede başka bir sayfada da varsa ve Google\'ın o sayfayı göstermesini istiyorsanız doldurun. Adresi /en/blog/turkey/other-post/ biçiminde veya tam https://www.magnificenttravel.com/... adresi olarak yazın.',
  validation: (rule) =>
    rule.custom((value: string | undefined) => {
      if (!value) {return true;}
      if (/^https:\/\/(www\.)?magnificenttravel\.com\/(en|cn|jp)\//.test(value) || /^\/(en|cn|jp)\//.test(value)) {return true;}
      return '/en/, /cn/ veya /jp/ ile ya da https://www.magnificenttravel.com/ ile başlayın.';
    }),
});

/** Fields every text page has, in the order the editor sees them. */
export const pageFields = [
  languageField,
  pathField,
  translationGroupField,
  titleField,
  metaTitleField,
  metaDescriptionField,
  mainImageField,
  sectionsField,
  faqsField,
  noindexField,
  canonicalUrlField,
];

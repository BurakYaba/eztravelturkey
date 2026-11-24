import { defineField, defineType, type ValidationContext } from 'sanity';
import { autoPathInput } from '../components/AutoPathInput';
import { infoNote } from '../components/InfoNote';
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

/**
 * Pages whose layout is written in the site's code (About, Contact, FAQ, the destinations hub, the home page): the Studio holds their
 * texts, but only some of them show on the page. The field audit (scripts/sanity/field-audit.mjs, 2026-10-25) found what does not show;
 * a note says so on the page itself, and the fields that do nothing are hidden, so an editor is never left wondering why a change
 * does not appear.
 */
const aboutPaths = ['about', '会社概要'];
const contactPaths = ['contact', '問い合わせ先'];
const hubPaths = ['destinations', '目的地'];
const codedPaths = [...aboutPaths, ...contactPaths, 'faq'];
const pathIn = (paths: string[]) => ({ document }: { document?: unknown }) => paths.includes((document as { path?: string } | undefined)?.path ?? '');
const pathNotIn = (paths: string[]) => (context: { document?: unknown }) => !pathIn(paths)(context);

const note = (name: string, paths: string[], lines: string[]) =>
  defineField({ name, title: 'Bu sayfa nasıl oluşuyor?', type: 'string', hidden: pathNotIn(paths), components: { input: infoNote(lines) } });

const pageNotes = [
  note('aboutNote', aboutPaths, [
    'Bu sayfanın tasarımı kodla hazırlanmıştır. "Sayfa metni"ndeki bölümlerden yalnızca yazı (paragraf, liste veya tablo) içerenler sitede görünür; yalnızca görselden oluşan bölümler (örneğin "Since 1997" rozetleri) sitede başka bir yerden gelir ve burada düzenlenmez.',
    'Ekip kartları "Ekip" belgelerinden, güven rakamları (kuruluş yılı, belge numarası) "Site ayarları"ndan gelir.',
  ]),
  note('contactNote', contactPaths, [
    'Bu sayfanın tasarımı kodla hazırlanmıştır. "Sayfa metni"nden yalnızca maddeli liste içeren bölümler sitede görünür; diğer bölümler görünmez.',
    'Telefon, WhatsApp, e-posta, adres ve sosyal medya bağlantıları için "Site ayarları" belgesini düzenleyin: sitede her yerde oradan gelir.',
  ]),
  note('hubNote', hubPaths, [
    'Ülke ve kombinasyon kartları kodla oluşturulur. "Sayfa metni"nden yalnızca sayfanın sonundaki rehber bölümleri sitede görünür (başlığında "packages", "vacations" veya "holidays" geçmeyen son bölümler); baştaki bölümler görünmez. "Sık sorulan sorular" görünür.',
  ]),
];

/** English description of a page drawn in code: the site uses it only when it is 120 to 160 characters long (docs/project-plan.md Ek H.3). */
const codedMetaDescription = (paths: string[]) =>
  defineField({
    ...metaDescriptionField,
    validation: (rule) => [
      rule.required().max(200).warning('Yaklaşık 160 karakteri aşarsa Google açıklamayı kesebilir.'),
      rule
        .custom((value: string | undefined, context: ValidationContext) => {
          const doc = context.document as { language?: string; path?: string } | undefined;
          if (!value || doc?.language !== 'en' || !paths.includes(doc.path ?? '')) {return true;}
          return value.length >= 120 && value.length <= 160
            ? true
            : 'Bu sayfada İngilizce açıklama yalnızca 120-160 karakter arasındaysa sitede kullanılır. Şu an sitede kodla yazılmış açıklama görünüyor.';
        })
        .warning(),
    ],
  });

function pageType(
  name: string,
  title: string,
  kind: string,
  kindOptions?: { value: string; title: string }[],
  extraFields: ReturnType<typeof defineField>[] = [],
  replaceFields: Record<string, ReturnType<typeof defineField>> = {},
) {
  const body = pageFields.slice(1).map((field) => replaceFields[field.name] ?? field);
  // the notes sit right under the title, before the texts they talk about
  body.splice(body.findIndex((field) => field.name === 'title') + 1, 0, ...(name === 'staticPage' || name === 'hubPage' ? pageNotes : []));
  return defineType({
    name,
    title,
    type: 'document',
    fields: [
      pageFields[0]!,
      kindField(kindOptions ?? [{ value: kind, title }], kind, Boolean(kindOptions)),
      ...body,
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

/** The countries of the site, as on the tours. */
export const countryOptions = [
  { title: 'Türkiye', value: 'turkey' },
  { title: 'Yunanistan', value: 'greece' },
  { title: 'Mısır', value: 'egypt' },
  { title: 'Ürdün', value: 'jordan' },
  { title: 'Fas', value: 'morocco' },
];

/** The countries the folder of a blog category names: `blog/turkey-greece` two, `blog/turkey` one. */
const folderCountries = (path: string | undefined) => countryOptions.filter((c) => (path ?? '').split('/')[1]?.includes(c.value));

/** What the site shows from the countries: tours of those countries and guides about them, under every post of the category. */
const categoryCountriesField = defineField({
  name: 'countries',
  title: 'Ülkeler',
  type: 'array',
  description:
    'Bu kategorinin hangi ülkelerle ilgili olduğu. Tek ülkelik kategoride o ülkeyi, birden çok ülkeyi kapsayan kategoride (örneğin Türkiye ve Yunanistan) hepsini işaretleyin. Sitede: kategorideki her yazının altındaki turlar ve rehberler bu ülkelere göre gelir. En az bir ülke seçilmeden kategori yayınlanamaz.',
  of: [{ type: 'string' }],
  options: { list: countryOptions, layout: 'grid' },
  validation: (rule) => [
    rule.required().min(1).error('Kategorinin ilgili olduğu en az bir ülkeyi seçin. Seçilmezse yazıların altında tur ve rehber bölümleri çıkmaz.'),
    rule.unique(),
    rule
      .custom((value: string[] | undefined, context: ValidationContext) => {
        const expected = folderCountries((context.document as { path?: string } | undefined)?.path);
        const missing = expected.filter((c) => !(value ?? []).includes(c.value));
        return !value || missing.length === 0
          ? true
          : `Kategori adresi ${missing.map((c) => c.title).join(', ')} ülkesini içeriyor ama burada seçili değil. Doğruysa bu uyarıyı yok sayabilirsiniz.`;
      })
      .warning(),
  ],
});

/** Fields only blog posts have: who wrote it, the answer in a nutshell and when the facts were last checked. */
const blogFields = [
  defineField({
    name: 'author',
    title: 'Yazar',
    type: 'reference',
    to: [{ type: 'author' }],
    description:
      'Yazının altında imza olarak ve yazar kartında gösterilir. Seçmezseniz yazıda imza görünmez ve arama motorlarına yazar olarak "Eztravel Turkey" bildirilir; yazıyı yazan veya inceleyen bir kişi varsa seçmeniz önerilir (okurlar ve arama motorları adı belli bir yazara güvenir).',
    validation: (rule) =>
      rule
        .custom((value, context: ValidationContext) => {
          // The posts moved from the old site have no author and are credited to Eztravel Turkey (structured data). A new post without
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
    name: 'countries',
    title: 'Ülkeler (isteğe bağlı)',
    type: 'array',
    description:
      'Boş bırakırsanız yazı kategorisinin ülkelerini kullanır (çoğu yazı için doğrusu budur). Yalnızca yazı kategorisinden başka ülkeleri de ilgilendiriyorsa doldurun; örneğin "turkey" klasöründeki bir Türkiye ve Yunanistan yazısında ikisini de işaretleyin. Sitede: yazının altındaki turlar ve rehberler bu ülkelere göre gelir; yazı o ülkelerin sayfalarındaki rehber listelerinde de görünür.',
    of: [{ type: 'string' }],
    options: { list: countryOptions, layout: 'grid' },
    validation: (rule) => rule.unique(),
  }),
  defineField({
    name: 'relatedPosts',
    title: 'İlgili yazılar (isteğe bağlı)',
    type: 'array',
    description:
      'Boş bırakırsanız sitede aynı kategorideki ve aynı ülkelerle ilgili yazılar otomatik gösterilir. Belirli yazıları öne çıkarmak isterseniz buradan seçin (en fazla 6, sırayla gösterilir). Sitede: yazının altındaki "旅遊指南" kartları. Yazının adresi değişse de bağlantı bozulmaz.',
    of: [
      {
        type: 'reference',
        to: [{ type: 'blogPost' }],
        weak: true,
        options: {
          filter: ({ document }: { document: { language?: string; _id?: string } }) => ({
            filter: 'language == $language && !(_id in [$id, "drafts." + $id])',
            params: { language: document?.language ?? 'zh', id: (document?._id ?? '').replace(/^drafts./, '') },
          }),
        },
      },
    ],
    validation: (rule) => [rule.max(6).warning('En fazla 6 yazı gösterilir.'), rule.unique()],
  }),
  defineField({
    name: 'relatedTours',
    title: 'İlgili turlar (isteğe bağlı)',
    type: 'array',
    description:
      'Boş bırakırsanız sitede yazının konusuna uygun turlar otomatik gösterilir (yazının başlığında geçen şehirleri gezen turlar; konusu belli bir şehir olmayan yazılarda ülkenin turları). Belirli turları göstermek isterseniz buradan seçin (en fazla 6, sırayla gösterilir). Sitede: yazının altındaki tur kartları.',
    of: [
      {
        type: 'reference',
        to: [{ type: 'tour' }],
        weak: true,
        options: {
          filter: ({ document }: { document: { language?: string } }) => ({
            filter: 'language == $language',
            params: { language: document?.language ?? 'zh' },
          }),
        },
      },
    ],
    validation: (rule) => [rule.max(6).warning('En fazla 6 tur gösterilir.'), rule.unique()],
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
        const doc = context.document as { _id?: string; language?: string; path?: string } | undefined;
        const id = (doc?._id ?? '').replace(/^drafts\./, '');
        // A post that is already published and whose address was changed must list the address it had: without it the old address
        // answers 404 and the links and Google results that point to it are lost. Read from the published copy (`raw` on purpose: with
        // the Studio's default perspective the draft is laid over the published copy, so the "published" path would be the draft's own
        // and the check would never fire). Where the published copy cannot be read, the check lets the post through.
        if (id && doc?.path) {
          const publishedPath = await context
            .getClient({ apiVersion: '2025-01-01' })
            .withConfig({ perspective: 'raw', useCdn: false })
            .fetch<string | null>('*[_id == $id][0].path', { id })
            .catch(() => null);
          if (publishedPath && publishedPath !== doc.path) {
            const before = normalizeOldUrl(`/${doc.language ?? 'zh'}/${publishedPath}`);
            if (!(values ?? []).some((value) => normalizeOldUrl(value) === before)) {
              return `Yazının adresi değişti. Eski adresi bu listeye ekleyin, yoksa eski adres açılmaz ve ona gelen bağlantılar ile Google sonuçları kaybolur: ${before}`;
            }
          }
        }
        if (!values?.length) {return true;}
        const own = `/${doc?.language ?? 'zh'}/${doc?.path ?? ''}/`;
        const client = context.getClient({ apiVersion: '2025-01-01' });
        const seen = new Set<string>();
        for (const value of values) {
          const url = normalizeOldUrl(value);
          const match = /^\/(zh)\/(.+)\/$/.exec(url);
          if (!match) {return `${value}: eski sayfanın adresini /zh/ ile başlayacak şekilde yazın.`;}
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
export const blogCategory = pageType('blogCategory', 'Blog kategorisi', 'blog-category', undefined, [categoryCountriesField], {
  path: { ...pathField, components: { input: autoPathInput('blogCategory') } },
});
export const author = pageType('author', 'Yazar', 'author', undefined, [], {
  path: { ...pathField, components: { input: autoPathInput('author') } },
});
export const staticPage = pageType('staticPage', 'Metin sayfası (hakkımızda, yasal)', 'static', undefined, [], {
  path: { ...pathField, components: { input: autoPathInput('staticPage') } },
  // About, Contact and FAQ draw their own layout: the picture and (in English) a description outside 120-160 characters do nothing there.
  mainImage: { ...mainImageField, hidden: pathIn(codedPaths) },
  metaDescription: codedMetaDescription(['about', 'contact', 'faq']),
});
export const hubPage = pageType('hubPage', 'Ana bölüm sayfası', 'destinations-hub', kinds.hubPage, [], {
  // The hubs draw a banner from the code: this picture is never shown.
  mainImage: { ...mainImageField, hidden: true },
  metaDescription: codedMetaDescription(['destinations']),
});

/** The home page of a language: its meta texts and the cards (combinations and tours) it features. */
export const homePage = defineType({
  name: 'homePage',
  title: 'Ana sayfa',
  type: 'document',
  fields: [
    languageField,
    defineField({ name: 'kind', title: 'Sayfa türü', type: 'string', initialValue: 'home', readOnly: true }),
    { ...titleField, title: 'Ana başlık (H1)', description: 'Ana sayfanın en üstündeki büyük başlık.' },
    defineField({
      name: 'heroText',
      title: 'Giriş metni (ana başlığın altındaki paragraf)',
      type: 'text',
      rows: 3,
      description:
        'Ana başlığın hemen altında, ilk ekranda görünen kısa paragraf. Boş bırakırsanız sitenin kendi metni gösterilir. Bu, "Arama sonucu açıklaması" alanından ayrıdır: o yalnızca Google sonuçlarında görünür.',
      validation: (rule) => rule.max(400).warning('Giriş metnini yaklaşık 200 karakterin altında tutun; uzun metin ilk ekranı doldurur.'),
    }),
    defineField({
      name: 'homeNote',
      title: 'Bu sayfa nasıl oluşuyor?',
      type: 'string',
      components: {
        input: infoNote([
          'Ana sayfanın tasarımı kodla hazırlanmıştır. Burada yalnızca ana başlık (H1), başlığın altındaki giriş metni, arama sonucu başlığı ve açıklaması (Google sonuçlarında görünen) ile sayfanın altındaki "Sık sorulan sorular" düzenlenir. Öne çıkan turlar ve destinasyonlar turlardan ve ülke sayfalarından otomatik gelir.',
        ]),
      },
    }),
    metaTitleField,
    metaDescriptionField,
    // Hidden: the home page's pictures come from the code; this one is never shown.
    { ...mainImageField, hidden: true },
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

import { defineField, defineType } from 'sanity';
import { autoPathInput } from '../components/AutoPathInput';
import { infoNote } from '../components/InfoNote';
import {
  canonicalUrlField,
  faqsField,
  languageField,
  metaDescriptionField,
  metaTitleField,
  noindexField,
  pathField,
  titleField,
  translationGroupField,
} from './fields';

/** The folder a tour lives in under /destinations: a country or a multi-country combination. */
export const tourParents = [
  { title: 'Türkiye', value: 'turkey-tours' },
  { title: 'Yunanistan', value: 'greece-tours' },
  { title: 'Mısır', value: 'egypt-tours' },
  { title: 'Ürdün', value: 'jordan-tours' },
  { title: 'Fas', value: 'morocco-tours' },
  { title: 'Kombinasyon: Türkiye ve Yunanistan', value: 'turkey-greece-tours' },
  { title: 'Kombinasyon: Türkiye ve Mısır', value: 'turkey-and-egypt-tours' },
  { title: 'Kombinasyon: Türkiye ve Ürdün', value: 'turkey-and-jordan-tours' },
  { title: 'Kombinasyon: Yunanistan ve Mısır', value: 'greece-and-egypt-tours' },
  { title: 'Kombinasyon: Yunanistan ve Ürdün', value: 'greece-and-jordan-tours' },
  { title: 'Kombinasyon: Türkiye, Yunanistan ve Mısır', value: 'turkey-greece-and-egypt-tours' },
  // Çince site
  { title: 'Çince site: kombinasyonlar', value: 'combination-tours' },
  { title: 'Çince site: Türkiye ve Yunanistan', value: 'turkey-and-greece-tours' },
  // Japanese site
  { title: 'Japonca site: トルコ', value: 'トルコツアー' },
  { title: 'Japonca site: ギリシャ', value: 'ギリシャツアー' },
  { title: 'Japonca site: エジプト', value: 'エジプトツアー' },
  { title: 'Japonca site: ヨルダン', value: 'ヨルダンツアー' },
  { title: 'Japonca site: モロッコ', value: 'モロッコツアー' },
  { title: 'Japonca site: コンビネーション', value: 'コンビネーションツアー' },
];

const stringList = (name: string, title: string, description?: string) =>
  defineField({ name, title, description, type: 'array', of: [{ type: 'string' }] });

/**
 * The tabs of the form are the tabs of the tour page, in the same order and with the same names (English name after the dot), so an
 * editor who sees "Trip Requirements" on the site finds "Gereklilikler · Trip Requirements" here. Every field says where it shows.
 */
const groups = [
  { name: 'overview', title: 'Genel bakış · Overview', default: true },
  { name: 'itinerary', title: 'Program · Itinerary' },
  { name: 'inclusions', title: 'Dahil olanlar · Inclusions' },
  { name: 'requirements', title: 'Gereklilikler · Trip Requirements' },
  { name: 'faqs', title: 'Sık sorulan sorular · FAQs' },
  { name: 'routemap', title: 'Rota haritası · Route Map' },
  { name: 'price', title: 'Fiyat · Tour Price' },
  { name: 'payment', title: 'Ödeme özeti · Payment Summary' },
  { name: 'cancellation', title: 'İptal koşulları · Trip Cancellation Terms' },
  { name: 'media', title: 'Görseller' },
  { name: 'seo', title: 'Arama sonuçları' },
  { name: 'settings', title: 'Sayfa ayarları' },
];

export const tour = defineType({
  name: 'tour',
  title: 'Tur',
  type: 'document',
  groups,
  // Language, folder and address are on the first tab: the address is made from the title and the folder as the editor types, and a
  // field on another tab is not on the screen to do it.
  fieldsets: [{ name: 'address', title: 'Dil, klasör ve sayfa adresi', options: { collapsible: false } }],
  fields: [
    // ---- Dil, klasör ve adres (ilk sekmede)
    { ...languageField, group: 'overview', fieldset: 'address' },
    { ...translationGroupField, group: 'settings' },
    defineField({
      name: 'parent',
      title: 'Ülke veya kombinasyon',
      type: 'string',
      description: 'Turun sitede bulunduğu klasör. Adres ve tur listeleri buna göre oluşur.',
      options: { list: tourParents },
      validation: (rule) => rule.required(),
      group: 'overview',
      fieldset: 'address',
    }),
    defineField({
      name: 'category',
      title: 'Kategori klasörü',
      type: 'string',
      description:
        'Yalnızca Türkiye ve Yunanistan turlarında: adresteki süre veya paket klasörü, örneğin 06-to-09-days-tours. Tur doğrudan ülkenin altındaysa boş bırakın.',
      group: 'overview',
      fieldset: 'address',
    }),
    { ...pathField, group: 'overview', fieldset: 'address', components: { input: autoPathInput('tour') } },
    defineField({
      name: 'related',
      title: 'İlgili turlar',
      type: 'array',
      description: 'Sitede: sayfanın altındaki "Related Tours" bölümü.',
      group: 'settings',
      of: [{ type: 'reference', to: [{ type: 'tour' }], weak: true }],
    }),

    // ---- Genel bakış · Overview
    { ...titleField, description: 'Sitede: sayfanın en üstündeki başlık ve tur kartları.', group: 'overview' },
    defineField({
      name: 'summary',
      title: 'Genel bakış metni',
      type: 'text',
      rows: 5,
      description: 'Sitede: Overview sekmesinin ilk metni (tanıtım paragrafı).',
      group: 'overview',
    }),
    defineField({
      name: 'nights',
      title: 'Gece sayısı',
      type: 'number',
      description: 'Sitede: tur kartları ve süre göstergesi.',
      validation: (rule) => rule.min(0).integer(),
      group: 'overview',
    }),
    defineField({
      name: 'days',
      title: 'Gün sayısı',
      type: 'number',
      description: "Sitede: tur listelerindeki süre filtresi. Studio'da turlar bu sayıya göre klasörlenir.",
      validation: (rule) => rule.min(1).integer(),
      group: 'overview',
    }),
    defineField({
      name: 'facts',
      title: 'Tur bilgileri',
      type: 'object',
      description: 'Her satırın hangi sekmede göründüğü satırın altında yazıyor.',
      group: 'overview',
      fields: [
        defineField({
          name: 'duration',
          title: 'Süre (sitede göründüğü gibi)',
          type: 'string',
          description: 'Sitede: Overview sekmesi, "Trip at a glance" kutusu (Duration). Örneğin "07 Nights / 08 Days".',
        }),
        defineField({
          name: 'guideLanguages',
          title: 'Rehber dilleri',
          type: 'string',
          description: 'Sitede: Overview sekmesi, "Trip at a glance" kutusu (Guide languages).',
        }),
        defineField({
          name: 'groupType',
          title: 'Grup türü',
          type: 'string',
          description: 'Sitede: Overview sekmesi, "Trip at a glance" kutusu (Travel style) ve tur filtresi. Private (özel) veya Small Group (küçük grup).',
        }),
        defineField({
          name: 'season',
          title: 'Sezon',
          type: 'string',
          description: 'Sitede: Overview sekmesi (Season) ve Tour Price sekmesi.',
        }),
        defineField({
          name: 'flights',
          title: 'Uçuşlar',
          type: 'string',
          description: 'Sitede: Trip Requirements sekmesi (Flights).',
        }),
        defineField({
          name: 'difficulty',
          title: 'Zorluk',
          type: 'string',
          description: 'Sitede: Trip Requirements sekmesi (Physical difficulty).',
        }),
        defineField({
          name: 'cancellation',
          title: 'İptal (tek cümle)',
          type: 'string',
          description: 'Sitede: Trip Cancellation Terms sekmesinin en üstündeki kalın cümle.',
        }),
        defineField({
          name: 'startingPrice',
          title: 'Başlangıç fiyatı (eski sitedeki metin)',
          type: 'string',
          description: 'Sitede gösterilmez; eski sitedeki fiyat satırının kaydı. Fiyatı "Fiyat · Tour Price" sekmesinden girin.',
        }),
      ],
    }),
    {
      ...stringList('route', 'Rota', 'Sitede: Overview sekmesi, "Trip at a glance" (Route) ve tur kartları. Şehirler, seyahat sırasıyla.'),
      group: 'overview',
    },
    { ...stringList('highlights', 'Öne çıkanlar', 'Sitede: Overview sekmesi, "Highlights" listesi.'), group: 'overview' },

    // ---- Program · Itinerary
    defineField({
      name: 'itinerary',
      title: 'Gün gün program',
      type: 'array',
      description: 'Sitede: Itinerary sekmesi. Her gün ayrı bir satır.',
      group: 'itinerary',
      of: [
        defineField({
          name: 'day',
          type: 'object',
          fields: [
            defineField({ name: 'dayLabel', title: 'Gün', type: 'string', description: 'Örneğin "DAY 01" veya "DAY 02-03".' }),
            defineField({ name: 'title', title: 'Başlık', type: 'string' }),
            defineField({ name: 'text', title: 'Metin', type: 'text', rows: 6 }),
            defineField({ name: 'meals', title: 'Yemekler', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'dayLabel' } },
        }),
      ],
    }),
    defineField({
      name: 'hotels',
      title: 'Oteller',
      type: 'array',
      description:
        'Sitede: Itinerary sekmesi, "Hotels" tablosu. Grubun konakladığı yerler, her şehir için bir satır. Yalnızca doluysa sayfada gösterilir.',
      group: 'itinerary',
      of: [
        defineField({
          name: 'stay',
          type: 'object',
          fields: [
            defineField({ name: 'city', title: 'Şehir', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'nights', title: 'Gece sayısı', type: 'number', validation: (rule) => rule.min(1).integer() }),
            defineField({ name: 'name', title: 'Otel adı (isteğe bağlı)', type: 'string' }),
            defineField({ name: 'category', title: 'Kategori', type: 'string', description: 'Örneğin "4-star" veya "Boutique".' }),
          ],
          preview: { select: { title: 'city', subtitle: 'name' } },
        }),
      ],
    }),

    // ---- Dahil olanlar · Inclusions
    { ...stringList('included', 'Dahil olanlar', 'Sitede: Inclusions sekmesi, "Included" listesi. Her satıra bir madde.'), group: 'inclusions' },
    { ...stringList('excluded', 'Dahil olmayanlar', 'Sitede: Inclusions sekmesi, "Excluded" listesi. Her satıra bir madde.'), group: 'inclusions' },

    // ---- Gereklilikler · Trip Requirements
    defineField({
      name: 'requirementsInfo',
      title: 'Bu sekme nasıl oluşuyor?',
      type: 'string',
      group: 'requirements',
      components: {
        input: infoNote([
          'Sitedeki "Trip Requirements" sekmesi şunlardan oluşur: (1) Uçuşlar ve Zorluk: "Genel bakış" sekmesindeki "Tur bilgileri" kutusunda; (2) "Diğer bilgiler" ve "Önemli notlar": aşağıda; (3) pasaport, vize ve seyahat sigortası kuralları: bütün turlarda aynıdır, "Ortak tur metinleri" belgesinden düzenlenir.',
        ]),
      },
    }),
    defineField({
      name: 'extraFacts',
      title: 'Diğer bilgiler',
      type: 'array',
      description: 'Sitede: Trip Requirements sekmesi, bilgi satırları (etiket ve değer). Örneğin "Minimum yaş: 12".',
      group: 'requirements',
      of: [
        defineField({
          name: 'fact',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Etiket', type: 'string' }),
            defineField({ name: 'value', title: 'Değer', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    {
      ...stringList(
        'importantNotes',
        'Önemli notlar',
        'Sitede: Trip Requirements sekmesi, madde listesi. DİKKAT: "Price" veya "Prices" ile başlayan bir madde, sitede bu sekmede değil Tour Price sekmesinde gösterilir (fiyatla ilgili notlar için kullanın).',
      ),
      group: 'requirements',
    },

    // ---- SSS · FAQs
    { ...faqsField, description: 'Sitede: FAQs sekmesi. Her soru ve cevap ayrı bir satır.', group: 'faqs' },

    // ---- Rota haritası · Route Map
    defineField({
      name: 'routeMap',
      title: 'Rota haritası',
      type: 'object',
      description: 'Sitede: Route Map sekmesi. Harita görseli yoksa sekme hiç görünmez.',
      group: 'routemap',
      fields: [
        defineField({ name: 'image', title: 'Harita görseli', type: 'picture' }),
        defineField({ name: 'intro', title: 'Giriş metni', type: 'text', rows: 3 }),
      ],
    }),

    // ---- Fiyat · Tour Price
    defineField({
      name: 'price',
      title: 'Başlangıç fiyatı',
      type: 'object',
      description:
        'Sitede: Tour Price sekmesi, tur kartları ve sağdaki fiyat kutusu. İki para birimini de girin; site dolu olan her para birimini gösterir, birini gizlemek için boş bırakın.',
      group: 'price',
      fields: [
        defineField({ name: 'eur', title: 'Kişi başı fiyat (EUR)', type: 'number', validation: (rule) => rule.min(0) }),
        defineField({ name: 'usd', title: 'Kişi başı fiyat (USD)', type: 'number', validation: (rule) => rule.min(0) }),
        defineField({ name: 'unit', title: 'Fiyat birimi', type: 'string', initialValue: 'Per person' }),
        defineField({ name: 'note', title: 'Fiyatın altındaki not', type: 'string' }),
      ],
    }),
    defineField({
      name: 'departures',
      title: 'Kalkış seçenekleri',
      type: 'array',
      description:
        'Sitede: Tour Price sekmesi, "Departures" listesi ve sağdaki fiyat kutusu. Örneğin "Daily", "Every Monday and Thursday" veya sabit tarihler. Her satıra bir seçenek.',
      of: [{ type: 'string' }],
      group: 'price',
    }),
    defineField({
      name: 'priceSections',
      title: 'Fiyat tabloları ve diğer fiyat metinleri',
      type: 'array',
      description: 'Sitede: Tour Price sekmesinin altındaki metin ve tablolar (özellikle Çince ve Japonca sitelerin fiyat tabloları).',
      group: 'price',
      of: [{ type: 'section' }],
    }),

    // ---- Ödeme özeti · Payment Summary
    defineField({
      name: 'paymentInfo',
      title: 'Bu sekme nasıl oluşuyor?',
      type: 'string',
      group: 'payment',
      components: {
        input: infoNote([
          'Sitedeki "Payment Summary" sekmesi (kapora, kalan ödeme, ödeme yöntemleri) bütün turlarda aynıdır. Turun içinde düzenlenmez; ana menüdeki "Ortak tur metinleri" belgesinden, dil başına düzenlenir.',
        ]),
      },
    }),

    // ---- İptal koşulları · Trip Cancellation Terms
    {
      ...stringList(
        'cancellationPolicy',
        'İptal koşulları',
        'Sitede: Trip Cancellation Terms sekmesi, madde listesi (en üstteki kalın cümle "Genel bakış > Tur bilgileri > İptal" alanındandır). Her satıra bir madde.',
      ),
      group: 'cancellation',
    },

    // ---- Görseller
    defineField({
      name: 'heroImage',
      title: 'Ana görsel (isteğe bağlı)',
      type: 'picture',
      description:
        'Sitede: sayfanın üstündeki ve tur kartındaki büyük görsel. Boş bırakırsanız galerinin ilk görseli kullanılır. En az 1800 piksel genişliğinde, geniş bir görsel kullanın.',
      group: 'media',
    }),
    defineField({
      name: 'gallery',
      title: 'Galeri',
      type: 'array',
      description: 'Sitede: Overview sekmesindeki fotoğraf galerisi.',
      of: [{ type: 'picture' }],
      group: 'media',
    }),

    // ---- Arama sonuçları
    { ...metaTitleField, group: 'seo' },
    { ...metaDescriptionField, group: 'seo' },
    { ...noindexField, group: 'seo' },
    { ...canonicalUrlField, group: 'seo' },
  ],
  orderings: [{ title: 'Sayfa adresi', name: 'path', by: [{ field: 'path', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', path: 'path', days: 'days', eur: 'price.eur', media: 'gallery.0' },
    // The length and the price first: in a list of tours that is what tells them apart; the address follows.
    prepare: ({ title, path, days, eur, media }) => ({
      title,
      subtitle: [days ? `${days} gün` : '', eur ? `€${eur}` : '', path].filter(Boolean).join(' · '),
      media,
    }),
  },
});

import { defineField, defineType } from 'sanity';
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

export const tour = defineType({
  name: 'tour',
  title: 'Tur',
  type: 'document',
  groups: [
    { name: 'basics', title: 'Temel bilgiler', default: true },
    { name: 'itinerary', title: 'Program' },
    { name: 'details', title: 'Dahil olanlar ve notlar' },
    { name: 'media', title: 'Görseller' },
    { name: 'seo', title: 'Arama sonuçları' },
  ],
  fields: [
    { ...languageField, group: 'basics' },
    { ...pathField, group: 'basics' },
    { ...translationGroupField, group: 'basics' },
    defineField({
      name: 'parent',
      title: 'Ülke veya kombinasyon',
      type: 'string',
      description: 'Turun sitede bulunduğu klasör.',
      options: { list: tourParents },
      validation: (rule) => rule.required(),
      group: 'basics',
    }),
    defineField({
      name: 'category',
      title: 'Kategori klasörü',
      type: 'string',
      description:
        'Yalnızca Türkiye ve Yunanistan turlarında: adresteki süre veya paket klasörü, örneğin 06-to-09-days-tours. Tur doğrudan ülkenin altındaysa boş bırakın.',
      group: 'basics',
    }),
    { ...titleField, group: 'basics' },
    defineField({
      name: 'summary',
      title: 'Genel bakış',
      type: 'text',
      rows: 5,
      description: 'Tur sayfasının üstündeki tanıtım metni.',
      group: 'basics',
    }),
    defineField({ name: 'nights', title: 'Gece sayısı', type: 'number', validation: (rule) => rule.min(0).integer(), group: 'basics' }),
    defineField({ name: 'days', title: 'Gün sayısı', type: 'number', validation: (rule) => rule.min(1).integer(), group: 'basics' }),
    defineField({
      name: 'price',
      title: 'Başlangıç fiyatı',
      type: 'object',
      description: 'İki para birimini de girin. Site, dolu olan her para birimini gösterir; birini gizlemek için boş bırakın.',
      group: 'basics',
      fields: [
        defineField({
          name: 'eur',
          title: 'Kişi başı fiyat (EUR)',
          type: 'number',
          validation: (rule) => rule.min(0),
        }),
        defineField({
          name: 'usd',
          title: 'Kişi başı fiyat (USD)',
          type: 'number',
          validation: (rule) => rule.min(0),
        }),
        defineField({ name: 'unit', title: 'Fiyat birimi', type: 'string', initialValue: 'Per person' }),
        defineField({ name: 'note', title: 'Fiyatın altındaki not', type: 'string' }),
      ],
    }),
    defineField({
      name: 'departures',
      title: 'Kalkış seçenekleri',
      type: 'array',
      description: 'Örneğin "Daily", "Every Monday and Thursday" veya sabit tarihler. Her satıra bir seçenek.',
      of: [{ type: 'string' }],
      group: 'basics',
    }),
    defineField({
      name: 'facts',
      title: 'Tur bilgileri',
      type: 'object',
      group: 'basics',
      fields: [
        defineField({ name: 'duration', title: 'Süre (sitede göründüğü gibi)', type: 'string', description: 'Örneğin "07 Nights / 08 Days".' }),
        defineField({ name: 'guideLanguages', title: 'Rehber dilleri', type: 'string' }),
        defineField({ name: 'groupType', title: 'Grup türü', type: 'string', description: 'Private (özel) veya Small Group (küçük grup).' }),
        defineField({ name: 'flights', title: 'Uçuşlar', type: 'string' }),
        defineField({ name: 'startingPrice', title: 'Başlangıç fiyatı (sitede göründüğü gibi)', type: 'string' }),
        defineField({ name: 'cancellation', title: 'İptal', type: 'string' }),
        defineField({ name: 'difficulty', title: 'Zorluk', type: 'string' }),
        defineField({ name: 'season', title: 'Sezon', type: 'string' }),
      ],
    }),
    defineField({
      name: 'extraFacts',
      title: 'Diğer bilgiler',
      type: 'array',
      group: 'basics',
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
    { ...stringList('route', 'Rota', 'Şehirler, seyahat sırasıyla.'), group: 'itinerary' },
    { ...stringList('highlights', 'Öne çıkanlar'), group: 'itinerary' },
    defineField({
      name: 'routeMap',
      title: 'Rota haritası',
      type: 'object',
      group: 'itinerary',
      fields: [
        defineField({ name: 'image', title: 'Harita görseli', type: 'picture' }),
        defineField({ name: 'intro', title: 'Giriş metni', type: 'text', rows: 3 }),
      ],
    }),
    defineField({
      name: 'itinerary',
      title: 'Gün gün program',
      type: 'array',
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
      description: 'Grubun konakladığı yerler, her şehir için bir satır. Yalnızca doluysa sayfada gösterilir.',
      group: 'details',
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
    { ...stringList('included', 'Dahil olanlar'), group: 'details' },
    { ...stringList('excluded', 'Dahil olmayanlar'), group: 'details' },
    { ...stringList('importantNotes', 'Önemli notlar'), group: 'details' },
    defineField({
      name: 'priceSections',
      title: 'Fiyat tabloları ve diğer fiyat metinleri',
      type: 'array',
      description: 'Tur sayfasındaki fiyat sekmesinin metin ve tabloları, örneğin Çince ve Japonca sitelerin fiyat tabloları.',
      group: 'details',
      of: [{ type: 'section' }],
    }),
    { ...stringList('cancellationPolicy', 'İptal koşulları'), group: 'details' },
    { ...faqsField, group: 'details' },
    defineField({
      name: 'related',
      title: 'İlgili turlar',
      type: 'array',
      group: 'details',
      of: [{ type: 'reference', to: [{ type: 'tour' }], weak: true }],
    }),
    defineField({
      name: 'heroImage',
      title: 'Ana görsel (isteğe bağlı)',
      type: 'picture',
      description:
        'Tur sayfasının üstündeki ve kartındaki büyük görsel. Boş bırakırsanız galerinin ilk görseli kullanılır. En az 1800 piksel genişliğinde, geniş bir görsel kullanın.',
      group: 'media',
    }),
    defineField({ name: 'gallery', title: 'Galeri', type: 'array', of: [{ type: 'picture' }], group: 'media' }),
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

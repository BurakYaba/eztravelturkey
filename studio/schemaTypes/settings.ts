import { defineField, defineType } from 'sanity';
import { languageField } from './fields';

/**
 * Contact details, social accounts and the trust numbers of a language. One document per language: what a language leaves empty is
 * taken from the English one, and what English leaves empty from the site's built-in values, so only what differs has to be written.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site ayarları',
  type: 'document',
  fieldsets: [
    { name: 'contact', title: 'İletişim', options: { collapsible: true, collapsed: false } },
    { name: 'address', title: 'Adres', options: { collapsible: true, collapsed: false } },
    { name: 'social', title: 'Sosyal medya ve diğer bağlantılar', options: { collapsible: true, collapsed: false } },
    { name: 'trust', title: 'Güven rakamları', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    { ...languageField, description: 'Bu ayarların geçerli olduğu dil. Boş bıraktığınız alan İngilizce ayarlardan alınır.' },
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
      fieldset: 'contact',
      description: 'Sitede: alt bilgi, İletişim ve Gezi Planla sayfaları, arama sonuçlarındaki kurum bilgisi. Örneğin +90 (212) 458 65 65.',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp numarası',
      type: 'string',
      fieldset: 'contact',
      description: 'Sitede: tüm "WhatsApp" düğmeleri ve bağlantıları. Ülke koduyla yazın, örneğin +90 (532) 493 51 98.',
      validation: (rule) =>
        rule.custom((value: string | undefined) => (!value || value.replace(/\D/g, '').length >= 10 ? true : 'Ülke koduyla birlikte tam numarayı yazın.')),
    }),
    defineField({
      name: 'email',
      title: 'E-posta',
      type: 'string',
      fieldset: 'contact',
      description: 'Sitede: alt bilgi ve İletişim sayfası. Boş bırakırsanız e-posta adresi gösterilmez (eski site de göstermiyordu).',
      validation: (rule) => rule.email(),
    }),
    defineField({ name: 'street', title: 'Sokak ve numara', type: 'string', fieldset: 'address' }),
    defineField({ name: 'district', title: 'Mahalle / ilçe', type: 'string', fieldset: 'address' }),
    defineField({ name: 'city', title: 'Şehir', type: 'string', fieldset: 'address' }),
    defineField({ name: 'postalCode', title: 'Posta kodu', type: 'string', fieldset: 'address' }),
    defineField({ name: 'country', title: 'Ülke', type: 'string', fieldset: 'address' }),
    defineField({
      name: 'facebook',
      title: 'Facebook',
      type: 'url',
      fieldset: 'social',
      description: 'Sitede: alt bilgi, İletişim sayfası ve arama sonuçlarındaki kurum bilgisi (sameAs). Boş bırakırsanız simge görünmez.',
      validation: (rule) => rule.uri({ scheme: ['https', 'http'] }),
    }),
    defineField({ name: 'instagram', title: 'Instagram', type: 'url', fieldset: 'social', validation: (rule) => rule.uri({ scheme: ['https', 'http'] }) }),
    defineField({ name: 'linkedin', title: 'LinkedIn', type: 'url', fieldset: 'social', validation: (rule) => rule.uri({ scheme: ['https', 'http'] }) }),
    defineField({ name: 'x', title: 'X (Twitter)', type: 'url', fieldset: 'social', validation: (rule) => rule.uri({ scheme: ['https', 'http'] }) }),
    defineField({ name: 'youtube', title: 'YouTube', type: 'url', fieldset: 'social', validation: (rule) => rule.uri({ scheme: ['https', 'http'] }) }),
    defineField({
      name: 'tripadvisor',
      title: 'Tripadvisor sayfası',
      type: 'url',
      fieldset: 'social',
      description: 'Sitede: Tripadvisor rozeti, yorum bölümü bağlantıları ve arama sonuçlarındaki kurum bilgisi.',
      validation: (rule) => rule.uri({ scheme: ['https', 'http'] }),
    }),
    defineField({
      name: 'otherLinks',
      title: 'Diğer bağlantılar',
      type: 'array',
      fieldset: 'social',
      description: 'Listede olmayan hesaplar: örneğin LINE (Japonca), Weibo (Çince). Alt bilgide ve İletişim sayfasında etiketiyle görünür.',
      of: [
        defineField({
          name: 'link',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Ad', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'url', title: 'Adres', type: 'url', validation: (rule) => rule.required().uri({ scheme: ['https', 'http'] }) }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({ name: 'founded', title: 'Kuruluş yılı', type: 'number', fieldset: 'trust', description: 'Sitede: "Since 1997" gibi güven çubuğu ve Hakkımızda sayfası.', validation: (rule) => rule.integer().min(1900) }),
    defineField({ name: 'licenseNo', title: 'TÜRSAB belge numarası', type: 'string', fieldset: 'trust', description: 'Sitede: güven çubuğu, Hakkımızda ve İletişim sayfaları.' }),
    defineField({ name: 'rating', title: 'Puan', type: 'string', fieldset: 'trust', description: 'Örneğin 5.0. Sitede: Tripadvisor yorum bölümü.' }),
    defineField({ name: 'reviewCount', title: 'Yorum sayısı', type: 'number', fieldset: 'trust', validation: (rule) => rule.integer().min(0) }),
    defineField({ name: 'travelers', title: 'Yolcu sayısı', type: 'string', fieldset: 'trust', description: 'Örneğin 35,000+.' }),
    defineField({ name: 'tours', title: 'Düzenlenen tur sayısı', type: 'string', fieldset: 'trust', description: 'Örneğin 2,500+.' }),
  ],
  preview: { select: { title: 'language' }, prepare: ({ title }) => ({ title: `Site ayarları: ${title === 'en' ? 'English' : title === 'cn' ? '简体中文' : title === 'jp' ? '日本語' : title}` }) },
});

/**
 * The texts every tour page repeats under its "Payment Summary" and "Trip Requirements" tabs, one document per language
 * (they used to be written into the site's code).
 */
export const tourTexts = defineType({
  name: 'tourTexts',
  title: 'Ortak tur metinleri',
  type: 'document',
  fields: [
    { ...languageField, description: 'Bu metinlerin dili. Her dilin kendi belgesi vardır; boş bırakılan bölüm sitede gösterilmez.' },
    defineField({
      name: 'paymentSteps',
      title: 'Ödeme özeti',
      type: 'array',
      description: 'Sitede: her turun "Payment Summary" sekmesi. Her satır bir ödeme adımı (örneğin kapora, kalan ödeme, ödeme yöntemleri).',
      of: [
        defineField({
          name: 'step',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Başlık', type: 'string', description: 'Örneğin "Deposit".', validation: (rule) => rule.required() }),
            defineField({ name: 'value', title: 'Değer', type: 'string', description: 'Örneğin "50%".' }),
            defineField({ name: 'text', title: 'Açıklama', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({
      name: 'rules',
      title: 'Pasaport, vize ve sigorta kuralları',
      type: 'array',
      description: 'Sitede: her turun "Trip Requirements" sekmesinin altındaki kurallar.',
      of: [
        defineField({
          name: 'rule',
          type: 'object',
          fields: [
            defineField({
              name: 'kind',
              title: 'Simge',
              type: 'string',
              options: {
                list: [
                  { title: 'Pasaport ve vize', value: 'passport' },
                  { title: 'Seyahat sigortası', value: 'insurance' },
                ],
                layout: 'radio',
              },
              initialValue: 'passport',
            }),
            defineField({ name: 'title', title: 'Başlık', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'text', title: 'Metin', type: 'text', rows: 5, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'language' }, prepare: ({ title }) => ({ title: `Ortak tur metinleri: ${title === 'en' ? 'English' : title === 'cn' ? '简体中文' : title === 'jp' ? '日本語' : title}` }) },
});

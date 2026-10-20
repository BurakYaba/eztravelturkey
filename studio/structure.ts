import type { StructureResolver } from 'sanity/structure';
import { languages } from './schemaTypes/fields';
import { tourParents } from './schemaTypes/tour';

type Builder = Parameters<StructureResolver>[0];

/** A list of one document type that opens a language first: Tours, then English, 繁體中文 or 日本語. Every list and item needs an id. */
const byLanguage = (S: Builder, type: string, title: string, orderBy = 'path') =>
  S.listItem()
    .id(type)
    .title(title)
    .child(
      S.list()
        .id(`${type}-languages`)
        .title(title)
        .items(
          languages.map((language) =>
            S.listItem()
              .id(`${type}-${language.value}`)
              .title(language.title)
              .child(
                S.documentList()
                  .id(`${type}-${language.value}-documents`)
                  .title(`${title}: ${language.title}`)
                  .schemaType(type)
                  .apiVersion('2025-01-01')
                  .filter('_type == $type && language == $language')
                  .params({ type, language: language.value })
                  .defaultOrdering([{ field: orderBy, direction: 'asc' }]),
              ),
          ),
        ),
    );

/**
 * The folders each language's tours live in on the site (the "Ülke veya kombinasyon" field of a tour). The Chinese and Japanese
 * sites have folders of their own. A tour whose folder is not listed here shows up under "Diğer".
 */
const tourFolders: Record<string, string[]> = {
  en: [
    'turkey-tours',
    'greece-tours',
    'egypt-tours',
    'jordan-tours',
    'morocco-tours',
    'turkey-greece-tours',
    'turkey-and-egypt-tours',
    'turkey-and-jordan-tours',
    'greece-and-egypt-tours',
    'greece-and-jordan-tours',
    'turkey-greece-and-egypt-tours',
  ],
  cn: ['turkey-tours', 'greece-tours', 'egypt-tours', 'jordan-tours', 'combination-tours', 'turkey-and-greece-tours'],
  jp: ['トルコツアー', 'ギリシャツアー', 'エジプトツアー', 'ヨルダンツアー', 'モロッコツアー', 'コンビネーションツアー'],
};

/** Length groups of a country's tours, from the "Gün sayısı" field. The last one catches tours without a length (activities, day trips). */
const lengths = [
  { id: 'short', title: '1–2 gün (günübirlik)', filter: 'defined(days) && days <= 2' },
  { id: '3-5', title: '3–5 gün', filter: 'days >= 3 && days <= 5' },
  { id: '6-9', title: '6–9 gün', filter: 'days >= 6 && days <= 9' },
  { id: '10-14', title: '10–14 gün', filter: 'days >= 10 && days <= 14' },
  { id: '15plus', title: '15 gün ve üzeri', filter: 'days >= 15' },
  { id: 'none', title: 'Süresi girilmemiş', filter: '!defined(days)' },
];

const folderTitle = (value: string) =>
  (tourParents.find((p) => p.value === value)?.title ?? value).replace(/^(Çince|Japonca) site: /, '');

const tourList = (S: Builder, id: string, title: string, language: string, extraFilter: string, params: Record<string, unknown> = {}) =>
  S.documentList()
    .id(id)
    .title(title)
    .schemaType('tour')
    .apiVersion('2025-01-01')
    .filter(`_type == "tour" && language == $language${extraFilter ? ` && ${extraFilter}` : ''}`)
    .params({ language, ...params })
    .defaultOrdering([
      { field: 'days', direction: 'asc' },
      { field: 'path', direction: 'asc' },
    ]);

/**
 * Tours: language, then country or combination, then length (3–5 days, 6–9 days ...), then the tours. Each level also has an
 * "all" item, so the flat list is still one click away.
 */
const tours = (S: Builder) =>
  S.listItem()
    .id('tour')
    .title('Turlar')
    .child(
      S.list()
        .id('tour-languages')
        .title('Turlar')
        .items(
          languages.map((language) => {
            const known = tourFolders[language.value] ?? [];
            return S.listItem()
              .id(`tour-${language.value}`)
              .title(language.title)
              .child(
                S.list()
                  .id(`tour-${language.value}-folders`)
                  .title(`Turlar: ${language.title}`)
                  .items([
                    S.listItem()
                      .id(`tour-${language.value}-all`)
                      .title('Tüm turlar')
                      .child(tourList(S, `tour-${language.value}-all-documents`, `Tüm turlar: ${language.title}`, language.value, '')),
                    S.divider(),
                    ...known.map((folder, index) =>
                      S.listItem()
                        .id(`tour-${language.value}-f${index}`)
                        .title(folderTitle(folder))
                        .child(
                          S.list()
                            .id(`tour-${language.value}-f${index}-lengths`)
                            .title(`${folderTitle(folder)}: süreye göre`)
                            .items([
                              S.listItem()
                                .id(`tour-${language.value}-f${index}-all`)
                                .title('Tümü')
                                .child(tourList(S, `tour-${language.value}-f${index}-all-documents`, folderTitle(folder), language.value, 'parent == $parent', { parent: folder })),
                              S.divider(),
                              ...lengths.map((length) =>
                                S.listItem()
                                  .id(`tour-${language.value}-f${index}-${length.id}`)
                                  .title(length.title)
                                  .child(
                                    tourList(
                                      S,
                                      `tour-${language.value}-f${index}-${length.id}-documents`,
                                      `${folderTitle(folder)}: ${length.title}`,
                                      language.value,
                                      `parent == $parent && ${length.filter}`,
                                      { parent: folder },
                                    ),
                                  ),
                              ),
                            ]),
                        ),
                    ),
                    S.divider(),
                    S.listItem()
                      .id(`tour-${language.value}-other`)
                      .title('Diğer (klasörü listede olmayan)')
                      .child(tourList(S, `tour-${language.value}-other-documents`, `Diğer: ${language.title}`, language.value, '!(parent in $known)', { known })),
                  ]),
              );
          }),
        ),
    );

/** The home page is one document per language. */
const homePages = (S: Builder) =>
  S.listItem()
    .id('homePage')
    .title('Ana sayfa')
    .child(
      S.list()
        .id('homePage-languages')
        .title('Ana sayfa')
        .items(
          languages.map((language) =>
            S.listItem()
              .id(`homePage-${language.value}`)
              .title(language.title)
              .child(
                S.documentList()
                  .id(`homePage-${language.value}-documents`)
                  .title(`Ana sayfa: ${language.title}`)
                  .schemaType('homePage')
                  .apiVersion('2025-01-01')
                  .filter('_type == "homePage" && language == $language')
                  .params({ language: language.value }),
              ),
          ),
        ),
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('Magnificent Travel')
    .items([
      tours(S),
      byLanguage(S, 'destinationPage', 'Destinasyon sayfaları'),
      byLanguage(S, 'blogPost', 'Blog yazıları'),
      byLanguage(S, 'blogCategory', 'Blog kategorileri'),
      byLanguage(S, 'author', 'Yazarlar'),
      byLanguage(S, 'staticPage', 'Metin sayfaları (hakkımızda, yasal)'),
      byLanguage(S, 'hubPage', 'Ana bölüm sayfaları (Destinasyonlar, Blog)'),
      homePages(S),
      byLanguage(S, 'teamMember', 'Ekip (Hakkımızda ve İletişim sayfaları)', 'order'),
    ]);

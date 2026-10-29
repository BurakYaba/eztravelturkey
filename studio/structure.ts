import type { StructureResolver } from 'sanity/structure';
import { tourParents } from './schemaTypes/tour';

type Builder = Parameters<StructureResolver>[0];

/** The one language of the site. Every list shows its documents; there is no language level to click through. */
const language = 'zh';

/** The "+" of a list: creates a document from one template, with its parameters (language, country). */
const createItem = (S: Builder, title: string, templateId: string, schemaType: string, parameters: Record<string, string>) =>
  S.menuItem().title(title).intent({ type: 'create', params: [{ type: schemaType, template: templateId }, parameters] }).showAsAction(true);

/** A list of one document type, opened straight onto its documents. Every list and item needs an id. */
const documents = (S: Builder, type: string, title: string, orderBy = 'path') =>
  S.listItem()
    .id(type)
    .title(title)
    .child(
      S.documentList()
        .id(`${type}-documents`)
        .title(title)
        .schemaType(type)
        .apiVersion('2025-01-01')
        .filter('_type == $type && language == $language')
        .params({ type, language })
        .initialValueTemplates([S.initialValueTemplateItem(`${type}-${language}`)])
        .menuItems([createItem(S, `Yeni ${title.toLowerCase()}`, `${type}-${language}`, type, {})])
        .defaultOrdering([{ field: orderBy, direction: 'asc' }]),
    );

/**
 * The folders the tours live in on the site (the "Ülke veya kombinasyon" field of a tour): those of the old eztravelturkey.com.
 * A tour whose folder is not listed here shows up under "Diğer".
 */
const tourFolders = ['turkey-tours', 'turkey-and-greece-tours', 'combination-tours', 'egypt-tours', 'greece-tours', 'jordan-tours'];

/** Length groups of a country's tours, from the "Gün sayısı" field. The last one catches tours without a length (activities, day trips). */
const lengths = [
  { id: 'short', title: '1–2 gün (günübirlik)', filter: 'defined(days) && days <= 2' },
  { id: '3-5', title: '3–5 gün', filter: 'days >= 3 && days <= 5' },
  { id: '6-9', title: '6–9 gün', filter: 'days >= 6 && days <= 9' },
  { id: '10-14', title: '10–14 gün', filter: 'days >= 10 && days <= 14' },
  { id: '15plus', title: '15 gün ve üzeri', filter: 'days >= 15' },
  { id: 'none', title: 'Süresi girilmemiş', filter: '!defined(days)' },
];

const folderTitle = (value: string) => tourParents.find((p) => p.value === value)?.title ?? value;

/** What "+" creates in a tour list: a tour, and in its country folder when the list has one. */
const newTour = (S: Builder, params: Record<string, unknown>) => [
  typeof params.parent === 'string'
    ? S.initialValueTemplateItem('tour-in-folder', { language, parent: params.parent })
    : S.initialValueTemplateItem(`tour-${language}`),
];

const tourList = (S: Builder, id: string, title: string, extraFilter: string, params: Record<string, unknown> = {}) =>
  S.documentTypeList('tour')
    .id(id)
    .title(title)
    .apiVersion('2025-01-01')
    .filter(`_type == "tour" && language == $language${extraFilter ? ` && ${extraFilter}` : ''}`)
    .params({ language, ...params })
    .initialValueTemplates(newTour(S, params))
    // Without this the "+" also offers the default new document of the type.
    .menuItems([
      typeof params.parent === 'string'
        ? createItem(S, 'Yeni tur', 'tour-in-folder', 'tour', { language, parent: params.parent })
        : createItem(S, 'Yeni tur', `tour-${language}`, 'tour', {}),
    ])
    .defaultOrdering([
      { field: 'days', direction: 'asc' },
      { field: 'path', direction: 'asc' },
    ]);

/**
 * Tours: country or combination, then length (3–5 days, 6–9 days ...), then the tours. Each level also has an "all" item, so the
 * flat list is still one click away.
 */
const tours = (S: Builder) =>
  S.listItem()
    .id('tour')
    .title('Turlar')
    .child(
      S.list()
        .id('tour-folders')
        .title('Turlar')
        .items([
          S.listItem().id('tour-all').title('Tüm turlar').child(tourList(S, 'tour-all-documents', 'Tüm turlar', '')),
          S.divider(),
          ...tourFolders.map((folder, index) =>
            S.listItem()
              .id(`tour-f${index}`)
              .title(folderTitle(folder))
              .child(
                S.list()
                  .id(`tour-f${index}-lengths`)
                  .title(`${folderTitle(folder)}: süreye göre`)
                  .items([
                    S.listItem()
                      .id(`tour-f${index}-all`)
                      .title('Tümü')
                      .child(tourList(S, `tour-f${index}-all-documents`, folderTitle(folder), 'parent == $parent', { parent: folder })),
                    S.divider(),
                    ...lengths.map((length) =>
                      S.listItem()
                        .id(`tour-f${index}-${length.id}`)
                        .title(length.title)
                        .child(
                          tourList(
                            S,
                            `tour-f${index}-${length.id}-documents`,
                            `${folderTitle(folder)}: ${length.title}`,
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
            .id('tour-other')
            .title('Diğer (klasörü listede olmayan)')
            .child(tourList(S, 'tour-other-documents', 'Diğer', '!(parent in $known)', { known: tourFolders })),
        ]),
    );

/** The home page is one document. */
const homePage = (S: Builder) =>
  S.listItem()
    .id('homePage')
    .title('Ana sayfa')
    .child(
      S.documentList()
        .id('homePage-documents')
        .title('Ana sayfa')
        .schemaType('homePage')
        .apiVersion('2025-01-01')
        .filter('_type == "homePage" && language == $language')
        .params({ language }),
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('Eztravel Turkey')
    .items([
      tours(S),
      documents(S, 'destinationPage', 'Destinasyon sayfaları'),
      documents(S, 'blogPost', 'Blog yazıları'),
      documents(S, 'blogCategory', 'Blog kategorileri'),
      documents(S, 'author', 'Yazarlar'),
      documents(S, 'staticPage', 'Metin sayfaları (hakkımızda, yasal)'),
      documents(S, 'hubPage', 'Ana bölüm sayfaları (Destinasyonlar, Blog)'),
      homePage(S),
      documents(S, 'teamMember', 'Ekip (Hakkımızda ve İletişim sayfaları)', 'order'),
      S.divider(),
      documents(S, 'siteSettings', 'Site ayarları (telefon, WhatsApp, adres, sosyal medya)', 'language'),
      documents(S, 'tourTexts', 'Ortak tur metinleri (ödeme özeti, pasaport ve sigorta)', 'language'),
    ]);

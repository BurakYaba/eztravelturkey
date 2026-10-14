import { defineField, defineType, type ValidationContext } from 'sanity';

/** Languages of the site. Every language has its own documents (docs/project-plan.md D9). */
export const languages = [
  { title: 'English', value: 'en' },
  { title: '繁體中文', value: 'zh' },
  { title: '日本語', value: 'jp' },
];

export const languageField = defineField({
  name: 'language',
  title: 'Language',
  type: 'string',
  description: 'The language this document is written in. Each language has its own documents.',
  options: { list: languages, layout: 'radio' },
  validation: (rule) => rule.required(),
});

/**
 * The address of the page without the language, no slash at the start or end, no spaces. It must follow the old site's
 * pattern (for example `destinations/turkey-tours/06-to-09-days-tours/my-tour`) and be unique within the language.
 */
export const pathField = defineField({
  name: 'path',
  title: 'Page address',
  type: 'string',
  description:
    'Address without the language and without slashes at the ends. Copy the pattern of a similar page. Example: blog/turkey/best-time-to-visit-turkey',
  validation: (rule) =>
    rule.required().custom(async (value: string | undefined, context: ValidationContext) => {
      if (!value) {return true;}
      if (/^\/|\/$|\s|\/\//.test(value)) {return 'No spaces, no slash at the start or end, no double slashes.';}
      if (value !== value.toLowerCase()) {return 'Use lowercase letters only.';}
      const doc = context.document as { _id?: string; language?: string } | undefined;
      const id = (doc?._id ?? '').replace(/^drafts\./, '');
      const taken = await context
        .getClient({ apiVersion: '2025-01-01' })
        .fetch<number>(
          'count(*[defined(path) && path == $path && language == $language && !(_id in [$id, "drafts." + $id])])',
          { path: value, language: doc?.language ?? '', id },
        );
      return taken > 0 ? 'Another page in this language already uses this address.' : true;
    }),
});

export const titleField = defineField({
  name: 'title',
  title: 'Page title (H1)',
  type: 'string',
  description: 'The main heading of the page.',
  validation: (rule) => rule.required(),
});

export const metaTitleField = defineField({
  name: 'metaTitle',
  title: 'Search result title',
  type: 'string',
  description: 'Shown in Google. The site name is added after it. About 50 to 60 characters.',
  validation: (rule) => rule.required().max(70).warning('Over about 60 characters, Google may cut the title.'),
});

export const metaDescriptionField = defineField({
  name: 'metaDescription',
  title: 'Search result description',
  type: 'text',
  rows: 3,
  description: 'Shown in Google under the title. About 120 to 160 characters.',
  validation: (rule) => rule.required().max(200).warning('Over about 160 characters, Google may cut the description.'),
});

/** A picture. The alt text describes it for people who cannot see it and for search engines. */
export const picture = defineType({
  name: 'picture',
  title: 'Picture',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe what the picture shows.',
      validation: (rule) => rule.required().warning('Add a short description of the picture.'),
    }),
  ],
});

export const faq = defineType({
  name: 'faq',
  title: 'Question and answer',
  type: 'object',
  fields: [
    defineField({ name: 'q', title: 'Question', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'a', title: 'Answer', type: 'text', rows: 4, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'q', subtitle: 'a' } },
});

export const faqsField = defineField({
  name: 'faqs',
  title: 'Frequently asked questions',
  type: 'array',
  of: [{ type: 'faq' }],
});

export const mainImageField = defineField({
  name: 'mainImage',
  title: 'Main picture',
  type: 'picture',
  description: 'Shown at the top of the page and on cards.',
});

// ---- the body of a page: sections made of paragraphs, lists, tables and pictures

export const paragraph = defineType({
  name: 'paragraph',
  title: 'Paragraph',
  type: 'object',
  fields: [defineField({ name: 'text', title: 'Text', type: 'text', rows: 4, validation: (rule) => rule.required() })],
  preview: {
    select: { title: 'text' },
    prepare: ({ title }) => ({ title: String(title ?? '').slice(0, 90), subtitle: 'Paragraph' }),
  },
});

export const list = defineType({
  name: 'list',
  title: 'List',
  type: 'object',
  fields: [
    defineField({ name: 'ordered', title: 'Numbered list', type: 'boolean', initialValue: false }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare: ({ items }) => ({ title: `${(items as string[] | undefined)?.length ?? 0} items`, subtitle: 'List' }),
  },
});

export const tableRow = defineType({
  name: 'tableRow',
  title: 'Table row',
  type: 'object',
  fields: [defineField({ name: 'cells', title: 'Cells', type: 'array', of: [{ type: 'string' }] })],
  preview: {
    select: { cells: 'cells' },
    prepare: ({ cells }) => ({ title: ((cells as string[] | undefined) ?? []).join(' | ') }),
  },
});

export const table = defineType({
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [defineField({ name: 'rows', title: 'Rows', type: 'array', of: [{ type: 'tableRow' }] })],
  preview: {
    select: { rows: 'rows' },
    prepare: ({ rows }) => ({ title: `${(rows as unknown[] | undefined)?.length ?? 0} rows`, subtitle: 'Table' }),
  },
});

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Picture',
  type: 'object',
  fields: [defineField({ name: 'image', title: 'Picture', type: 'picture', validation: (rule) => rule.required() })],
  preview: {
    select: { media: 'image', title: 'image.alt' },
    prepare: ({ media, title }) => ({ media, title: title ?? 'Picture', subtitle: 'Picture' }),
  },
});

export const section = defineType({
  name: 'section',
  title: 'Section',
  type: 'object',
  fields: [
    defineField({
      name: 'level',
      title: 'Heading level',
      type: 'number',
      description: '2 for a main section, 3 for a sub-section, 0 for text before the first heading.',
      options: { list: [0, 2, 3, 4] },
      initialValue: 2,
    }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'blocks',
      title: 'Content',
      type: 'array',
      of: [{ type: 'paragraph' }, { type: 'list' }, { type: 'table' }, { type: 'imageBlock' }],
    }),
  ],
  preview: {
    select: { title: 'heading', blocks: 'blocks' },
    prepare: ({ title, blocks }) => ({
      title: title || '(no heading)',
      subtitle: `${(blocks as unknown[] | undefined)?.length ?? 0} blocks`,
    }),
  },
});

export const sectionsField = defineField({
  name: 'sections',
  title: 'Page text',
  type: 'array',
  description: 'The text of the page, section by section.',
  of: [{ type: 'section' }],
});

/** Fields every text page has, in the order the editor sees them. */
export const pageFields = [
  languageField,
  pathField,
  titleField,
  metaTitleField,
  metaDescriptionField,
  mainImageField,
  sectionsField,
  faqsField,
];

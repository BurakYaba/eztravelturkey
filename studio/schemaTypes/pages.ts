import { defineField, defineType } from 'sanity';
import {
  languageField,
  mainImageField,
  metaDescriptionField,
  metaTitleField,
  pageFields,
  titleField,
} from './fields';

/**
 * Every text page type shares the same fields. The `kind` tells the site how to use the page and is set by the type
 * (destination pages and hub pages choose it themselves).
 */
const kindField = (options: { value: string; title: string }[], initial: string, editable: boolean) =>
  defineField({
    name: 'kind',
    title: 'Kind of page',
    type: 'string',
    options: { list: options, layout: 'radio' },
    initialValue: initial,
    readOnly: !editable,
    validation: (rule) => rule.required(),
  });

const kinds = {
  destinationPage: [
    { value: 'country', title: 'Country' },
    { value: 'combo', title: 'Multi-country combination' },
    { value: 'category', title: 'Category (length or package)' },
  ],
  hubPage: [
    { value: 'destinations-hub', title: 'Destinations hub' },
    { value: 'blog-hub', title: 'Blog hub' },
  ],
};

function pageType(
  name: string,
  title: string,
  kind: string,
  kindOptions?: { value: string; title: string }[],
  extraFields: ReturnType<typeof defineField>[] = [],
) {
  return defineType({
    name,
    title,
    type: 'document',
    fields: [
      pageFields[0]!,
      kindField(kindOptions ?? [{ value: kind, title }], kind, Boolean(kindOptions)),
      ...pageFields.slice(1),
      ...extraFields,
    ],
    orderings: [{ title: 'Page address', name: 'path', by: [{ field: 'path', direction: 'asc' }] }],
    preview: { select: { title: 'title', subtitle: 'path', media: 'mainImage' } },
  });
}

export const destinationPage = pageType('destinationPage', 'Destination page', 'country', kinds.destinationPage);
/** Fields only blog posts have: who wrote it, the answer in a nutshell and when the facts were last checked. */
const blogFields = [
  defineField({
    name: 'author',
    title: 'Author',
    type: 'reference',
    to: [{ type: 'author' }],
    description: 'Shown as the byline and in the author card. Posts without an author are credited to Magnificent Travel.',
  }),
  defineField({
    name: 'shortAnswer',
    title: 'Short answer',
    type: 'text',
    rows: 3,
    description: 'The answer to the question of the post in 40 to 60 words. Shown in a highlighted box before the text.',
    validation: (rule) => rule.max(400).warning('Keep the short answer under about 60 words.'),
  }),
  defineField({
    name: 'lastUpdated',
    title: 'Last updated',
    type: 'date',
    description: 'The day the facts in the post were last checked. Shown on the page and in search results.',
  }),
];

export const blogPost = pageType('blogPost', 'Blog post', 'blog-post', undefined, blogFields);
export const blogCategory = pageType('blogCategory', 'Blog category', 'blog-category');
export const author = pageType('author', 'Author', 'author');
export const staticPage = pageType('staticPage', 'Text page (about, legal)', 'static');
export const hubPage = pageType('hubPage', 'Hub page', 'destinations-hub', kinds.hubPage);

/** The home page of a language: its meta texts and the cards (combinations and tours) it features. */
export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  fields: [
    languageField,
    defineField({ name: 'kind', title: 'Kind of page', type: 'string', initialValue: 'home', readOnly: true }),
    titleField,
    metaTitleField,
    metaDescriptionField,
    mainImageField,
    defineField({
      name: 'cards',
      title: 'Featured cards',
      type: 'array',
      description: 'The combinations and tours the home page highlights, in order.',
      of: [
        defineField({
          name: 'card',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'href', title: 'Link', type: 'string', description: 'Site address such as /destinations/turkey-greece-tours/' }),
            defineField({ name: 'meta', title: 'Short facts', type: 'array', of: [{ type: 'string' }] }),
            defineField({ name: 'price', title: 'Price text', type: 'string' }),
            defineField({ name: 'image', title: 'Picture', type: 'picture' }),
          ],
          preview: { select: { title: 'title', subtitle: 'href', media: 'image' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'language' } },
});

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
const parents = [
  { title: 'Turkey', value: 'turkey-tours' },
  { title: 'Greece', value: 'greece-tours' },
  { title: 'Egypt', value: 'egypt-tours' },
  { title: 'Jordan', value: 'jordan-tours' },
  { title: 'Morocco', value: 'morocco-tours' },
  { title: 'Combination: Turkey and Greece', value: 'turkey-greece-tours' },
  { title: 'Combination: Turkey and Egypt', value: 'turkey-and-egypt-tours' },
  { title: 'Combination: Turkey and Jordan', value: 'turkey-and-jordan-tours' },
  { title: 'Combination: Greece and Egypt', value: 'greece-and-egypt-tours' },
  { title: 'Combination: Greece and Jordan', value: 'greece-and-jordan-tours' },
  { title: 'Combination: Turkey, Greece and Egypt', value: 'turkey-greece-and-egypt-tours' },
  // Chinese site
  { title: 'Chinese site: combinations', value: 'combination-tours' },
  { title: 'Chinese site: Turkey and Greece', value: 'turkey-and-greece-tours' },
  // Japanese site
  { title: 'Japanese site: トルコ', value: 'トルコツアー' },
  { title: 'Japanese site: ギリシャ', value: 'ギリシャツアー' },
  { title: 'Japanese site: エジプト', value: 'エジプトツアー' },
  { title: 'Japanese site: ヨルダン', value: 'ヨルダンツアー' },
  { title: 'Japanese site: モロッコ', value: 'モロッコツアー' },
  { title: 'Japanese site: コンビネーション', value: 'コンビネーションツアー' },
];

const stringList = (name: string, title: string, description?: string) =>
  defineField({ name, title, description, type: 'array', of: [{ type: 'string' }] });

export const tour = defineType({
  name: 'tour',
  title: 'Tour',
  type: 'document',
  groups: [
    { name: 'basics', title: 'Basics', default: true },
    { name: 'itinerary', title: 'Itinerary' },
    { name: 'details', title: 'Included and notes' },
    { name: 'media', title: 'Pictures' },
    { name: 'seo', title: 'Search results' },
  ],
  fields: [
    { ...languageField, group: 'basics' },
    { ...pathField, group: 'basics' },
    { ...translationGroupField, group: 'basics' },
    defineField({
      name: 'parent',
      title: 'Country or combination',
      type: 'string',
      description: 'The folder this tour sits in on the site.',
      options: { list: parents },
      validation: (rule) => rule.required(),
      group: 'basics',
    }),
    defineField({
      name: 'category',
      title: 'Category folder',
      type: 'string',
      description:
        'Only for Turkey and Greece tours: the length or package folder in the address, for example 06-to-09-days-tours. Leave empty when the tour sits directly under the country.',
      group: 'basics',
    }),
    { ...titleField, group: 'basics' },
    defineField({
      name: 'summary',
      title: 'Overview',
      type: 'text',
      rows: 5,
      description: 'The introduction at the top of the tour page.',
      group: 'basics',
    }),
    defineField({ name: 'nights', title: 'Nights', type: 'number', validation: (rule) => rule.min(0).integer(), group: 'basics' }),
    defineField({ name: 'days', title: 'Days', type: 'number', validation: (rule) => rule.min(1).integer(), group: 'basics' }),
    defineField({
      name: 'price',
      title: 'Starting price',
      type: 'object',
      description: 'Enter both currencies. The site shows every currency that is filled in; leave one empty to hide it.',
      group: 'basics',
      fields: [
        defineField({
          name: 'eur',
          title: 'Price per person in EUR',
          type: 'number',
          validation: (rule) => rule.min(0),
        }),
        defineField({
          name: 'usd',
          title: 'Price per person in USD',
          type: 'number',
          validation: (rule) => rule.min(0),
        }),
        defineField({ name: 'unit', title: 'Price is', type: 'string', initialValue: 'Per person' }),
        defineField({ name: 'note', title: 'Note under the price', type: 'string' }),
      ],
    }),
    defineField({
      name: 'departures',
      title: 'Departure options',
      type: 'array',
      description: 'For example "Daily", "Every Monday and Thursday" or fixed dates. One line each.',
      of: [{ type: 'string' }],
      group: 'basics',
    }),
    defineField({
      name: 'facts',
      title: 'Trip facts',
      type: 'object',
      group: 'basics',
      fields: [
        defineField({ name: 'duration', title: 'Duration (as shown)', type: 'string', description: 'For example "07 Nights / 08 Days".' }),
        defineField({ name: 'guideLanguages', title: 'Guide languages', type: 'string' }),
        defineField({ name: 'groupType', title: 'Group type', type: 'string', description: 'Private or Small Group.' }),
        defineField({ name: 'flights', title: 'Flights', type: 'string' }),
        defineField({ name: 'startingPrice', title: 'Starting price (as shown)', type: 'string' }),
        defineField({ name: 'cancellation', title: 'Cancellation', type: 'string' }),
        defineField({ name: 'difficulty', title: 'Difficulty', type: 'string' }),
        defineField({ name: 'season', title: 'Season', type: 'string' }),
      ],
    }),
    defineField({
      name: 'extraFacts',
      title: 'More facts',
      type: 'array',
      group: 'basics',
      of: [
        defineField({
          name: 'fact',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'value', title: 'Value', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    { ...stringList('route', 'Route', 'The cities, in travel order.'), group: 'itinerary' },
    { ...stringList('highlights', 'Highlights'), group: 'itinerary' },
    defineField({
      name: 'routeMap',
      title: 'Route map',
      type: 'object',
      group: 'itinerary',
      fields: [
        defineField({ name: 'image', title: 'Map picture', type: 'picture' }),
        defineField({ name: 'intro', title: 'Introduction', type: 'text', rows: 3 }),
      ],
    }),
    defineField({
      name: 'itinerary',
      title: 'Day by day',
      type: 'array',
      group: 'itinerary',
      of: [
        defineField({
          name: 'day',
          type: 'object',
          fields: [
            defineField({ name: 'dayLabel', title: 'Day', type: 'string', description: 'For example "DAY 01" or "DAY 02-03".' }),
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 6 }),
            defineField({ name: 'meals', title: 'Meals', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'dayLabel' } },
        }),
      ],
    }),
    defineField({
      name: 'hotels',
      title: 'Hotels',
      type: 'array',
      description: 'Where the group sleeps, one row per city. Shown on the page only when filled in.',
      group: 'details',
      of: [
        defineField({
          name: 'stay',
          type: 'object',
          fields: [
            defineField({ name: 'city', title: 'City', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'nights', title: 'Nights', type: 'number', validation: (rule) => rule.min(1).integer() }),
            defineField({ name: 'name', title: 'Hotel name (optional)', type: 'string' }),
            defineField({ name: 'category', title: 'Category', type: 'string', description: 'For example "4-star" or "Boutique".' }),
          ],
          preview: { select: { title: 'city', subtitle: 'name' } },
        }),
      ],
    }),
    { ...stringList('included', 'What is included'), group: 'details' },
    { ...stringList('excluded', 'What is not included'), group: 'details' },
    { ...stringList('importantNotes', 'Important notes'), group: 'details' },
    defineField({
      name: 'priceSections',
      title: 'Price tables and other price text',
      type: 'array',
      description: 'Text and tables for the Tour Price tab, such as the price tables of the Chinese and Japanese sites.',
      group: 'details',
      of: [{ type: 'section' }],
    }),
    { ...stringList('cancellationPolicy', 'Cancellation policy'), group: 'details' },
    { ...faqsField, group: 'details' },
    defineField({
      name: 'related',
      title: 'Related tours',
      type: 'array',
      group: 'details',
      of: [{ type: 'reference', to: [{ type: 'tour' }], weak: true }],
    }),
    defineField({
      name: 'heroImage',
      title: 'Main picture (optional)',
      type: 'picture',
      description:
        'The large picture at the top of the tour page and on its card. Leave empty to use the first gallery picture. Use a wide picture of at least 1800 pixels.',
      group: 'media',
    }),
    defineField({ name: 'gallery', title: 'Gallery', type: 'array', of: [{ type: 'picture' }], group: 'media' }),
    { ...metaTitleField, group: 'seo' },
    { ...metaDescriptionField, group: 'seo' },
    { ...noindexField, group: 'seo' },
    { ...canonicalUrlField, group: 'seo' },
  ],
  orderings: [{ title: 'Page address', name: 'path', by: [{ field: 'path', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'path', media: 'gallery.0' },
  },
});

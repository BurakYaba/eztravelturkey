import { defineField, defineType } from 'sanity';
import {
  faqsField,
  languageField,
  metaDescriptionField,
  metaTitleField,
  pathField,
  titleField,
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
      group: 'basics',
      fields: [
        defineField({
          name: 'amount',
          title: 'Price per person',
          type: 'number',
          validation: (rule) => rule.min(0),
        }),
        defineField({
          name: 'currency',
          title: 'Currency',
          type: 'string',
          options: { list: ['EUR', 'USD'], layout: 'radio' },
          initialValue: 'EUR',
        }),
        defineField({ name: 'unit', title: 'Price is', type: 'string', initialValue: 'Per person' }),
        defineField({ name: 'note', title: 'Note under the price', type: 'string' }),
      ],
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
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 6 }),
            defineField({ name: 'meals', title: 'Meals', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'dayLabel' } },
        }),
      ],
    }),
    { ...stringList('included', 'What is included'), group: 'details' },
    { ...stringList('excluded', 'What is not included'), group: 'details' },
    { ...stringList('importantNotes', 'Important notes'), group: 'details' },
    { ...stringList('cancellationPolicy', 'Cancellation policy'), group: 'details' },
    { ...faqsField, group: 'details' },
    defineField({
      name: 'related',
      title: 'Related tours',
      type: 'array',
      group: 'details',
      of: [{ type: 'reference', to: [{ type: 'tour' }], weak: true }],
    }),
    defineField({ name: 'gallery', title: 'Gallery', type: 'array', of: [{ type: 'picture' }], group: 'media' }),
    { ...metaTitleField, group: 'seo' },
    { ...metaDescriptionField, group: 'seo' },
  ],
  orderings: [{ title: 'Page address', name: 'path', by: [{ field: 'path', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'path', media: 'gallery.0' },
  },
});

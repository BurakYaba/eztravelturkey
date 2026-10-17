import { defineField, defineType } from 'sanity';
import { languageField } from './fields';

/** A person shown on the About and Contact pages. Each language has its own entries (docs/project-plan.md D9). */
export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  fields: [
    languageField,
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string', description: 'For example "Founder & Travel Consultant".' }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (rule) => rule.email() }),
    defineField({
      name: 'hours',
      title: 'Working hours',
      type: 'string',
      description: 'For example "9:00 AM - 7:00 PM".',
    }),
    defineField({
      name: 'timezone',
      title: 'Time zone',
      type: 'string',
      description: 'Shown next to the hours, for example "Istanbul time (GMT+3)".',
    }),
    defineField({ name: 'photo', title: 'Portrait', type: 'picture' }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'People are shown from the smallest number to the largest.',
      validation: (rule) => rule.integer().min(1),
    }),
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
});

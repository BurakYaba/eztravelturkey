import { defineField, defineType } from 'sanity';
import { languageField } from './fields';

/** A person shown on the About and Contact pages. Each language has its own entries (docs/project-plan.md D9). */
export const teamMember = defineType({
  name: 'teamMember',
  title: 'Ekip üyesi',
  type: 'document',
  fields: [
    languageField,
    defineField({ name: 'name', title: 'Ad soyad', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'role', title: 'Görev', type: 'string', description: 'Örneğin "Founder & Travel Consultant".' }),
    defineField({ name: 'email', title: 'E-posta', type: 'string', validation: (rule) => rule.email() }),
    defineField({
      name: 'hours',
      title: 'Çalışma saatleri',
      type: 'string',
      description: 'Örneğin "9:00 AM - 7:00 PM".',
    }),
    defineField({
      name: 'timezone',
      title: 'Saat dilimi',
      type: 'string',
      description: 'Saatlerin yanında gösterilir, örneğin "Istanbul time (GMT+3)".',
    }),
    defineField({ name: 'photo', title: 'Fotoğraf', type: 'picture' }),
    defineField({
      name: 'order',
      title: 'Sıra',
      type: 'number',
      description: 'Kişiler en küçük numaradan en büyüğüne doğru gösterilir.',
      validation: (rule) => rule.integer().min(1),
    }),
  ],
  orderings: [{ title: 'Sıra', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
});

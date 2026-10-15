/** Fills `{name}` placeholders: `format('Since {year}', { year: 1997 })`. Kept apart from the dictionaries so client components can use it without carrying them. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

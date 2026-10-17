/**
 * Length groups of the countries whose tours sit directly under the country on the old site (Egypt, Jordan, Morocco):
 * a category page there is not a folder its tours live in, it is a length filter. The slug names the length; the tours
 * keep their own addresses. Turkey and Greece have real folders and do not use this.
 */
const groups: Record<string, { min: number; max: number }> = {
  '03-to-05-days-tours': { min: 3, max: 5 },
  '06-to-09-days-tours': { min: 6, max: 9 },
  '10-days-and-longer': { min: 10, max: Infinity },
  '06-days-and-longer': { min: 6, max: Infinity },
};

export const durationGroupOf = (slug: string) => groups[slug];

/** The tours a category page shows: the ones in its folder, or, for a length group, the country's tours of that length. */
export function toursOfCategory<T extends { href: string; days: number | null }>(tours: T[], categoryHref: string): T[] {
  const inFolder = tours.filter((tour) => tour.href.startsWith(categoryHref));
  if (inFolder.length > 0) {
    return inFolder;
  }
  const slug = categoryHref.replace(/^\/|\/$/g, '').split('/').pop() ?? '';
  const group = durationGroupOf(slug);
  return group ? tours.filter((tour) => tour.days !== null && tour.days >= group.min && tour.days <= group.max) : [];
}

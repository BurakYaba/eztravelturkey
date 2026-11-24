// The countries a tour visits, worked out from its folder and, when the folder names none, from its title and route.
// The same rule as `countriesOfTour` in src/lib/data/index.ts (the site's fallback); the back-fill uses it to fill the "Ülkeler" field of a
// tour. Once a tour has the field, the field wins and this rule is only a safety net.

export const countryIds = ['turkey', 'greece', 'egypt', 'jordan', 'morocco'];

// Traditional Chinese, as the routes and titles of this site are typed (keep in step with `namesInTitle` in src/lib/data/index.ts).
const namesInTitle = {
  turkey: ['turkey', '土耳其', '伊斯坦堡', '卡帕多奇亞', '艾菲索斯', '以弗所', '棉花堡', '庫薩達斯', '庫夏達斯', '伊茲密爾'],
  greece: ['greece', '希臘', '雅典', '米克諾斯', '米科諾斯', '聖托里尼', '克里特', '梅特歐拉', '德爾菲', '岱爾菲'],
  egypt: ['egypt', '埃及', '開羅', '尼羅河', '孟菲斯', '薩卡拉', '吉薩', '亞斯文', '盧克索', '盧索克', '艾德夫'],
  jordan: ['jordan', '約旦', '安曼', '佩特拉', '瓦迪拉姆', '瓦地倫', '傑拉什', '阿傑隆'],
  morocco: ['morocco', '摩洛哥', '馬拉喀什', '卡薩布蘭卡'],
};

/** Countries named in a folder: `turkey-and-greece-tours` gives turkey and greece, `egypt-tours` gives egypt. */
export function countriesOfFolder(folder) {
  return countryIds.filter((id) => folder.includes(id));
}

/** `{ ids, source }`: source is 'folder', 'title' or 'none' (nothing found: a person has to choose). */
export function countriesOfTour({ parent, category, title, route }) {
  const fromFolder = countriesOfFolder(`${parent ?? ''} ${category ?? ''}`);
  if (fromFolder.length > 0) {
    return { ids: fromFolder, source: 'folder' };
  }
  const text = `${title ?? ''} ${(route ?? []).join(' ')}`.toLowerCase();
  const fromTitle = countryIds.filter((id) => namesInTitle[id].some((word) => text.includes(word)));
  return fromTitle.length > 0 ? { ids: fromTitle, source: 'title' } : { ids: [], source: 'none' };
}

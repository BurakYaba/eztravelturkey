// Writes the Depositphotos hero pictures into docs/image-licenses.md (docs/project-plan.md P3.14).
//
//   node scripts/depositphotos/write-license-record.mjs
//
// One row per picture: its Depositphotos number, size and title, the tours that show it, and the address of the license
// page in the client's account. Replaces the block between the two marker comments, so it can be run again.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const file = path.join(root, 'docs/image-licenses.md');
const catalog = new Map(JSON.parse(readFileSync(path.join(root, 'data/depositphotos/catalog.json'), 'utf8')).map((r) => [r.id, r]));
const read = (f) => JSON.parse(readFileSync(path.join(root, 'data/depositphotos', f), 'utf8'));
const proposal = read('proposal.json');
const destinations = read('destination-proposal.json');

const byPicture = new Map();
for (const p of proposal) if (p.pick) byPicture.set(p.pick.id, [...(byPicture.get(p.pick.id) ?? []), p.title]);
for (const p of destinations) if (p.pick) byPicture.set(p.pick.id, [...(byPicture.get(p.pick.id) ?? []), `${p.title} (destination page)`]);
// the Chinese and Japanese tours that have a hero of their own (the others copy the English tour's)
const cjk = { zh: 'Chinese', jp: 'Japanese' };
let cjkTours = 0;
for (const lang of Object.keys(cjk)) {
  const file = path.join(root, 'data/depositphotos', `proposal-${lang}.json`);
  if (!existsSync(file)) continue;
  for (const p of JSON.parse(readFileSync(file, 'utf8'))) {
    if (!p.pick) continue;
    cjkTours++;
    byPicture.set(p.pick.id, [...(byPicture.get(p.pick.id) ?? []), `${p.title} (${cjk[lang]} site)`]);
  }
}

const rows = [...byPicture.entries()]
  .map(([id, titles]) => {
    const c = catalog.get(id);
    const license = c.license ? `https://depositphotos.com${c.license}` : '';
    return `| ${id} | ${c.kind.replace('icon-size-', '').toUpperCase()} | ${c.title.replace(/\|/g, '/')} | ${c.artist} | ${titles.join('; ').replace(/\|/g, '/')} | ${license} |`;
  })
  .join('\n');

const block = `<!-- depositphotos-heroes:start -->
## Hero pictures from Depositphotos (${byPicture.size}): tours (three languages) and destination pages

Bought by Magnificent Travel (team account, standard license) and shown as the main picture of ${proposal.filter((p) => p.pick).length} English tours, ${cjkTours} Chinese and Japanese tours (the others there copy the English tour's picture) and ${destinations.filter((p) => p.pick).length} destination pages (2026-10-17). Each picture is used once. The license page of every picture is in the client's account at the address in the last column.

| Depositphotos no. | Size | Title | Artist | Used on | License page |
|---|---|---|---|---|---|
${rows}
<!-- depositphotos-heroes:end -->`;

const text = readFileSync(file, 'utf8');
const pattern = /<!-- depositphotos-heroes:start -->[\s\S]*<!-- depositphotos-heroes:end -->/;
writeFileSync(file, pattern.test(text) ? text.replace(pattern, block) : `${text.trimEnd()}\n\n${block}\n`);
console.log(`${byPicture.size} pictures written to docs/image-licenses.md`);

// Draws contact sheets of the proposed heroes so each choice can be checked by eye.
//
//   node scripts/depositphotos/contact-sheets.mjs [first] [count]
//
// Reads data/depositphotos/proposal.json and catalog.json; writes data/depositphotos/sheets/sheet-N.png. Each cell shows
// the tour title, the chosen picture's thumbnail and its title, and the next candidates' titles.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '../..');
const proposal = JSON.parse(readFileSync(path.join(root, 'data/depositphotos/proposal.json'), 'utf8'));
const catalog = new Map(JSON.parse(readFileSync(path.join(root, 'data/depositphotos/catalog.json'), 'utf8')).map((r) => [r.id, r]));
const out = path.join(root, 'data/depositphotos/sheets');
mkdirSync(out, { recursive: true });

const per = 12;
const cols = 3;
const cellW = 470;
const cellH = 210;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wrap = (text, n) => {
  const lines = [];
  let line = '';
  for (const w of text.split(' ')) {
    if ((line + ' ' + w).trim().length > n) {
      lines.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
};

const thumbs = new Map();
async function thumb(id) {
  if (!thumbs.has(id)) {
    const res = await fetch(catalog.get(id).thumb.replace('/v/150/', '/v/450/').replace('-thumb', '-stock-photo').replace('/v/450/', '/v/450/'));
    const fallback = !res.ok ? await fetch(catalog.get(id).thumb) : res;
    thumbs.set(id, Buffer.from(await fallback.arrayBuffer()));
  }
  return thumbs.get(id);
}

const first = Number(process.argv[2] ?? 0);
const count = Number(process.argv[3] ?? proposal.length);
const slice = proposal.slice(first, first + count);
for (let s = 0; s * per < slice.length; s++) {
  const group = slice.slice(s * per, s * per + per);
  const rows = Math.ceil(group.length / cols);
  const layers = [];
  const labels = [];
  for (const [i, p] of group.entries()) {
    const x = (i % cols) * cellW;
    const y = Math.floor(i / cols) * cellH;
    if (p.pick) {
      try {
        const img = await sharp(await thumb(p.pick.id)).resize(190, 142, { fit: 'cover' }).toBuffer();
        layers.push({ input: img, left: x + 6, top: y + 62 });
      } catch {
        /* a missing thumbnail leaves the box empty */
      }
    }
    const lines = [
      `<text x="${x + 6}" y="${y + 18}" font-size="14" font-weight="bold" fill="#0f2d4a">${first + s * per + i}. ${esc(p.title.slice(0, 62))}</text>`,
      `<text x="${x + 6}" y="${y + 36}" font-size="11" fill="#555">${esc(p.route.slice(0, 80))}</text>`,
      `<text x="${x + 6}" y="${y + 54}" font-size="11" fill="#9a6a22">${p.pick ? `${p.pick.id} ${p.pick.size} score ${p.pick.score}` : 'NO PICTURE'}</text>`,
      ...wrap(p.pick?.title ?? '', 34).map((l, k) => `<text x="${x + 204}" y="${y + 78 + k * 16}" font-size="12" fill="#111">${esc(l)}</text>`),
      ...p.others.slice(0, 2).flatMap((o, k) => wrap(`also: ${o.title}`, 38).slice(0, 2).map((l, m) => `<text x="${x + 204}" y="${y + 138 + k * 30 + m * 13}" font-size="10" fill="#777">${esc(l)}</text>`)),
      `<rect x="${x + 2}" y="${y + 2}" width="${cellW - 4}" height="${cellH - 4}" fill="none" stroke="#ddd"/>`,
    ];
    labels.push(...lines);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cellW}" height="${rows * cellH}" font-family="Arial, sans-serif"><rect width="100%" height="100%" fill="#fff"/>${labels.join('')}</svg>`;
  const file = path.join(out, `sheet-${String(s).padStart(2, '0')}.png`);
  writeFileSync(file, await sharp(Buffer.from(svg)).composite(layers).png().toBuffer());
  console.log(file);
}

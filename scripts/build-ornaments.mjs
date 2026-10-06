// Generates the cultural ornaments used on the destination pages into public/ornaments:
//   *-tile.svg      seamless background patterns (Turkey, Greece, Egypt, Jordan; Morocco uses purchased artwork)
//   *-band.svg      repeat-x border friezes (Turkey, Jordan, Morocco; Greece and Egypt use purchased artwork)
//   (the *-skyline.svg compositions are built separately from purchased artwork, see README)
//   shape-*.svg     tile outlines used as CSS masks (greece, egypt and morocco; turkey and jordan come from purchased arch silhouettes)
// Everything is drawn from geometry here, so it is original work with no third-party license.
// All shapes are black; the site recolors them with CSS mask-image. Run: npm run ornaments
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'ornaments');
mkdirSync(out, { recursive: true });

const f = (n) => Math.round(n * 100) / 100;
const svg = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ${extra}>${body}</svg>\n`;
const save = (name, content) => writeFileSync(join(out, name), content);

// Small seeded generator so rebuilding gives identical files.
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rect = (x, y, w, h) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
const poly = (pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
/** Dome on a base line: elliptical arc from left to right over the top. */
const dome = (cx, base, r, rise = r) => `M${f(cx - r)} ${f(base)}A${f(r)} ${f(rise)} 0 0 1 ${f(cx + r)} ${f(base)}Z`;
const circle = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;

// ---------------------------------------------------------------- tile patterns (stroke based)
const stroke = (w = 2.4, cap = 'round', join = 'round') =>
  `fill="none" stroke="#000" stroke-width="${w}" stroke-linejoin="${join}" stroke-linecap="${cap}"`;

function petal(cx, cy, len, wid, angle) {
  return `<path transform="rotate(${angle} ${cx} ${cy})" d="M${cx} ${cy}C${cx - wid} ${cy - len * 0.35} ${cx - wid * 0.7} ${cy - len * 0.8} ${cx} ${cy - len}C${cx + wid * 0.7} ${cy - len * 0.8} ${cx + wid} ${cy - len * 0.35} ${cx} ${cy}Z"/>`;
}

// Turkey: Iznik style rosette with tulip-like petals, ogee links and corner leaves.
function iznikTile() {
  const c = 48;
  let body = '<g fill="#000">';
  for (let k = 0; k < 4; k++) {
    body += petal(c, c, 34, 11, k * 90);
    body += petal(c, c, 22, 8, k * 90 + 45);
  }
  for (const [x, y] of [
    [0, 0],
    [96, 0],
    [0, 96],
    [96, 96],
  ]) {
    for (let k = 0; k < 4; k++) body += petal(x, y, 24, 7, k * 90 + 45);
  }
  body += '</g>';
  const links = `<g ${stroke(1.8)}><circle cx="${c}" cy="${c}" r="40"/><path d="M${c} 8C${c + 14} 20 ${c + 14} 30 ${c} 38"/><path d="M${c} 88C${c - 14} 76 ${c - 14} 66 ${c} 58"/><path d="M8 ${c}C20 ${c - 14} 30 ${c - 14} 38 ${c}"/><path d="M88 ${c}C76 ${c + 14} 66 ${c + 14} 58 ${c}"/></g>`;
  return svg(96, 96, body + links);
}

// Turkey: row of tulip rosettes joined by a line (Ottoman tile border).
function ottomanBand() {
  let body = '<g fill="#000">';
  for (let k = 0; k < 4; k++) body += petal(32, 28, 22, 7, k * 90) + petal(32, 28, 14, 5, k * 90 + 45);
  body += '</g>';
  return svg(64, 56, `${body}<path d="M0 28H8M56 28H64M0 52H64" ${stroke(2.2, 'butt')}/>`);
}

// Morocco: one row of eight-pointed stars between two rules.
function zelligeBand() {
  const R = 22;
  const sq = (rot) =>
    poly(
      [0, 1, 2, 3].map((i) => [
        40 + R * Math.cos((rot + i * 90) * (Math.PI / 180)),
        28 + R * Math.sin((rot + i * 90) * (Math.PI / 180)),
      ]),
    );
  return svg(
    80,
    56,
    `<g ${stroke(2.2)}><path d="${sq(0)}"/><path d="${sq(45)}"/><circle cx="40" cy="28" r="6"/><path d="${poly([
      [0, 20],
      [8, 28],
      [0, 36],
      [-8, 28],
    ])}"/><path d="${poly([
      [80, 20],
      [88, 28],
      [80, 36],
      [72, 28],
    ])}"/><path d="M0 4H80M0 52H80"/></g>`,
  );
}

// Jordan: stepped crenellation frieze (Nabataean crow-step) on a base rule.
function nabataeanBand() {
  const step = (x, base, n, s) => {
    const pts = [[x, base]];
    for (let i = 0; i < n; i++) {
      pts.push([x + i * s, base - (i + 1) * s], [x + (i + 1) * s, base - (i + 1) * s]);
    }
    for (let i = n - 1; i >= 0; i--) {
      pts.push([x + (2 * n - i) * s, base - (i + 1) * s], [x + (2 * n - i) * s, base - i * s]);
    }
    return poly(pts);
  };
  let d = '';
  const n = 3;
  const s = 7;
  d += step(4, 44, n, s);
  return svg(4 + 2 * n * s + 14, 52, `<path d="${d}M0 46h${4 + 2 * n * s + 14}v6h-${4 + 2 * n * s + 14}Z"/>`);
}

// Egypt: field of small pyramids.
function pyramidTile() {
  const tri = (x, y, s) =>
    `<path d="${poly([
      [x, y + s],
      [x + s / 2, y],
      [x + s, y + s],
    ])}"/>`;
  return svg(48, 48, `<g ${stroke(1.8)}>${tri(4, 4, 20)}${tri(28, 28, 20)}</g>`);
}

// Jordan: banded sandstone strata.
function strataTile() {
  const wave = (y, amp, ph) => `<path d="M0 ${y}C20 ${y - amp} 40 ${y + amp} 60 ${y}S100 ${y - amp + ph} 120 ${y}"/>`;
  return svg(120, 60, `<g ${stroke(1.6)}>${wave(10, 4, 0)}${wave(24, 3, 2)}${wave(38, 5, -2)}${wave(52, 3, 1)}</g>`);
}

// Greece: laurel-like wave scroll used as quiet background.
function waveTile() {
  return svg(
    64,
    32,
    `<g ${stroke(2)}><path d="M0 22C8 22 12 8 22 8S32 20 32 22C40 22 44 8 54 8S64 20 64 22"/><circle cx="22" cy="14" r="3"/><circle cx="54" cy="14" r="3"/></g>`,
  );
}

// ---------------------------------------------------------------- tile shapes (viewBox 100 x 125, stretched)
const shape = (d) => svg(100, 125, `<path d="${d}"/>`, 'preserveAspectRatio="none"');

save('turkey-tile.svg', iznikTile());
save('greece-tile.svg', waveTile());
save('egypt-tile.svg', pyramidTile());
save('jordan-tile.svg', strataTile());

save('turkey-band.svg', ottomanBand());
save('jordan-band.svg', nabataeanBand());
save('morocco-band.svg', zelligeBand());

save('shape-morocco.svg', shape('M50 0C80 0 100 16 100 36C100 46 97 53 94 57Q91 60 96 62L99 63V125H1V63L4 62Q9 60 6 57C3 53 0 46 0 36C0 16 20 0 50 0Z'));
save('shape-greece.svg', shape('M0 125V30L50 0L100 30V125Z'));
save('shape-egypt.svg', shape('M0 125V76L48 0H52L100 76V125Z'));

console.log('ornaments written to', out);

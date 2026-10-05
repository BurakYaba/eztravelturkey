// Generates the cultural ornaments used on the destination pages into public/ornaments:
//   *-tile.svg      seamless background patterns
//   *-band.svg      repeat-x border friezes
//   *-skyline.svg   wide silhouettes (2400 x 260)
//   shape-*.svg     tile outlines used as CSS masks
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

// Morocco: eight-pointed star and cross lattice (zellige).
function zelligeTile() {
  const star = (cx, cy, R) => {
    const sq = (rot) =>
      poly(
        [0, 1, 2, 3].map((i) => [
          cx + R * Math.cos((rot + i * 90) * (Math.PI / 180)),
          cy + R * Math.sin((rot + i * 90) * (Math.PI / 180)),
        ]),
      );
    return `<path d="${sq(0)}"/><path d="${sq(45)}"/><circle cx="${cx}" cy="${cy}" r="${f(R * 0.32)}"/>`;
  };
  const R = 28.28;
  let body = `<g ${stroke(2.2)}>`;
  for (const [x, y] of [
    [40, 40],
    [0, 0],
    [80, 0],
    [0, 80],
    [80, 80],
  ])
    body += star(x, y, R);
  for (const [x, y] of [
    [40, 0],
    [0, 40],
    [80, 40],
    [40, 80],
  ]) {
    body += `<path d="${poly([
      [x - 8, y],
      [x, y - 8],
      [x + 8, y],
      [x, y + 8],
    ])}"/>`;
  }
  body += '</g>';
  return svg(80, 80, body);
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

// Greece: Greek key (meander) frieze with a base line.
function meanderBand() {
  const w = 56;
  let d = '';
  for (let x = 0; x < 56 * 1; x += w) {
    d += `M${x} 44H${x + w}`;
    d += `M${x + 6} 44V6H${x + 50}V36H${x + 18}V18H${x + 38}V27`;
  }
  return svg(w, 52, `<path d="${d}" ${stroke(5, 'square', 'miter')}/>`);
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

// Egypt: alternating lotus flower and bud frieze.
function lotusBand() {
  const flower = (cx) =>
    `<path d="M${cx} 8C${cx - 7} 18 ${cx - 7} 30 ${cx} 40C${cx + 7} 30 ${cx + 7} 18 ${cx} 8Z"/>` +
    `<path d="M${cx} 40C${cx - 14} 38 ${cx - 24} 28 ${cx - 26} 14C${cx - 14} 16 ${cx - 6} 26 ${cx} 40Z"/>` +
    `<path d="M${cx} 40C${cx + 14} 38 ${cx + 24} 28 ${cx + 26} 14C${cx + 14} 16 ${cx + 6} 26 ${cx} 40Z"/>`;
  const bud = (cx) => `<path d="M${cx} 22C${cx - 6} 30 ${cx - 6} 38 ${cx} 44C${cx + 6} 38 ${cx + 6} 30 ${cx} 22Z"/>`;
  return svg(
    120,
    56,
    `<g fill="#000">${flower(30)}${bud(90)}</g><path d="M0 46H120M30 40V46M90 44V46" ${stroke(3, 'butt')}/>`,
  );
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

// ---------------------------------------------------------------- skylines (2400 x 260, ground at y = 260)
const W = 2400;
const H = 260;
const GROUND = H;

function houses(r, x0, x1, hMin, hMax, wMin = 36, wMax = 70) {
  let d = '';
  let x = x0;
  while (x < x1) {
    const w = wMin + r() * (wMax - wMin);
    const h = hMin + r() * (hMax - hMin);
    d += rect(x, GROUND - h, w + 1, h);
    if (r() > 0.6)
      d += poly([
        [x + 2, GROUND - h],
        [x + w / 2, GROUND - h - 10 - r() * 8],
        [x + w - 2, GROUND - h],
      ]);
    x += w;
  }
  return d;
}

function minaret(x, h, w = 9) {
  const top = GROUND - h;
  return (
    rect(x - w / 2, top, w, h) +
    rect(x - w * 0.95, top + h * 0.22, w * 1.9, 5) +
    poly([
      [x - w * 0.8, top],
      [x, top - w * 3.6],
      [x + w * 0.8, top],
    ]) +
    rect(x - 1, top - w * 3.6 - 10, 2, 10)
  );
}

function mosque(cx, scale = 1, minarets = 4) {
  const s = scale;
  let d = '';
  const baseY = GROUND;
  d += rect(cx - 150 * s, baseY - 70 * s, 300 * s, 70 * s); // main block
  d += dome(cx, baseY - 70 * s, 78 * s, 82 * s); // central dome
  d += rect(cx - 2 * s, baseY - 70 * s - 82 * s - 16 * s, 4 * s, 16 * s);
  d += circle(cx, baseY - 70 * s - 82 * s - 20 * s, 4 * s);
  for (const dx of [-98, 98]) d += dome(cx + dx * s, baseY - 70 * s, 48 * s, 46 * s); // half domes
  for (const dx of [-140, 140]) d += dome(cx + dx * s, baseY - 70 * s, 26 * s, 30 * s);
  // arcade of small domes along the front
  for (let i = -3; i <= 3; i++) if (i !== 0) d += dome(cx + i * 36 * s, baseY - 34 * s, 14 * s, 14 * s);
  const hs = [190, 160, 190, 160];
  const xs = [-176, 176, -202, 202];
  for (let i = 0; i < minarets; i++) d += minaret(cx + xs[i] * s, hs[i] * s, 9 * s);
  return d;
}

function galata(x) {
  return (
    rect(x - 22, GROUND - 190, 44, 190) +
    rect(x - 29, GROUND - 190, 58, 14) +
    poly([
      [x - 29, GROUND - 190],
      [x, GROUND - 252],
      [x + 29, GROUND - 190],
    ]) +
    rect(x - 1.5, GROUND - 262, 3, 12)
  );
}

function istanbulSkyline() {
  const r = rng(11);
  let d = houses(r, 0, 2400, 18, 56);
  d += mosque(470, 1.0, 4);
  d += galata(1180);
  d += rect(1100, GROUND - 90, 70, 90) + dome(1135, GROUND - 90, 30, 34);
  d += mosque(1780, 1.25, 4);
  d += minaret(2180, 150) + dome(2230, GROUND - 60, 36, 40) + rect(2194, GROUND - 60, 72, 60);
  return svg(W, H, `<path d="${d}"/>`);
}

function column(cx, top, h, w) {
  return poly([
    [cx - w / 2, top],
    [cx + w / 2, top],
    [cx + w / 2 - 1.6, top + h],
    [cx - w / 2 + 1.6, top + h],
  ]);
}

function temple(x0, width, colCount, baseY, h) {
  let d = '';
  const step = 9;
  d +=
    rect(x0, baseY - step, width, step) +
    rect(x0 + 10, baseY - 2 * step, width - 20, step) +
    rect(x0 + 20, baseY - 3 * step, width - 40, step);
  const inner = x0 + 24;
  const innerW = width - 48;
  const colTop = baseY - 3 * step - h;
  for (let i = 0; i < colCount; i++) {
    const cx = inner + (innerW * i) / (colCount - 1);
    d += column(cx, colTop, h, 15);
    d += rect(cx - 10, colTop - 4, 20, 4);
  }
  d += rect(x0 + 12, colTop - 20, width - 24, 16); // entablature
  d += poly([
    [x0 + 4, colTop - 20],
    [x0 + width / 2, colTop - 20 - width * 0.12],
    [x0 + width - 4, colTop - 20],
  ]);
  return d;
}

function cypress(x, h) {
  return `M${f(x)} ${GROUND}C${f(x - 14)} ${GROUND - h * 0.5} ${f(x - 10)} ${GROUND - h * 0.85} ${f(x)} ${GROUND - h}C${f(x + 10)} ${GROUND - h * 0.85} ${f(x + 14)} ${GROUND - h * 0.5} ${f(x)} ${GROUND}Z`;
}

function greeceSkyline() {
  const r = rng(7);
  let d = '';
  // Rolling hill under everything
  d += `M0 ${GROUND}V${GROUND - 26}C300 ${GROUND - 44} 520 ${GROUND - 30} 800 ${GROUND - 40}S1400 ${GROUND - 24} 1700 ${GROUND - 38}S2200 ${GROUND - 28} 2400 ${GROUND - 34}V${GROUND}Z`;
  d += temple(650, 560, 8, GROUND - 26, 110);
  // ruined colonnade left
  for (let i = 0; i < 5; i++) d += column(250 + i * 46, GROUND - 26 - (60 + r() * 50), 60 + r() * 50, 14);
  d += rect(238, GROUND - 26 - 118, 5 * 46 + 6, 0.01);
  // small temple right
  d += temple(1500, 360, 6, GROUND - 26, 84);
  // whitewashed chapel with dome
  d +=
    rect(2000, GROUND - 26 - 62, 80, 62) +
    dome(2040, GROUND - 26 - 62, 34, 36) +
    rect(2038, GROUND - 26 - 62 - 56, 4, 14);
  d += rect(2090, GROUND - 26 - 44, 56, 44) + dome(2118, GROUND - 26 - 44, 22, 22);
  for (const [x, h] of [
    [1380, 150],
    [1420, 190],
    [1460, 140],
    [2260, 170],
    [2300, 130],
    [150, 140],
    [100, 170],
  ])
    d += cypress(x, h);
  return svg(W, H, `<path d="${d}"/>`);
}

function palm(x, h, lean = 0) {
  const topX = x + lean;
  const topY = GROUND - h;
  let d = `M${f(x - 5)} ${GROUND}C${f(x - 3 + lean * 0.3)} ${GROUND - h * 0.5} ${f(topX - 3)} ${f(topY + 30)} ${f(topX - 3)} ${f(topY)}L${f(topX + 3)} ${f(topY)}C${f(topX + 4)} ${f(topY + 30)} ${f(x + 5 + lean * 0.3)} ${GROUND - h * 0.5} ${f(x + 5)} ${GROUND}Z`;
  for (const a of [-170, -140, -110, -70, -40, -10]) {
    const rad = (a * Math.PI) / 180;
    const len = 62;
    const ex = topX + Math.cos(rad) * len;
    const ey = topY + Math.sin(rad) * len + 18;
    const mx = topX + Math.cos(rad) * len * 0.55;
    const my = topY + Math.sin(rad) * len * 0.55 - 14;
    d += `M${f(topX)} ${f(topY)}Q${f(mx)} ${f(my - 6)} ${f(ex)} ${f(ey)}Q${f(mx)} ${f(my + 4)} ${f(topX)} ${f(topY + 4)}Z`;
  }
  return d;
}

function pyramid(cx, w, h, base = GROUND) {
  return poly([
    [cx - w / 2, base],
    [cx, base - h],
    [cx + w / 2, base],
  ]);
}

function obelisk(x, h) {
  return poly([
    [x - 11, GROUND],
    [x - 7, GROUND - h + 22],
    [x, GROUND - h],
    [x + 7, GROUND - h + 22],
    [x + 11, GROUND],
  ]);
}

function pylon(x, w, h) {
  return poly([
    [x, GROUND],
    [x + 10, GROUND - h],
    [x + w - 10, GROUND - h],
    [x + w, GROUND],
  ]);
}

function sphinx(x) {
  // Side view facing right: haunch, long back, raised head with nemes headdress, forepaws stretched out.
  const g = GROUND;
  const d =
    `M${x} ${g}V${g - 30}Q${x + 6} ${g - 52} ${x + 40} ${g - 54}L${x + 112} ${g - 50}` +
    `L${x + 118} ${g - 66}L${x + 112} ${g - 98}L${x + 126} ${g - 116}L${x + 150} ${g - 118}L${x + 166} ${g - 100}` +
    `L${x + 168} ${g - 84}L${x + 160} ${g - 70}L${x + 160} ${g - 52}L${x + 168} ${g - 26}L${x + 262} ${g - 26}V${g}Z`;
  return d;
}

function egyptSkyline() {
  let d = `M0 ${GROUND}V${GROUND - 12}H${W}V${GROUND}Z`;
  d += palm(120, 150, 14) + palm(190, 118, -10);
  d += pylon(300, 130, 150) + pylon(470, 130, 150) + obelisk(452, 200);
  for (let i = 0; i < 5; i++)
    d += column(640 + i * 40, GROUND - 120, 120, 16) + rect(630 + i * 40, GROUND - 126, 20, 6);
  d += rect(630, GROUND - 140, 190, 14);
  d += pyramid(1230, 560, 200) + pyramid(1620, 400, 142) + pyramid(1890, 230, 82);
  d += sphinx(940);
  d += palm(2130, 168, 12) + palm(2210, 126, -6) + palm(2290, 150, 10);
  return svg(W, H, `<path d="${d}"/>`);
}

function jordanSkyline() {
  const r = rng(23);
  const fx = 1180;
  const g = GROUND;
  // One outline: undulating sandstone ridge, a tall cliff face in the middle.
  let d = `M0 ${g}V160`;
  let x = 0;
  while (x < fx - 330) {
    const nx = Math.min(fx - 330, x + 80 + r() * 90);
    const y = 110 + r() * 70;
    d += `C${f(x + 24)} ${f(y - 16)} ${f(nx - 24)} ${f(y + 10)} ${f(nx)} ${f(y)}`;
    x = nx;
  }
  d += `L${fx - 260} 118L${fx - 232} 54L${fx - 150} 40L${fx - 120} 18L${fx + 120} 18L${fx + 150} 38L${fx + 236} 50L${fx + 262} 112`;
  x = fx + 262;
  while (x < W) {
    const nx = x + 80 + r() * 90;
    const y = 100 + r() * 80;
    d += `C${f(x + 24)} ${f(y - 16)} ${f(nx - 24)} ${f(y + 10)} ${f(Math.min(nx, W))} ${f(y)}`;
    x = nx;
  }
  d += `L${W} ${g}Z`;
  // Carved Treasury facade, cut out of the cliff (even-odd holes).
  let cut = '';
  const colTop = 128;
  const colH = g - colTop - 6;
  for (let i = 0; i < 5; i++) cut += rect(fx - 80 + i * 32 + 22, colTop + 8, 20, colH - 8); // gaps between six columns
  cut += rect(fx - 104, colTop - 6, 208, 4); // lower entablature groove
  for (let i = 0; i < 3; i++) cut += rect(fx - 48 + i * 32 + 22 - 11, 74, 14, 40); // upper tier gaps
  cut += rect(fx - 70, 66, 140, 4); // upper entablature groove
  // pediment ring on the lower tier
  cut += poly([
    [fx - 108, colTop - 12],
    [fx, colTop - 52],
    [fx + 108, colTop - 12],
  ]);
  // tholos ring
  cut += circle(fx, 92, 34);
  return svg(
    W,
    H,
    `<path fill-rule="evenodd" d="${d}${cut}"/><path d="${circle(fx, 92, 26)}${rect(fx - 12, colTop + 56, 24, g - colTop - 56)}"/>`,
  );
}

function koutoubia(x) {
  const s = 1;
  return (
    rect(x - 34 * s, GROUND - 210, 68 * s, 210) +
    rect(x - 22, GROUND - 258, 44, 48) +
    rect(x - 9, GROUND - 282, 18, 24) +
    circle(x, GROUND - 292, 7) +
    circle(x, GROUND - 306, 5) +
    rect(x - 1.2, GROUND - 330, 2.4, 20)
  );
}

function crenellated(x0, w, h, towers = true) {
  let d = rect(x0, GROUND - h, w, h);
  for (let x = x0; x < x0 + w - 12; x += 22) d += rect(x, GROUND - h - 12, 12, 12);
  if (towers) {
    for (const tx of [x0 - 14, x0 + w - 18]) {
      d += rect(tx, GROUND - h - 36, 32, h + 36);
      d += poly([
        [tx - 2, GROUND - h - 36],
        [tx + 16, GROUND - h - 64],
        [tx + 34, GROUND - h - 36],
      ]);
    }
  }
  return d;
}

function moroccoSkyline() {
  const r = rng(5);
  let wall = houses(r, 0, W, 14, 46, 40, 80);
  let d = '';
  d += koutoubia(560);
  d += rect(430, GROUND - 78, 260, 78) + dome(560, GROUND - 78, 0.01, 0.01);
  d += crenellated(800, 420, 88);
  d += palm(1290, 176, 10) + palm(1360, 132, -8);
  d += crenellated(1500, 300, 118);
  d += palm(1900, 168, 8) + palm(1980, 138, -10);
  // arcade wall with horseshoe arches cut out
  const arcadeX = 2030;
  const arcadeW = 330;
  const wallBlock = rect(arcadeX, GROUND - 120, arcadeW, 120);
  let cut = '';
  for (let i = 0; i < 4; i++) {
    const cx = arcadeX + 44 + i * 80;
    cut += `M${f(cx - 22)} ${GROUND}V${GROUND - 62}A28 28 0 1 1 ${f(cx + 22)} ${GROUND - 62}V${GROUND}Z`;
  }
  return svg(W, H, `<path d="${wall}${d}"/><path fill-rule="evenodd" d="${wallBlock}${cut}"/>`);
}

// ---------------------------------------------------------------- tile shapes (viewBox 100 x 125, stretched)
const shape = (d) => svg(100, 125, `<path d="${d}"/>`, 'preserveAspectRatio="none"');

save('turkey-tile.svg', iznikTile());
save('greece-tile.svg', waveTile());
save('egypt-tile.svg', pyramidTile());
save('jordan-tile.svg', strataTile());
save('morocco-tile.svg', zelligeTile());

save('turkey-band.svg', ottomanBand());
save('greece-band.svg', meanderBand());
save('egypt-band.svg', lotusBand());
save('jordan-band.svg', nabataeanBand());
save('morocco-band.svg', zelligeBand());

save('turkey-skyline.svg', istanbulSkyline());
save('greece-skyline.svg', greeceSkyline());
save('egypt-skyline.svg', egyptSkyline());
save('jordan-skyline.svg', jordanSkyline());
save('morocco-skyline.svg', moroccoSkyline());

save('shape-turkey.svg', shape('M0 125V40Q0 14 50 0Q100 14 100 40V125Z'));
save('shape-morocco.svg', shape('M8 125V80C-2 62 4 30 28 14C36 8 44 6 50 6C56 6 64 8 72 14C96 30 102 62 92 80V125Z'));
save('shape-greece.svg', shape('M0 125V30L50 0L100 30V125Z'));
save('shape-egypt.svg', shape('M0 125V58H16V44H30V30H42V14H58V30H70V44H84V58H100V125Z'));
save('shape-jordan.svg', shape('M0 125V38H18V14H34V38H66V14H82V38H100V125Z'));

console.log('ornaments written to', out);

// Converts every .eps under design-assets/ to an SVG in design-assets/_svg/<folder>.svg.
// Needs Ghostscript and Inkscape installed locally (see README, "Design assets"). Not part of the site build.
// Usage: node scripts/eps-to-svg.mjs [folder-name ...]   (no arguments converts every folder)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';

const root = join(import.meta.dirname, '..', 'design-assets');
const out = join(root, '_svg');
const GS = process.env.GS_PATH ?? 'C:/Users/Burak/gs/bin/gswin64c.exe';
const INKSCAPE = process.env.INKSCAPE_PATH ?? 'C:/Program Files/Inkscape/bin/inkscape.exe';

for (const tool of [GS, INKSCAPE]) {
  if (!existsSync(tool)) {
    console.error(`Missing tool: ${tool}. Set GS_PATH / INKSCAPE_PATH.`);
    process.exit(1);
  }
}
mkdirSync(out, { recursive: true });

const only = process.argv.slice(2);
for (const folder of readdirSync(root)) {
  if (only.length && !only.includes(folder)) {
    continue;
  }
  const dir = join(root, folder);
  if (folder.startsWith('_') || !statSync(dir).isDirectory()) {
    continue;
  }
  for (const file of readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.eps'))) {
    const slug = `${folder.replace(/\s+/g, '-')}${readdirSync(dir).filter((f) => f.endsWith('.eps')).length > 1 ? '-' + basename(file, '.eps').slice(-8) : ''}`;
    const pdf = join(tmpdir(), `${slug}.pdf`);
    const svg = join(out, `${slug}.svg`);
    try {
      execFileSync(GS, ['-q', '-dNOPAUSE', '-dBATCH', '-dSAFER', '-sDEVICE=pdfwrite', '-dEPSCrop', `-sOutputFile=${pdf}`, join(dir, file)], { stdio: 'pipe' });
      execFileSync(INKSCAPE, [pdf, '--export-type=svg', '--export-plain-svg', `--export-filename=${svg}`], { stdio: 'pipe' });
      console.log(`ok     ${slug}`);
    } catch (err) {
      console.warn(`FAILED ${slug}: ${String(err.message).split('\n')[0]}`);
    }
  }
}

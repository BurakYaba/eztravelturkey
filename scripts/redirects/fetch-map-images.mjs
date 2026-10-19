// Downloads the original pictures of the five "Map of X" posts from the old site and puts them in public/ at the same address
// (docs/project-plan.md P7.13). Google lists them by that address, and a custom domain for Sanity's CDN is not available on the
// plans in use, so these ten files are kept in the repository: /public/uploads/... is then public/public/uploads/...
//
//   node scripts/redirects/fetch-map-images.mjs
//
// The addresses were read from the archived pages of the old site (the ones `build-images.mjs` could not match to a picture).
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const files = [
  '/public/uploads/2025/01/20/678e1958581f4/Turkey-Map--4.jpg',
  '/public/uploads/2025/01/20/678e19581e1a9/Turkey-Map--3.jpg',
  '/public/uploads/2025/01/30/679aff8e521df/Morocco-Map--3.jpg',
  '/public/uploads/2025/01/30/679aff8de49bd/Morocco-Map---2.jpg',
  '/public/uploads/2025/01/26/67965b932892b/Egypt-Map--2.jpg',
  '/public/uploads/2025/01/26/67965b92e6efe/Egypt-Map--1.jpg',
  '/public/uploads/2025/01/24/6793403384a09/Greece-Map-3.jpg',
  '/public/uploads/2025/01/24/67934032f34f3/Greece-Map--1.jpg',
  '/public/uploads/2025/01/28/6798928b68a44/Jordan-Map--2.jpg',
  '/public/uploads/2025/01/28/679892ea25e4f/Jordan-Map--.jpg',
];
for (const file of files) {
  const response = await fetch(`https://www.magnificenttravel.com${file}`);
  if (!response.ok) throw new Error(`${file}: ${response.status}`);
  const target = path.join(root, 'public', file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  console.log('saved', file);
}

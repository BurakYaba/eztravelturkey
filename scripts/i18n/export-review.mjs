// Writes the words of the site's design (menus, buttons, forms, headings) in the three languages as one sheet, so a native speaker of
// Chinese or Japanese can read and correct them (docs/project-plan.md P5.7).
//
//   node scripts/i18n/export-review.mjs        writes docs/review/ui-strings-zh-jp.csv
//
// One row per string: key, English, Traditional Chinese, Japanese, and an empty column for the correction. The English text is the source
// (src/i18n/dictionaries/en.json); the two others were drafted and have not been checked by a native speaker yet.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const load = (lang) => JSON.parse(readFileSync(path.join(root, 'src/i18n/dictionaries', `${lang}.json`), 'utf8'));
const dictionaries = { en: load('en'), zh: load('zh'), jp: load('jp') };

const flat = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, item]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    return item && typeof item === 'object' ? flat(item, name) : [[name, item]];
  });

const english = flat(dictionaries.en);
const zh = new Map(flat(dictionaries.zh));
const jp = new Map(flat(dictionaries.jp));
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const rows = ['key,english,traditional_chinese,japanese,correction_zh,correction_jp'];
for (const [key, text] of english) {
  rows.push([q(key), q(text), q(zh.get(key)), q(jp.get(key)), '""', '""'].join(','));
}
mkdirSync(path.join(root, 'docs/review'), { recursive: true });
writeFileSync(path.join(root, 'docs/review/ui-strings-zh-jp.csv'), `﻿${rows.join('\n')}\n`);
console.log(`${english.length} strings written to docs/review/ui-strings-zh-jp.csv`);
const missing = english.filter(([key]) => !zh.has(key) || !jp.has(key));
if (missing.length > 0) {
  console.log(`MISSING in zh or jp: ${missing.map(([k]) => k).join(', ')}`);
  process.exit(1);
}

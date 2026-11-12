import { Noto_Serif_TC } from 'next/font/google';

// The Traditional Chinese heading font, loaded by `CjkFonts` only on zh pages, only in the browser and only after the page has loaded.
// The body text uses the visitor's own Chinese font (see `html:lang(zh-Hant)` in globals.css). A CJK web font comes in about 100 slices; a
// page downloads the slices that hold its characters, which for the headings alone is about 15 files, 1.3 MB. It is a variable font, so
// no weight list is given: one set of files covers every weight the site uses.
const serif = Noto_Serif_TC({ variable: '--font-noto-serif-tc', display: 'swap', preload: false });

export const fontClasses = [serif.variable];

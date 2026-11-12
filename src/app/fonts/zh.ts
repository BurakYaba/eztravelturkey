import { Noto_Serif_TC } from 'next/font/google';

// The Traditional Chinese heading font. `CjkFonts` imports this module in the browser, only on zh pages and only after the page has
// loaded; the import brings the stylesheet that declares the 'Noto Serif TC' face (the headings' font stack in globals.css names it).
// The body text uses the visitor's own Chinese font. A CJK web font comes in about 100 slices; a page downloads the slices that hold its
// characters, which for the headings alone is about 15 files, 1.3 MB. It is a variable font, so no weight list is given: one set of
// files covers every weight the site uses.
export const serif = Noto_Serif_TC({ variable: '--font-noto-serif-tc', display: 'swap', preload: false });

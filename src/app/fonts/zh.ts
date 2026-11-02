import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google';

// Traditional Chinese fonts, loaded by `CjkFonts` only on zh pages and only in the browser. Both are variable fonts, so no weight list is
// given: one set of files covers every weight the site uses (400, 500, 600, 700) instead of one set per weight, which is a third of the
// downloads at build time (hundreds of small files, since a CJK font comes in slices) and a lighter page.
const sans = Noto_Sans_TC({ variable: '--font-noto-sans-tc', display: 'swap', preload: false });
const serif = Noto_Serif_TC({ variable: '--font-noto-serif-tc', display: 'swap', preload: false });

export const fontClasses = [sans.variable, serif.variable];

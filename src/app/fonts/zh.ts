import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google';

// Traditional Chinese fonts, loaded by `CjkFonts` only on zh pages and only in the browser.
const sans = Noto_Sans_TC({ weight: ['400', '500', '700'], variable: '--font-noto-sans-tc', display: 'swap', preload: false });
const serif = Noto_Serif_TC({ weight: ['600', '700'], variable: '--font-noto-serif-tc', display: 'swap', preload: false });

export const fontClasses = [sans.variable, serif.variable];

import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google';

// Japanese fonts, loaded by `CjkFonts` only on ja pages and only in the browser.
const sans = Noto_Sans_JP({ weight: ['400', '500', '700'], variable: '--font-noto-sans-jp', display: 'swap', preload: false });
const serif = Noto_Serif_JP({ weight: ['600', '700'], variable: '--font-noto-serif-jp', display: 'swap', preload: false });

export const fontClasses = [sans.variable, serif.variable];

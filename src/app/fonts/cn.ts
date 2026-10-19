import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';

// Simplified Chinese fonts, loaded by `CjkFonts` only on cn pages and only in the browser.
const sans = Noto_Sans_SC({ weight: ['400', '500', '700'], variable: '--font-noto-sans-sc', display: 'swap', preload: false });
const serif = Noto_Serif_SC({ weight: ['600', '700'], variable: '--font-noto-serif-sc', display: 'swap', preload: false });

export const fontClasses = [sans.variable, serif.variable];

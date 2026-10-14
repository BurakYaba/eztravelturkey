import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Hanken_Grotesk, Noto_Sans_JP, Noto_Sans_TC, Noto_Serif_JP, Noto_Serif_TC, Playfair_Display } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { JsonLd } from '@/components/shared/JsonLd';
import { site } from '@/data/site';
import { defaultLocale, hasLocale, htmlLang, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { LocaleProvider } from '@/i18n/locale-context';
import { hasNativeContent } from '@/lib/data';
import { travelAgencyJsonLd, websiteJsonLd } from '@/lib/seo';
import '../globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});

// Chinese and Japanese text is only drawn with these fonts on pages in that language (see the lang rules in globals.css).
// Their files are split by character ranges, so a page in English never downloads one. No preload for the same reason.
const notoSansTc = Noto_Sans_TC({
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
  preload: false,
});
const notoSerifTc = Noto_Serif_TC({
  weight: ['600', '700'],
  variable: '--font-noto-serif-tc',
  display: 'swap',
  preload: false,
});
const notoSansJp = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  preload: false,
});
const notoSerifJp = Noto_Serif_JP({
  weight: ['600', '700'],
  variable: '--font-noto-serif-jp',
  display: 'swap',
  preload: false,
});

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  const { meta } = getDictionary(hasLocale(lang) ? lang : defaultLocale);
  return {
    metadataBase: new URL(site.url),
    title: { default: meta.defaultTitle, template: `%s | ${site.name}` },
    description: meta.defaultDescription,
    applicationName: site.name,
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#0f2d4a',
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) {
    notFound();
  }
  const dictionary = getDictionary(lang);
  return (
    <html
      lang={htmlLang[lang]}
      className={[
        playfair.variable,
        hanken.variable,
        lang === 'zh' ? `${notoSansTc.variable} ${notoSerifTc.variable}` : '',
        lang === 'jp' ? `${notoSansJp.variable} ${notoSerifJp.variable}` : '',
      ]
        .filter(Boolean)
        .join(' ')}>
      <body>
        <LocaleProvider lang={lang}>
          <a
            href="#main"
            className="focus:bg-navy-900 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-white">
            {dictionary.common.skipToContent}
          </a>
          {!(await hasNativeContent(lang)) && (
            <p role="note" className="bg-gold-100 text-navy-900 px-4 py-2 text-center text-sm font-medium">
              {dictionary.preview.notice}
            </p>
          )}
          <Header nav={dictionary.nav} countries={dictionary.countries} homeLabel={dictionary.common.homeLabel} />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppButton />
          <JsonLd data={[travelAgencyJsonLd(), websiteJsonLd(lang)]} />
        </LocaleProvider>
      </body>
    </html>
  );
}

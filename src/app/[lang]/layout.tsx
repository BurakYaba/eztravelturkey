import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Hanken_Grotesk, Playfair_Display } from 'next/font/google';
import { CjkFonts } from '../fonts/CjkFonts';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { PreviewBar } from '@/components/layout/PreviewBar';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { JsonLd } from '@/components/shared/JsonLd';
import { site } from '@/data/site';
import { defaultLocale, hasLocale, htmlLang, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { LocaleProvider } from '@/i18n/locale-context';
import { alternatesIndex, availableCountries, hasNativeContent } from '@/lib/data';
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
    <html lang={htmlLang[lang]} className={`${playfair.variable} ${hanken.variable}`}>
      <body>
        {lang !== 'en' && <CjkFonts lang={lang} />}
        <LocaleProvider lang={lang} alternates={await alternatesIndex()}>
          <a
            href="#main"
            className="focus:bg-navy-900 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-white">
            {dictionary.common.skipToContent}
          </a>
          <PreviewBar />
          {!(await hasNativeContent(lang)) && (
            <p role="note" className="bg-gold-100 text-navy-900 px-4 py-2 text-center text-sm font-medium">
              {dictionary.preview.notice}
            </p>
          )}
          <Header
            nav={dictionary.nav}
            countries={dictionary.countries}
            homeLabel={dictionary.common.homeLabel}
            available={await availableCountries(lang)}
          />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppButton />
          <JsonLd data={[travelAgencyJsonLd(), websiteJsonLd(lang)]} />
        </LocaleProvider>
      </body>
    </html>
  );
}

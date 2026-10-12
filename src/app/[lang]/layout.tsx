import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Hanken_Grotesk, Playfair_Display } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { JsonLd } from '@/components/shared/JsonLd';
import { site } from '@/data/site';
import { hasLocale, htmlLang, locales } from '@/i18n/config';
import { LocaleProvider } from '@/i18n/locale-context';
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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Tours across Turkey, Greece, Egypt, Jordan and Morocco`,
    template: `%s | ${site.name}`,
  },
  description:
    'Licensed Turkish tour operator since 1997. Private, small group and multi-country tours across Turkey, Greece, Egypt, Jordan and Morocco.',
  applicationName: site.name,
  robots: { index: true, follow: true },
};

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
  return (
    <html lang={htmlLang[lang]} className={`${playfair.variable} ${hanken.variable}`}>
      <body>
        <LocaleProvider lang={lang}>
          <a
            href="#main"
            className="focus:bg-navy-900 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-white">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppButton />
          <JsonLd data={[travelAgencyJsonLd(), websiteJsonLd(lang)]} />
        </LocaleProvider>
      </body>
    </html>
  );
}

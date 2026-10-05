import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Playfair_Display } from 'next/font/google';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { JsonLd } from '@/components/shared/JsonLd';
import { site } from '@/data/site';
import { travelAgencyJsonLd, websiteJsonLd } from '@/lib/seo';
import './globals.css';

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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${hanken.variable}`}>
      <body>
        <a
          href="#main"
          className="focus:bg-navy-900 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppButton />
        <JsonLd data={[travelAgencyJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}

import { policies } from '@/data/policies';
import { site } from '@/data/site';
import type { Locale } from '@/i18n/config';
import { query } from './sanity';

/**
 * Contact details, social accounts and trust numbers: written in the Studio ("Site ayarları", one document per language) and read
 * here. A field a language leaves empty comes from the English document, and a field English leaves empty from the values built
 * into the site (`src/data/site.ts`), so the site works with no document at all and an editor only writes what differs.
 */
export type SiteSettings = {
  phone: string;
  phoneHref: string;
  whatsapp: string;
  whatsappNumber: string;
  email: string;
  address: { street: string; district: string; city: string; postalCode: string; country: string };
  social: { facebook: string; instagram: string; linkedin: string; x: string; youtube: string };
  otherLinks: { label: string; url: string }[];
  tripadvisorUrl: string;
  founded: number;
  licenseNo: string;
  stats: { rating: string; reviews: number; travelers: string; tours: string; years: number };
};

type Raw = {
  language: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  street?: string | null;
  district?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  x?: string | null;
  youtube?: string | null;
  tripadvisor?: string | null;
  otherLinks?: { label?: string; url?: string }[] | null;
  founded?: number | null;
  licenseNo?: string | null;
  rating?: string | null;
  reviewCount?: number | null;
  travelers?: string | null;
  tours?: string | null;
};

const fields = `language, phone, whatsapp, email, street, district, city, postalCode, country, facebook, instagram, linkedin, x, youtube, tripadvisor, otherLinks[]{ label, url }, founded, licenseNo, rating, reviewCount, travelers, tours`;

const digits = (value: string) => value.replace(/\D/g, '');

export async function getSiteSettings(lang: Locale): Promise<SiteSettings> {
  const docs = await query<Raw[]>(`*[_type == "siteSettings" && language == $lang]{ ${fields} }`, { lang });
  const own = docs.find((d) => d.language === lang);
  const text = <K extends keyof Raw>(key: K, fallback: string): string => {
    for (const doc of [own]) {
      const value = doc?.[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return fallback;
  };
  const number = <K extends keyof Raw>(key: K, fallback: number): number => {
    for (const doc of [own]) {
      const value = doc?.[key];
      if (typeof value === 'number') {
        return value;
      }
    }
    return fallback;
  };

  const phone = text('phone', site.phone);
  const whatsapp = text('whatsapp', site.whatsapp);
  const founded = number('founded', site.founded);
  // the other links of the settings document, or else the built-in ones (Weibo)
  const other = own?.otherLinks?.length ? own.otherLinks : site.otherLinks;
  return {
    phone,
    phoneHref: phone === site.phone ? site.phoneHref : `tel:+${digits(phone)}`,
    whatsapp,
    whatsappNumber: whatsapp === site.whatsapp ? site.whatsappNumber : digits(whatsapp),
    email: text('email', site.email),
    address: {
      street: text('street', site.address.street),
      district: text('district', site.address.district),
      city: text('city', site.address.city),
      postalCode: text('postalCode', site.address.postalCode),
      country: text('country', site.address.country),
    },
    social: {
      facebook: text('facebook', site.social.facebook),
      instagram: text('instagram', site.social.instagram),
      linkedin: text('linkedin', site.social.linkedin),
      x: text('x', site.social.x),
      youtube: text('youtube', ''),
    },
    otherLinks: other.filter((l): l is { label: string; url: string } => Boolean(l.label && l.url)),
    tripadvisorUrl: text('tripadvisor', site.tripadvisorUrl),
    founded,
    licenseNo: text('licenseNo', site.licenseNo),
    stats: {
      rating: text('rating', site.stats.rating),
      reviews: number('reviewCount', site.stats.reviews),
      travelers: text('travelers', site.stats.travelers),
      tours: text('tours', site.stats.tours),
      years: new Date().getFullYear() - founded,
    },
  };
}

export { whatsappUrl } from './settings-url';

export type TourTexts = {
  payment: { label: string; value: string; text: string }[];
  rules: { kind: 'passport' | 'insurance'; title: string; text: string }[];
};

/** The "Payment Summary" and "Trip Requirements" texts of a language: from the Studio, else the ones built into the site. */
export async function getTourTexts(lang: Locale): Promise<TourTexts> {
  const doc = await query<{
    paymentSteps?: { label?: string; value?: string; text?: string }[] | null;
    rules?: { kind?: string; title?: string; text?: string }[] | null;
  } | null>('*[_type == "tourTexts" && language == $lang][0]{ paymentSteps[]{ label, value, text }, rules[]{ kind, title, text } }', { lang });
  const builtIn = policies[lang];
  const payment = (doc?.paymentSteps ?? []).filter((s) => s.label).map((s) => ({ label: s.label ?? '', value: s.value ?? '', text: s.text ?? '' }));
  const rules = (doc?.rules ?? [])
    .filter((r) => r.title && r.text)
    .map((r) => ({ kind: (r.kind === 'insurance' ? 'insurance' : 'passport') as 'passport' | 'insurance', title: r.title ?? '', text: r.text ?? '' }));
  return {
    payment: payment.length > 0 ? payment : builtIn.payment.map((s) => ({ ...s })),
    rules: rules.length > 0 ? rules : builtIn.rules.map((r) => ({ ...r })),
  };
}

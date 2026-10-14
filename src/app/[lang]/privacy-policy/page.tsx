import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { site } from '@/data/site';
import { breadcrumbJsonLd, localizedMetadata, webPageJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';

const description =
  'How Magnificent Travel collects, uses and protects the personal information you share through this website.';

export const generateMetadata = localizedMetadata({
  title: 'Privacy Policy',
  description,
  path: '/privacy-policy',
  image: 'travel-planning',
});

const sections = [
  {
    title: 'Who we are',
    body: `${site.name} is operated by ${site.legalName}, ${site.address.street}, ${site.address.district}, ${site.address.city} ${site.address.postalCode}, ${site.address.country}. We are the data controller for the information described here.`,
  },
  {
    title: 'What we collect',
    body: 'When you send a trip request or contact message, we collect the details you enter: your name, email address, phone or WhatsApp number, travel preferences and message. If you message us on WhatsApp or by phone, we also see the details you share with us there.',
  },
  {
    title: 'How we use it',
    body: 'We use your details to reply to you, prepare itineraries and quotes, and arrange bookings you confirm. We do not sell your personal information.',
  },
  {
    title: 'Who we share it with',
    body: 'We share only what is needed to deliver your trip with the suppliers involved, such as hotels, guides, airlines and transport providers, and with service providers that help us run this website and send email. They may only use it for those purposes.',
  },
  {
    title: 'How long we keep it',
    body: 'We keep enquiry details for as long as needed to respond and to meet legal and accounting obligations. You can ask us to delete your information at any time unless we are required to keep it.',
  },
  {
    title: 'Your rights',
    body: 'You may ask to access, correct, delete or restrict the use of your personal data, and to object to its use at any time. Contact us using the details on the contact page.',
  },
  {
    title: 'Cookies and analytics',
    body: 'This website does not currently set advertising cookies. If we add analytics or similar tools, we will update this page.',
  },
  {
    title: 'Changes',
    body: 'We may update this policy from time to time. The current version is always on this page.',
  },
];

export default async function PrivacyPage() {
  const lang = await getLocale();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
  ];
  return (
    <>
      <PageBanner
        title="Privacy Policy"
        description="How we handle the information you share with us."
        image="travel-planning"
        crumbs={crumbs}
      />
      <section className="section-y">
        <div className="container-x max-w-3xl space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-2xl">{s.title}</h2>
              <p className="text-ink/90 mt-2">{s.body}</p>
            </section>
          ))}
        </div>
      </section>
      <JsonLd data={[webPageJsonLd(lang, 'Privacy Policy', '/privacy-policy'), breadcrumbJsonLd(lang, crumbs)]} />
    </>
  );
}

import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { getDictionaryForPage, getLocale } from '@/i18n/server';
import { getSiteSettings, whatsappUrl } from '@/lib/data/settings';

export async function WhatsAppButton() {
  const { whatsapp: t } = await getDictionaryForPage();
  const settings = await getSiteSettings(await getLocale());
  return (
    <aside aria-label={t.aria}>
      <a
        href={whatsappUrl(settings.whatsappNumber, t.message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.aria}
        className="group bg-navy-900 shadow-lift hover:bg-navy-800 fixed right-4 bottom-4 z-40 flex h-14 items-center gap-3 rounded-lg pr-5 pl-4 text-white transition active:translate-y-px md:right-6 md:bottom-6">
        <WhatsappLogo size={28} weight="fill" aria-hidden />
        <span className="hidden text-[0.95rem] font-semibold md:inline">{t.label}</span>
      </a>
    </aside>
  );
}

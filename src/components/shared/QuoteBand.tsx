import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import type { ImageId } from '@/data/images';
import { whatsappLink } from '@/data/site';
import { getDictionaryForPage } from '@/i18n/server';
import { ButtonAnchor, ButtonLink } from './Button';
import { Photo } from './Photo';

type Props = {
  title?: string;
  text?: string;
  image?: ImageId;
};

export async function QuoteBand({ title, text, image = 'santorini-sunset' }: Props) {
  const { ui } = await getDictionaryForPage();
  const t = ui.quoteBand;
  return (
    <section className="bg-cream-100 relative isolate overflow-hidden [--veil:var(--color-cream-100)]">
      <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[68%]">
        <Photo id={image} sizes="(min-width: 1024px) 68vw, 100vw" />
        <div aria-hidden className="bg-cream-50/85 absolute inset-0 lg:hidden" />
        <div aria-hidden className="fade-left absolute inset-0 hidden lg:block" />
      </div>
      <div className="container-wide py-14 md:py-20">
        <div className="max-w-xl">
          <h2 className="h-section">{title ?? t.title}</h2>
          <p className="text-ink/85 mt-3 text-lg">{text ?? t.text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/plan-my-trip" size="lg" arrow>
              {t.plan}
            </ButtonLink>
            <ButtonAnchor
              href={whatsappLink(t.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg">
              <WhatsappLogo size={22} weight="fill" aria-hidden />
              {t.whatsapp}
            </ButtonAnchor>
          </div>
        </div>
      </div>
    </section>
  );
}

import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import type { ImageId } from '@/data/images';
import { whatsappLink } from '@/data/site';
import { ButtonAnchor, ButtonLink } from './Button';
import { Photo } from './Photo';

type Props = {
  title?: string;
  text?: string;
  image?: ImageId;
};

export function QuoteBand({
  title = 'Tell us where you would like to go',
  text = 'Share your plans and get a personalized itinerary and quote from our travel experts.',
  image = 'santorini-sunset',
}: Props) {
  return (
    <section className="bg-cream-100 relative isolate overflow-hidden [--veil:var(--color-cream-100)]">
      <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[68%]">
        <Photo id={image} sizes="(min-width: 1024px) 68vw, 100vw" />
        <div aria-hidden className="bg-cream-50/85 absolute inset-0 lg:hidden" />
        <div aria-hidden className="fade-left absolute inset-0 hidden lg:block" />
      </div>
      <div className="container-wide py-14 md:py-20">
        <div className="max-w-xl">
          <h2 className="h-section">{title}</h2>
          <p className="text-ink/85 mt-3 text-lg">{text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/plan-my-trip" size="lg" arrow>
              Plan My Trip
            </ButtonLink>
            <ButtonAnchor
              href={whatsappLink('Hello Magnificent Travel, I would like to plan a trip.')}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg">
              <WhatsappLogo size={22} weight="fill" aria-hidden />
              Chat on WhatsApp
            </ButtonAnchor>
          </div>
        </div>
      </div>
    </section>
  );
}

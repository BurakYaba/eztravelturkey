import { ButtonLink } from '@/components/shared/Button';
import { getDictionaryForPage } from '@/i18n/server';

export default async function NotFound() {
  const { notFound: t } = await getDictionaryForPage();
  return (
    <section className="container-x flex min-h-[60dvh] flex-col items-start justify-center py-20">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="h-display mt-3 max-w-xl">{t.title}</h1>
      <p className="text-muted mt-4 max-w-lg text-lg">{t.text}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink href="/tours" size="lg" arrow>
          {t.tours}
        </ButtonLink>
        <ButtonLink href="/" size="lg" variant="secondary">
          {t.home}
        </ButtonLink>
      </div>
    </section>
  );
}

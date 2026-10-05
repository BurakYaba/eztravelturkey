import { ButtonLink } from '@/components/shared/Button';

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60dvh] flex-col items-start justify-center py-20">
      <p className="eyebrow">Error 404</p>
      <h1 className="h-display mt-3 max-w-xl">This page has wandered off the map</h1>
      <p className="text-muted mt-4 max-w-lg text-lg">
        The page you are looking for may have moved. Browse our tours or tell us where you would like to go.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink href="/tours" size="lg" arrow>
          Explore Tours
        </ButtonLink>
        <ButtonLink href="/" size="lg" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </section>
  );
}

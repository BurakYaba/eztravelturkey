import { StylePage } from '@/components/tours/StylePage';
import { buildMetadata } from '@/lib/seo';

const description =
  'Small group tours in Turkey and Greece with licensed local guides. Meaningful travel with like-minded explorers.';

export const metadata = buildMetadata({
  title: 'Small Group Tours',
  description,
  path: '/small-group-tours',
  image: 'small-group-tour',
});

export default function SmallGroupToursPage() {
  return (
    <StylePage
      style="small-group"
      path="/small-group-tours"
      title="Small Group Tours"
      lead="Meaningful travel with like-minded explorers."
      description={description}
      image="small-group-tour"
      points={[
        {
          title: 'Small by design',
          text: 'Fewer travelers means easier access to sites, better conversation with your guide and a more relaxed day.',
        },
        {
          title: 'Everything arranged locally',
          text: 'Sightseeing, transport and guide services are arranged by our local team.',
        },
        { title: 'Good value', text: 'Sharing a guide and vehicle keeps the price lower than a fully private tour.' },
        {
          title: 'Easy to join',
          text: 'Daily departure options mean you can pick the date that suits you, subject to availability.',
        },
      ]}
      faqs={[
        {
          q: 'How big are your small groups?',
          a: 'Groups are kept small so the experience stays personal. We confirm the format and expected group size in your proposal.',
        },
        { q: 'Can I switch to a private tour?', a: 'Yes. Most small group itineraries can also run privately.' },
        {
          q: 'Are small group tours suitable for solo travelers?',
          a: 'Yes. They are a popular way for solo travelers to explore with company and support.',
        },
      ]}
    />
  );
}

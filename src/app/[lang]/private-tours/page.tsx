import { StylePage } from '@/components/tours/StylePage';
import { localizedMetadata } from '@/lib/seo';

const description =
  'Private tours in Turkey, Greece, Egypt and Jordan with your own licensed guide and vehicle. Your interests, your pace, one local team.';

export const generateMetadata = localizedMetadata({
  title: 'Private Tours',
  description,
  path: '/private-tours',
  image: 'travelers-couple',
});

export default function PrivateToursPage() {
  return (
    <StylePage
      style="private"
      path="/private-tours"
      title="Private Tours"
      lead="Your interests. Your pace. A more personal way to see the world."
      description={description}
      image="travelers-couple"
      points={[
        {
          title: 'Your own guide and vehicle',
          text: 'A licensed local guide and a private vehicle stay with your party, so the day follows your interests.',
        },
        { title: 'Flexible pace', text: 'Start later, linger longer or skip a stop. The plan bends around you.' },
        {
          title: 'Tailored hotels and sightseeing',
          text: 'Choose hotel category, add nights and swap sights. We rebuild the itinerary to match.',
        },
        {
          title: 'Ideal for families and special occasions',
          text: 'Honeymoons, family trips and multigenerational journeys are easier to shape privately.',
        },
      ]}
      faqs={[
        {
          q: 'Is a private tour much more expensive?',
          a: 'It depends on group size and season. We quote clearly so you can compare private and small group options side by side.',
        },
        {
          q: 'Can I change the itinerary?',
          a: 'Yes. The listed itineraries are starting points that we adapt to your dates, hotels and interests.',
        },
        {
          q: 'Are private tours available all year?',
          a: 'Most run daily throughout the year, subject to availability. Island tours in Greece run from April to mid October.',
        },
      ]}
    />
  );
}

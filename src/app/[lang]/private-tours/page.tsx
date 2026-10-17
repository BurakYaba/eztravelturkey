import { StylePage } from '@/components/tours/StylePage';
import { dictMetadata } from '@/lib/dict-meta';

export const generateMetadata = dictMetadata((d) => d.ui.pages.styles.private, {
  path: '/private-tours',
  image: 'travelers-couple',
});

export default function PrivateToursPage() {
  return <StylePage style="private" path="/private-tours" image="travelers-couple" />;
}

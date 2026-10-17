import { StylePage } from '@/components/tours/StylePage';
import { dictMetadata } from '@/lib/dict-meta';

export const generateMetadata = dictMetadata((d) => d.ui.pages.styles.smallGroup, {
  path: '/small-group-tours',
  image: 'small-group-tour',
});

export default function SmallGroupToursPage() {
  return <StylePage style="small-group" path="/small-group-tours" image="small-group-tour" />;
}

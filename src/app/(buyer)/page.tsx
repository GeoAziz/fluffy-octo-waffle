import { BuyerHomePage } from '@/components/buyer/buyer-home-page';
import { getListings } from '@/lib/data';

export default async function BuyerLandingPage() {
  const { listings } = await getListings({ badges: ['Gold'], limit: 6 });

  return <BuyerHomePage featuredListings={listings} />;
}

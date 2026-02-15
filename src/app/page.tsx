import { BuyerHomePage } from '@/components/buyer/buyer-home-page';
import { BuyerHeader } from '@/components/buyer/buyer-header';
import { BuyerFooter } from '@/components/buyer/buyer-footer';

export default function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <BuyerHeader />
      <BuyerHomePage />
      <BuyerFooter />
    </div>
  );
}

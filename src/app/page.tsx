import { BuyerHomePage } from '@/components/buyer/buyer-home-page';
import { BuyerHeader } from '@/components/buyer/buyer-header';
import { BuyerFooter } from '@/components/buyer/buyer-footer';

/**
 * Root Home Page
 * Composes the high-trust landing experience directly at the root to avoid route conflicts.
 */
export default function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <BuyerHeader />
      <main className="flex-1 w-full animate-page-enter">
        <BuyerHomePage />
      </main>
      <BuyerFooter />
    </div>
  );
}

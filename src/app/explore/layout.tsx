import type { PropsWithChildren } from 'react';
import { BuyerHeader } from '@/components/buyer/buyer-header';
import { BuyerFooter } from '@/components/buyer/buyer-footer';

/**
 * ExploreLayout - Layout for the dedicated explore/browse page
 * Provides header and footer for the explore experience
 */
export default function ExploreLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <BuyerHeader />
      <main className="flex-1 w-full">{children}</main>
      <BuyerFooter />
    </div>
  );
}

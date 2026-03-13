import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { PublicHeader } from '@/components/public-header';
import { BuyerFooter } from '@/components/buyer/buyer-footer';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export const metadata: Metadata = {
  title: 'Kenya Land Trust - Verified Land Listings',
  description: 'Browse verified land listings in Kenya with transparent documentation and trust badges. Find residential, agricultural, commercial, and industrial land with confidence.',
  keywords: ['land for sale Kenya', 'property listings Kenya', 'verified land', 'land in Kenya', 'real estate Kenya', 'land transactions'],
};

/**
 * PublicLayout — Shell for public-facing and shared authenticated routes.
 * Uses the role-aware PublicHeader so each role sees its own navigation,
 * with no buyer-specific chrome leaking to ADMIN or SELLER users.
 */
export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <PublicHeader />
      <main className="flex-1 w-full pb-16 md:pb-0 animate-page-enter">
        {children}
      </main>
      <BuyerFooter />
      <MobileBottomNav />
    </div>
  );
}
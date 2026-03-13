import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { BuyerHeader } from '@/components/buyer/buyer-header';
import { BuyerFooter } from '@/components/buyer/buyer-footer';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { OnboardingGuard } from '@/components/buyer/onboarding-guard';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Kenya Land Trust - Buyer Dashboard',
  description: 'Manage your saved properties, searches, and messages.',
};

/**
 * BuyerSectionLayout - Strictly enforces BUYER or ADMIN role at the server level.
 * Prevents SELLER users from cross-accessing buyer-specific analytics.
 */
export default async function BuyerSectionLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login?redirect=/buyer/dashboard');
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userRole = userDoc.exists ? userDoc.data()?.role : null;

    // Strict Role Validation Protocol: only BUYER is allowed in the buyer workspace
    if (userRole !== 'BUYER') {
      // Redirect each role to its canonical workspace
      if (userRole === 'ADMIN') {
        redirect('/admin');
      }
      if (userRole === 'SELLER') {
        redirect('/dashboard');
      }
      redirect(`/denied?role=${userRole || 'UNKNOWN'}&required=BUYER&path=${encodeURIComponent('/buyer/dashboard')}`);
    }
  } catch (error) {
    console.error('[BuyerSectionLayout] Auth verification pulse failed:', error);
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <BuyerHeader />
      <OnboardingGuard>
        <main className="flex-1 w-full pb-16 md:pb-0 animate-page-enter">
          {children}
        </main>
      </OnboardingGuard>
      <BuyerFooter />
      <MobileBottomNav />
    </div>
  );
}

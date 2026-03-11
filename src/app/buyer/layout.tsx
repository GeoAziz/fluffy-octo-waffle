import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { BuyerHeader } from '@/components/buyer/buyer-header';
import { BuyerFooter } from '@/components/buyer/buyer-footer';
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

    // Strict Role Validation Protocol
    if (userRole !== 'BUYER' && userRole !== 'ADMIN') {
      // Redirect sellers to their appropriate workspace
      if (userRole === 'SELLER') {
        redirect('/dashboard');
      }
      redirect('/denied');
    }
  } catch (error) {
    console.error('[BuyerSectionLayout] Auth verification pulse failed:', error);
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <BuyerHeader />
      <main className="flex-1 w-full animate-page-enter">
        {children}
      </main>
      <BuyerFooter />
    </div>
  );
}

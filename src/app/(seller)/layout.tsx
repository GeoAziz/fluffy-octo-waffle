import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { PropsWithChildren } from 'react';
import { SellerNav } from '@/components/seller/seller-nav';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';

/**
 * SellerLayout - Enforces SELLER or ADMIN role at the server level.
 * This runs in the Node.js runtime, supporting 'firebase-admin'.
 */
export default async function SellerLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login?redirect=/dashboard');
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userRole = userDoc.exists ? userDoc.data()?.role : null;

    if (userRole !== 'SELLER' && userRole !== 'ADMIN') {
      redirect(`/denied?role=${userRole || 'UNKNOWN'}&required=SELLER&path=${encodeURIComponent('/dashboard')}`);
    }
  } catch (error) {
    console.error('[SellerLayout] Auth verification failed:', error);
    redirect('/login');
  }

  return (
    <SidebarProvider className="w-full h-screen">
      <Sidebar>
        <SellerNav />
      </Sidebar>
      <SidebarInset className="flex flex-col overflow-hidden animate-page-enter">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

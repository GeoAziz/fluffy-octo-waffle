import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { PropsWithChildren } from 'react';
import { AdminNav } from './_components/admin-nav';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';

/**
 * AdminLayout - Enforces ADMIN role at the server level.
 * This runs in the Node.js runtime, supporting 'firebase-admin'.
 */
export default async function AdminLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login?redirect=/admin');
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userRole = userDoc.exists ? userDoc.data()?.role : null;

    if (userRole !== 'ADMIN') {
      redirect('/denied');
    }
  } catch (error) {
    console.error('[AdminLayout] Auth verification failed:', error);
    redirect('/login');
  }

  return (
    <SidebarProvider className="w-full h-screen">
      <Sidebar>
        <AdminNav />
      </Sidebar>
      <SidebarInset className="flex flex-col overflow-hidden animate-page-enter">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

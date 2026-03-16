import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';

/**
 * Legacy /messages route — redirects users to their role-scoped messaging area.
 * - Buyers   → /buyer/messages
 * - Sellers  → /dashboard/messages
 * - Admins   → /admin/inbox
 * - No auth  → /login (with buyer messages as return destination)
 */
export default async function MessagesRedirectPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login?redirect=/buyer/messages');
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const role = userDoc.exists ? userDoc.data()?.role : null;

    if (role === 'SELLER') redirect('/dashboard/messages');
    if (role === 'ADMIN') redirect('/admin/inbox');
    redirect('/buyer/messages');
  } catch {
    redirect('/login?redirect=/buyer/messages');
  }
}

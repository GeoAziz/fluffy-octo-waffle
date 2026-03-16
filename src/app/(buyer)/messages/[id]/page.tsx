import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';

/**
 * Legacy /messages/[id] route — redirects to the role-scoped conversation view.
 * - Buyers   → /buyer/messages/[id]
 * - Sellers  → /dashboard/messages/[id]
 * - Admins   → /admin/inbox
 * - No auth  → /login (with buyer messages as return destination)
 */
export default async function ConversationRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect(`/login?redirect=/buyer/messages/${id}`);
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const role = userDoc.exists ? userDoc.data()?.role : null;

    if (role === 'SELLER') redirect(`/dashboard/messages/${id}`);
    if (role === 'ADMIN') redirect('/admin/inbox');
    redirect(`/buyer/messages/${id}`);
  } catch {
    redirect(`/login?redirect=/buyer/messages/${id}`);
  }
}

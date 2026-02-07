import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { ListingStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingIds, status } = body || {};

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json({ status: 'error', message: 'No listing IDs provided.' }, { status: 400 });
    }
    
    const validStatuses: ListingStatus[] = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ status: 'error', message: 'Invalid status provided.' }, { status: 400 });
    }

    // Verify session cookie
    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ status: 'error', message: 'Authentication required.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userRole = userDoc.exists ? userDoc.data()?.role : null;

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ status: 'error', message: 'Authorization required: Only admins can perform this action.' }, { status: 403 });
    }

    const batch = adminDb.batch();
    listingIds.forEach((id: string) => {
      const ref = adminDb.collection('listings').doc(id);
      batch.update(ref, {
        status,
        updatedAt: FieldValue.serverTimestamp(),
        adminReviewedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    // Revalidate relevant paths
    revalidatePath('/admin');
    revalidatePath('/admin/listings');
    revalidatePath('/');
    listingIds.forEach(id => {
      revalidatePath(`/listings/${id}`);
      revalidatePath(`/admin/listings/${id}`);
    });

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    console.error('/api/admin/bulk-update error:', err?.message || err);
    return NextResponse.json({ status: 'error', message: err?.message || 'Unknown error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendBrandedEmail } from '@/lib/email-service';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = enforceRateLimit({
      scope: 'listing-report-ip',
      identifier: ip,
      maxRequests: 10,
      windowMs: 60_000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { message: 'Too many report submissions. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      );
    }

    const { listingId, reason } = await request.json();

    if (!listingId || !reason) {
      return NextResponse.json({ message: 'Listing ID and reason are required.' }, { status: 400 });
    }

    let reporter: { uid: string; email?: string | null; displayName?: string | null } | null = null;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (sessionCookie) {
      try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userLimit = enforceRateLimit({
          scope: 'listing-report-user',
          identifier: decodedToken.uid,
          maxRequests: 6,
          windowMs: 60_000,
        });

        if (!userLimit.allowed) {
          return NextResponse.json(
            { message: 'Too many report submissions from this account. Please retry shortly.' },
            { status: 429, headers: { 'Retry-After': String(userLimit.retryAfterSeconds) } }
          );
        }

        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          reporter = {
            uid: decodedToken.uid,
            email: userData?.email ?? decodedToken.email ?? null,
            displayName: userData?.displayName ?? decodedToken.name ?? null,
          };
        } else {
          reporter = { uid: decodedToken.uid, email: decodedToken.email ?? null, displayName: decodedToken.name ?? null };
        }
      } catch (authError) {
        console.warn('Report submission: unable to verify reporter identity.', authError);
      }
    }

    const reportRef = await adminDb.collection('listingReports').add({
      listingId,
      reason,
      reporter,
      createdAt: FieldValue.serverTimestamp(),
      status: 'new',
    });

    if (reporter?.email) {
      // Send Branded Confirmation to Reporter
      await sendBrandedEmail({
        to: reporter.email,
        type: 'report_received',
        subject: 'We received your listing report',
        payload: {
          listingId,
          reportId: reportRef.id,
          name: reporter.displayName ?? 'there',
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Report submission failed:', error);
    return NextResponse.json({ message: 'Failed to submit report.' }, { status: 500 });
  }
}

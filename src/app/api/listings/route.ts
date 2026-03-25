import { NextResponse } from 'next/server';
import { createListing } from '@/app/actions';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipLimit = enforceRateLimit({
      scope: 'listing-create-ip',
      identifier: ip,
      maxRequests: 12,
      windowMs: 60_000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many listing creation attempts. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      );
    }

    const cookieHeader = req.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
    const sessionCookie = sessionMatch?.[1];
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const role = userDoc.exists ? userDoc.data()?.role : null;
    if (role !== 'SELLER' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Authorization required: SELLER role required.' }, { status: 403 });
    }

    const userLimit = enforceRateLimit({
      scope: 'listing-create-user',
      identifier: decoded.uid,
      maxRequests: 6,
      windowMs: 60_000,
    });

    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many listing submissions. Please slow down and retry.' },
        { status: 429, headers: { 'Retry-After': String(userLimit.retryAfterSeconds) } }
      );
    }

    // Expect a multipart/form-data request from the client
    const formData = await req.formData();
    const result = await createListing(formData);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('API /api/listings error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

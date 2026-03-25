import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

async function getAuthenticatedUserFromCookie(cookieHeader: string | undefined) {
  try {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/__session=([^;]+)/);
    const sessionCookie = match?.[1];
    if (!sessionCookie) return null;
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) return null;
    return { uid: decoded.uid, role: userDoc.data()?.role };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipLimit = enforceRateLimit({
      scope: 'auth-redirect-ip',
      identifier: ip,
      maxRequests: 120,
      windowMs: 60_000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many redirect checks. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      );
    }

    const cookieHeader = req.headers.get('cookie') || undefined;
    const user = await getAuthenticatedUserFromCookie(cookieHeader);
    if (!user) return NextResponse.json({ redirect: '/login' });

    let finalRedirect = '/';
    if (user.role === 'ADMIN') finalRedirect = '/admin';
    else if (user.role === 'SELLER') finalRedirect = '/dashboard';

    return NextResponse.json({ redirect: finalRedirect, role: user.role });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

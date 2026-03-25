import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

/**
 * Session Management Route
 * Handles verification, creation, and deletion of secure session cookies.
 * Now includes role-hint cookie provisioning for Edge-compatible middleware authorization.
 */

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const sessionReadLimit = enforceRateLimit({
    scope: 'auth-session-read',
    identifier: ip,
    maxRequests: 120,
    windowMs: 60_000,
  });

  if (!sessionReadLimit.allowed) {
    return NextResponse.json(
      { status: 'error', message: 'Too many session checks. Please retry shortly.' },
      { status: 429, headers: { 'Retry-After': String(sessionReadLimit.retryAfterSeconds) } }
    );
  }

  const sessionCookie = request.cookies.get('__session')?.value;
  
  if (!sessionCookie) {
    return NextResponse.json({ status: 'error', authenticated: false }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    let role: string | null = null;
    try {
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      role = userDoc.exists ? userDoc.data()?.role ?? null : null;
    } catch (roleError: unknown) {
      const message = roleError instanceof Error ? roleError.message : String(roleError);
      console.warn('/api/auth/session GET: Unable to load user role:', message);
    }
    return NextResponse.json({ status: 'success', authenticated: true, uid: decodedToken.uid, role });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('/api/auth/session GET: Session verification failed:', message);
    return NextResponse.json({ status: 'error', authenticated: false }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const sessionCreateLimit = enforceRateLimit({
    scope: 'auth-session-create',
    identifier: ip,
    maxRequests: 15,
    windowMs: 60_000,
  });

  if (!sessionCreateLimit.allowed) {
    return NextResponse.json(
      { status: 'error', message: 'Too many login attempts. Please retry shortly.' },
      { status: 429, headers: { 'Retry-After': String(sessionCreateLimit.retryAfterSeconds) } }
    );
  }

  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ status: 'error', message: 'idToken is required.' }, { status: 400 });
  }

  const sessionTtlDays = Number(process.env.SESSION_COOKIE_TTL_DAYS ?? '2');
  const clampedSessionTtlDays = Number.isFinite(sessionTtlDays)
    ? Math.min(Math.max(sessionTtlDays, 1), 14)
    : 2;
  const expiresInMs = 60 * 60 * 24 * clampedSessionTtlDays * 1000;

  try {
    // Authoritative role fetch during session creation
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const role = userDoc.exists ? userDoc.data()?.role : 'BUYER';

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: expiresInMs });

    const forwardedProto = request.headers.get('x-forwarded-proto');
    const isSecureContext = process.env.NODE_ENV === 'production'
      || forwardedProto === 'https'
      || request.nextUrl.protocol === 'https:';
    
    const options = { 
        name: '__session', 
        value: sessionCookie, 
        maxAge: expiresInMs / 1000,
        httpOnly: true, 
        secure: isSecureContext,
        sameSite: 'lax' as const,
        path: '/' 
    };
    
    const response = NextResponse.json({ status: 'success', role, expiresInDays: clampedSessionTtlDays });
    response.cookies.set(options);
    
    // Set a non-httpOnly role hint for Edge Middleware routing
    response.cookies.set({
      name: '__user_role',
      value: role,
      maxAge: expiresInMs / 1000,
      path: '/',
      secure: isSecureContext,
      sameSite: 'lax'
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("/api/auth/session POST: Error creating session cookie:", error);
    return NextResponse.json({ status: 'error', message: `Failed to create session cookie: ${message}` }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request);
  const logoutLimit = enforceRateLimit({
    scope: 'auth-session-delete',
    identifier: ip,
    maxRequests: 30,
    windowMs: 60_000,
  });

  if (!logoutLimit.allowed) {
    return NextResponse.json(
      { status: 'error', message: 'Too many logout attempts. Please retry shortly.' },
      { status: 429, headers: { 'Retry-After': String(logoutLimit.retryAfterSeconds) } }
    );
  }

  const sessionCookie = request.cookies.get('__session')?.value;
  if (sessionCookie) {
    try {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, false);
      await adminAuth.revokeRefreshTokens(decodedToken.uid);
    } catch {
      console.warn('/api/auth/session DELETE: Unable to revoke refresh tokens for current session.');
    }
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const isSecureContext = process.env.NODE_ENV === 'production'
    || forwardedProto === 'https'
    || request.nextUrl.protocol === 'https:';

  const response = NextResponse.json({ status: 'success' });
  response.cookies.set('__session', '', {
    maxAge: 0,
    httpOnly: true,
    secure: isSecureContext,
    sameSite: 'lax',
    path: '/',
  });
  response.cookies.set('__user_role', '', {
    maxAge: 0,
    secure: isSecureContext,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}

import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

/**
 * Session Management Route
 * Handles verification, creation, and deletion of secure session cookies.
 * Now includes role-hint cookie provisioning for Edge-compatible middleware authorization.
 */

export async function GET(request: NextRequest) {
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
    } catch (roleError: any) {
      console.warn('/api/auth/session GET: Unable to load user role:', roleError?.message ?? roleError);
    }
    return NextResponse.json({ status: 'success', authenticated: true, uid: decodedToken.uid, role });
  } catch (error: any) {
    console.error('/api/auth/session GET: Session verification failed:', error.message);
    return NextResponse.json({ status: 'error', authenticated: false }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ status: 'error', message: 'idToken is required.' }, { status: 400 });
  }

  // 5 days session
  const expiresInMs = 60 * 60 * 24 * 5 * 1000;

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
    
    const response = NextResponse.json({ status: 'success', role });
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
  } catch (error: any) {
    console.error("/api/auth/session POST: Error creating session cookie:", error);
    return NextResponse.json({ status: 'error', message: `Failed to create session cookie: ${error.message}` }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'success' });
  response.cookies.set('__session', '', { maxAge: 0 });
  response.cookies.set('__user_role', '', { maxAge: 0 });
  return response;
}

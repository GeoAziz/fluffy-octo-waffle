import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

// This route is called on login/signup to create a session cookie
export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  // 5 days
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    const options = { 
        name: '__session', 
        value: sessionCookie, 
        maxAge: expiresIn, 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        path: '/' 
    };
    
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set(options);
    return response;
  } catch (error) {
    console.error("Session cookie error:", error);
    return NextResponse.json({ status: 'error', message: 'Failed to create session cookie' }, { status: 401 });
  }
}

// This route is called on logout
export async function DELETE() {
  const response = NextResponse.json({ status: 'success' });
  response.cookies.set('__session', '', { maxAge: 0 });
  return response;
}

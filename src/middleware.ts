import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;
  
  // These are public pages, but if a user is logged in, we don't want them to see it.
  const authPages = ['/login', '/signup'];
  if (authPages.includes(pathname) && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const protectedPages = ['/admin', '/dashboard', '/listings/new'];
  const isProtectedRoute = protectedPages.some(p => pathname.startsWith(p));

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

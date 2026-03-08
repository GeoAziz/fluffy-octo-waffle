import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * Runs on the Edge Runtime. Node.js modules like 'path' or 'fs' are NOT supported.
 * Logic that requires 'firebase-admin' has been moved to Server Components (Layouts).
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;
  
  // Skip middleware for internal Next.js paths and assets
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Define route groups
  const authPages = ['/login', '/signup'];
  const generalProtectedPages = ['/messages', '/profile', '/favorites', '/onboarding', '/buyer/dashboard'];
  const sellerPages = ['/dashboard', '/listings/new'];
  const isAdminRoute = pathname.startsWith('/admin');
  const isSellerRoute = sellerPages.some(p => pathname.startsWith(p)) || /^\/listings\/[^/]+\/edit$/.test(pathname);
  const isGeneralProtectedRoute = generalProtectedPages.some(p => pathname.startsWith(p));

  // 1. Redirect already logged-in users away from auth pages
  if (authPages.includes(pathname) && sessionCookie) {
    // We don't check roles here to keep it Edge-compatible. 
    // The specific page/layout will handle final landing.
    return NextResponse.next();
  }

  // 2. Protect routes requiring authentication
  if (isGeneralProtectedRoute || isSellerRoute || isAdminRoute) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
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

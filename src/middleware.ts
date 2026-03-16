import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * Runs on the Edge Runtime. Node.js modules like 'path' or 'fs' are NOT supported.
 * 
 * Authorization Strategy:
 * 1. Authentication is authoritative via the __session cookie.
 * 2. Authorization (role-based) uses a __user_role "hint" cookie for immediate Edge redirection.
 * 3. Final, secure authorization is ALWAYS verified server-side in Layouts/Server Components.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;
  const userRole = request.cookies.get('__user_role')?.value;
  
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
  const buyerPages = ['/buyer/dashboard', '/buyer/onboarding', '/buyer/messages'];
  const sellerPages = ['/dashboard', '/listings/new'];
  // Note: /messages is intentionally excluded — those pages are redirect-only and
  // handle their own auth checks server-side, redirecting to the correct role-scoped area.
  const generalProtectedPages = ['/profile', '/favorites', ...buyerPages];
  
  const isAdminRoute = pathname.startsWith('/admin');
  const isSellerRoute = sellerPages.some(p => pathname.startsWith(p)) || /^\/listings\/[^/]+\/edit$/.test(pathname);
  const isBuyerRoute = buyerPages.some(p => pathname.startsWith(p)) || pathname === '/favorites';
  const isGeneralProtectedRoute = generalProtectedPages.some(p => pathname.startsWith(p)) || isSellerRoute || isAdminRoute;

  // 1. Redirect already logged-in users away from auth pages
  if (authPages.includes(pathname) && sessionCookie) {
    return NextResponse.next();
  }

  // 2. Protect routes requiring authentication
  if (isGeneralProtectedRoute) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Perform Role-Based Authorization Hints
    // Note: This reduces "pass-through" to unauthorized layouts
    
    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/denied?role=${userRole || 'UNKNOWN'}&required=ADMIN&path=${encodeURIComponent(pathname)}`, request.url));
    }

    if (isSellerRoute && userRole !== 'SELLER' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/denied?role=${userRole || 'UNKNOWN'}&required=SELLER&path=${encodeURIComponent(pathname)}`, request.url));
    }

    if (isBuyerRoute && userRole !== 'BUYER') {
      // Redirect each non-buyer role to its canonical workspace
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      if (userRole === 'SELLER') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL(`/denied?role=${userRole || 'UNKNOWN'}&required=BUYER&path=${encodeURIComponent(pathname)}`, request.url));
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

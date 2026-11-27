import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that do not require authentication
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check for session token in cookies
  const token = request.cookies.get('accessToken')?.value;

  // Protect private routes
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/weddings') ||
    pathname.startsWith('/gifts') ||
    pathname.startsWith('/guests') ||
    pathname.startsWith('/reconciliation') ||
    pathname.startsWith('/clerks') ||
    pathname.startsWith('/settings');

  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

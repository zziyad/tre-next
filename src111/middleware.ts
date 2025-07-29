import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add any paths that should be accessible without authentication
const publicPaths = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register', '/api/debug/session'];

// API routes that require authentication but should not redirect to login
const protectedApiPaths = ['/api/events', '/api/auth/logout', '/api/auth/me', '/api/real-time-status'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Temporarily bypass authentication for testing
  return NextResponse.next();

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    // If user is already logged in and tries to access login/register pages,
    // redirect them to dashboard
    const sessionToken = request.cookies.get('session_token');
    if (sessionToken && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check for session token
  const sessionToken = request.cookies.get('session_token');

  // If no session token is present
  if (!sessionToken) {
    // For API routes, return 401 instead of redirecting
    if (protectedApiPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // For regular pages, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 
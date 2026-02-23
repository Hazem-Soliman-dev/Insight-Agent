import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/projects', '/admin', '/usage'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has access token
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Redirect unauthenticated users to login for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // NOTE: We intentionally do NOT redirect authenticated users away from /login or /register
  // here. The middleware cannot validate whether the cookie token is still valid, so a stale
  // cookie would lock users out of auth pages. The client-side AuthProvider handles this
  // redirect after actually validating the token.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

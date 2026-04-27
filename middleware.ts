import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import authConfig from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard', '/account', '/admin'];
// Rutas que además requieren rol admin
const ADMIN_ROUTES = ['/admin'];

export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const accountPath = pathname.replace('/dashboard', '/account');
    return NextResponse.redirect(new URL(accountPath, request.url));
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!request.auth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set(
        'callbackUrl',
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute) {
      const role = (request.auth.user as { id: string; role?: string })?.role;
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/account', request.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

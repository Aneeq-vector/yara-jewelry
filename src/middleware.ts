import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /yara-admin and all subpaths
  if (path.startsWith('/yara-admin')) {
    const authCookie = request.cookies.get('pb_auth');

    if (!authCookie || !authCookie.value) {
      // If no cookie, redirect to home page so it's completely hidden
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // The cookie is URI encoded or raw JSON depending on how it was set.
      const payloadString = decodeURIComponent(authCookie.value);
      const payload = JSON.parse(payloadString);

      // Verify if the user is an admin
      if (!payload?.model || payload.model.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // If valid admin, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      // If parsing fails, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
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
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

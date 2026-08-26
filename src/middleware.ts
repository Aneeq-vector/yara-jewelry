import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /yara-admin and all subpaths
  if (path.startsWith('/yara-admin')) {
    // Allow access to the admin login page
    if (path === '/yara-admin/login' || path === '/yara-admin/login/') {
      return NextResponse.next();
    }
    const authCookie = request.cookies.get('pb_admin_auth');

    if (!authCookie || !authCookie.value) {
      // If no cookie, redirect to home page so it's completely hidden
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // The cookie is URI encoded or raw JSON depending on how it was set.
      let payloadString = authCookie.value;
      
      // Try decoding if it looks URI encoded
      if (payloadString.includes('%7B')) {
        payloadString = decodeURIComponent(payloadString);
      }
      
      const payload = JSON.parse(payloadString);

      // Verify if the user is an admin
      if (!payload?.model || payload.model.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // If valid admin, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware: Error parsing pb_admin_auth cookie:', error);
      console.error('Middleware: Cookie value was:', authCookie.value);
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

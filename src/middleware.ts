import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

import { ROUTE_PERMISSIONS, can } from '@/config/permissions';

/**
 * Route-level half of RBAC. The other half is `<Can>` in the UI — hiding a
 * button without protecting its route only stops people who do not type URLs.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  const signedIn = Boolean(token) && token?.error !== 'RefreshFailed';

  if (pathname === '/login') {
    // Bounce an already-signed-in admin away from the sign-in page.
    return signedIn
      ? NextResponse.redirect(new URL('/dashboard', request.url))
      : NextResponse.next();
  }

  if (!signedIn) {
    const url = new URL('/login', request.url);
    // Remember where they were headed so sign-in can return them there.
    if (pathname !== '/') url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  const rule = ROUTE_PERMISSIONS.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (rule && !can(token?.role, rule.permission)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next internals, the API routes (which guard themselves
  // via the proxy) and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|fonts).*)'],
};

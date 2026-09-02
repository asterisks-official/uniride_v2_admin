import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

import { ROUTE_PERMISSIONS, can } from '@/config/permissions';

/**
 * Routes anyone may open, signed in or not.
 *
 * The marketing page lives in this app but is not part of the console, so it
 * has to be exempted here — otherwise the redirect below bounces every visitor
 * to a sign-in screen they have no account for, which is the opposite of what a
 * public landing page is for.
 */
const PUBLIC_ROUTES = new Set(['/']);

/**
 * Route-level half of RBAC. The other half is `<Can>` in the UI — hiding a
 * button without protecting its route only stops people who do not type URLs.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  const signedIn = Boolean(token) && token?.error !== 'RefreshFailed';

  if (PUBLIC_ROUTES.has(pathname)) {
    // Deliberately shown to signed-in admins too. Bouncing them to the
    // dashboard would make the company's own front page unreachable from the
    // browser they work in all day.
    return NextResponse.next();
  }

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

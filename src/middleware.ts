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

  const host = request.headers.get('host') ?? '';
  // The purchased domain is split in two: the apex is the marketing site, the
  // `admin.` subdomain is the console. Everything else — localhost, and the
  // *.vercel.app preview hosts -- keeps serving both halves from one origin, so
  // development and preview review do not need a second hostname.
  const splitHost = host.endsWith('uniridebd.com');
  const onConsole = host.startsWith('admin.');

  if (splitHost && !onConsole) {
    // The marketing host serves the landing page and nothing else. Keeping the
    // console on its own origin is what makes the session cookie host-only: an
    // XSS in a marketing component then has no origin from which to call /api
    // as a signed-in admin. Worth the redirect, given what this panel renders.
    if (pathname === '/') return NextResponse.next();
    return NextResponse.redirect(
      new URL(
        `${pathname}${request.nextUrl.search}`,
        'https://admin.uniridebd.com',
      ),
    );
  }

  const token = await getToken({ req: request });

  const signedIn = Boolean(token) && token?.error !== 'RefreshFailed';

  if (PUBLIC_ROUTES.has(pathname)) {
    // On the split domain the console host has no front page — the marketing
    // host owns it — so an admin who lands here wants the dashboard. On a
    // single-origin host it is still served, and deliberately to signed-in
    // admins too: bouncing them would make the company's own front page
    // unreachable from the browser they work in all day.
    if (splitHost) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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

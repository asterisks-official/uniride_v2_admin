import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';

import { isAllowed } from '@/server/api-allowlist';
import { backendClient, normalizeError } from '@/server/backend-client';

/**
 * The one bridge between the browser and the real backend.
 *
 * The client only ever knows `/api/...`. This reads the backend token from the
 * encrypted session cookie, checks the path against the allowlist, forwards,
 * and normalises the error shape. No business logic belongs here — if a payload
 * ever needs reshaping, add an explicit `route.ts` at the more specific path
 * and Next's routing precedence will pick it over this catch-all.
 */

async function proxy(
  request: NextRequest,
  context: { params: { path: string[] } },
): Promise<NextResponse> {
  const path = context.params.path.join('/');
  const method = request.method.toUpperCase();

  if (!isAllowed(method, path)) {
    // 404 rather than 403: a path the panel may not call should not be
    // distinguishable from one that does not exist.
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const token = await getToken({ req: request });
  if (!token?.backendAccessToken) {
    return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
  }

  try {
    const search = request.nextUrl.search;
    const body =
      method === 'GET' || method === 'DELETE'
        ? undefined
        : await request.text();

    const response = await backendClient.request({
      method,
      url: `/${path}${search}`,
      data: body ? (JSON.parse(body) as unknown) : undefined,
      headers: { Authorization: `Bearer ${token.backendAccessToken}` },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const { status, message } = normalizeError(error);
    return NextResponse.json({ message }, { status });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;

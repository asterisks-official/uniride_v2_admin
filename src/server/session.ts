import 'server-only';

import { getServerSession } from 'next-auth';

import { authOptions } from './auth-options';

/**
 * The admin's identity, safe to render or pass to a client component.
 *
 * There is no `getBackendToken()` here on purpose. The backend token lives only
 * in the encrypted JWT and is read by the proxy via `getToken({ req })`, which
 * needs the request. Exposing a helper that returns it would invite calling it
 * somewhere that leaks it.
 */
export async function getCurrentAdmin(): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
} | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user;
}

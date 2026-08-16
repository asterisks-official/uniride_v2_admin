import 'server-only';

import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { backendClient, messageFrom } from './backend-client';

/** Backend access tokens last 900s. Refresh a minute early to avoid a race. */
const REFRESH_SKEW_MS = 60_000;

/** Only these may hold a session here at all. */
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

interface LoginResponse {
  data: {
    user: { id: string; email: string; name: string; role: string };
    accessToken: string;
    refreshToken: string;
  };
}

interface RefreshResponse {
  data: { accessToken: string; refreshToken: string };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const response = await backendClient.post<LoginResponse>(
          '/auth/login',
          { email: credentials.email, password: credentials.password },
        );

        if (response.status >= 400) {
          // Surfaces the backend's own wording — "Account suspended: …" is far
          // more use to the person typing than a generic failure.
          throw new Error(messageFrom(response.data));
        }

        const { user, accessToken, refreshToken } = response.data.data;
        if (!accessToken) return null;

        // Checked here as well as in middleware: a passenger with valid
        // credentials must not get a session on the admin panel at all.
        if (!ADMIN_ROLES.includes(user.role)) {
          throw new Error('This account does not have admin access.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          backendAccessToken: accessToken,
          backendRefreshToken: refreshToken,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Sign-in: seed the token from the authorize() result.
      if (user) {
        token.role = user.role;
        token.backendAccessToken = user.backendAccessToken;
        token.backendRefreshToken = user.backendRefreshToken;
        token.backendTokenExpiresAt = Date.now() + 900_000;
        return token;
      }

      const expiresAt = token.backendTokenExpiresAt ?? 0;
      if (Date.now() < expiresAt - REFRESH_SKEW_MS) return token;

      // Expired or nearly so. Without this an admin is signed out mid-review
      // every fifteen minutes.
      const response = await backendClient.post<RefreshResponse>(
        '/auth/refresh',
        { refreshToken: token.backendRefreshToken },
      );

      if (response.status >= 400 || !response.data?.data?.accessToken) {
        // Mark it rather than throw: throwing here surfaces as an opaque
        // NextAuth error, whereas an error on the token lets middleware send
        // them to sign in cleanly.
        return { ...token, error: 'RefreshFailed' as const };
      }

      const { accessToken, refreshToken } = response.data.data;
      return {
        ...token,
        backendAccessToken: accessToken,
        backendRefreshToken: refreshToken,
        backendTokenExpiresAt: Date.now() + 900_000,
        error: undefined,
      };
    },

    session({ session, token }) {
      // Deliberately omits both backend tokens. `getSession()` hands whatever
      // is here to page scripts, so anything on this object is readable by any
      // script on the page.
      session.user.id = token.sub ?? '';
      session.user.role = token.role;
      session.error = token.error;
      return session;
    },
  },

  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
};

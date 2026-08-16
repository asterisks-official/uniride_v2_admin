import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * What the browser is allowed to see. Note the absence of any backend token:
   * `getSession()` exposes this object to page scripts.
   */
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    error?: 'RefreshFailed';
  }

  /** Returned by `authorize()`, consumed only by the `jwt` callback. */
  interface User {
    role: string;
    backendAccessToken: string;
    backendRefreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Server-side only, encrypted in the session cookie. The backend tokens live
   * here and are read by the proxy — never by the client.
   */
  interface JWT {
    role: string;
    backendAccessToken: string;
    backendRefreshToken: string;
    backendTokenExpiresAt: number;
    error?: 'RefreshFailed';
  }
}

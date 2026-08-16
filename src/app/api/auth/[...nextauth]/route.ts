import NextAuth from 'next-auth';

import { authOptions } from '@/server/auth-options';

// The handler that was missing: authOptions existed but was never mounted, so
// no session could ever be issued.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

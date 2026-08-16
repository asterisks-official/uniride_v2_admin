import 'server-only';

import { z } from 'zod';

/**
 * Server-only environment. Importing this from a client component is a build
 * error, which is the point: the backend origin must never be inlined into a
 * bundle. There is deliberately no `NEXT_PUBLIC_*` variable for it — the
 * browser talks to `/api`, and only the server knows where that forwards to.
 */
const schema = z.object({
  /** Real backend origin, e.g. http://localhost:3000/api/v1 */
  API_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be 32+ characters'),
  NEXTAUTH_URL: z.string().url(),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Fail at boot with the field names rather than at the first request with a
  // confusing 500 — a missing API_URL otherwise surfaces as "connect ECONNREFUSED
  // undefined".
  const missing = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment:\n${missing}`);
}

export const env = parsed.data;

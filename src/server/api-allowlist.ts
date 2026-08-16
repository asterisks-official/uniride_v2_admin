import 'server-only';

/**
 * Every backend path the browser is permitted to reach, and by which method.
 *
 * This list is the security boundary, not a convenience. A catch-all proxy
 * without it would forward anything the client asked for — including endpoints
 * an admin panel has no business calling. Keeping it in one file means the full
 * reachable surface is auditable in a single glance, which N separate route
 * handlers would not give you.
 *
 * Matched on method *and* path, so permitting `GET /admin/users` does not also
 * permit `DELETE /admin/users/:id`.
 */

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface AllowRule {
  method: Method;
  /** `:param` matches one non-empty path segment. */
  pattern: string;
}

const RULES: readonly AllowRule[] = [
  // ── Session ────────────────────────────────────────────────────────────────
  { method: 'GET', pattern: 'users/me' },

  // ── Admin: overview ────────────────────────────────────────────────────────
  { method: 'GET', pattern: 'admin/stats' },

  // ── Admin: rider verification ──────────────────────────────────────────────
  { method: 'GET', pattern: 'admin/riders/pending' },
  { method: 'PATCH', pattern: 'admin/riders/:userId/verify' },
  { method: 'PATCH', pattern: 'admin/riders/:userId/unblock' },

  // ── Admin: users ───────────────────────────────────────────────────────────
  { method: 'GET', pattern: 'admin/users' },
  { method: 'GET', pattern: 'admin/users/:id' },
  { method: 'PATCH', pattern: 'admin/users/:id/suspend' },

  // ── Admin: reports ─────────────────────────────────────────────────────────
  { method: 'GET', pattern: 'admin/reports' },
  { method: 'PATCH', pattern: 'admin/reports/:id' },

  // ── Admin: rides ───────────────────────────────────────────────────────────
  { method: 'GET', pattern: 'admin/rides' },
] as const;

/** Compiled once at module load rather than per request. */
const COMPILED = RULES.map((rule) => ({
  method: rule.method,
  regex: new RegExp(
    `^${rule.pattern
      .split('/')
      .map((segment) => (segment.startsWith(':') ? '[^/]+' : escapeSegment(segment)))
      .join('/')}$`,
  ),
}));

function escapeSegment(segment: string): string {
  return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param method HTTP method of the incoming request.
 * @param path   Backend path with no leading slash and no query string.
 */
export function isAllowed(method: string, path: string): boolean {
  return COMPILED.some(
    (rule) => rule.method === method.toUpperCase() && rule.regex.test(path),
  );
}

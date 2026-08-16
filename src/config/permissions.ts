/**
 * What each admin role may do.
 *
 * Enforced in two places, deliberately: `middleware.ts` at the route level, and
 * `<Can>` at the UI level. UI-only enforcement hides a button but leaves the
 * route reachable by typing the URL; route-only enforcement leaves buttons on
 * screen that fail when pressed. Both, or neither is real.
 *
 * The backend is the actual authority — every admin endpoint sits behind
 * `RolesGuard` with `@Roles(ADMIN, SUPER_ADMIN)`. These are for the interface,
 * not a substitute for that.
 */

export const PERMISSIONS = [
  'dashboard.view',
  'verifications.view',
  'verifications.decide',
  'reports.view',
  'reports.resolve',
  'users.view',
  'users.suspend',
  'rides.view',
  'config.view',
  'config.edit',
  'audit.view',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

const ADMIN_PERMISSIONS: readonly Permission[] = [
  'dashboard.view',
  'verifications.view',
  'verifications.decide',
  'reports.view',
  'reports.resolve',
  'users.view',
  'users.suspend',
  'rides.view',
  'audit.view',
];

/** Everything an ADMIN has, plus platform configuration. */
const SUPER_ADMIN_PERMISSIONS: readonly Permission[] = [
  ...ADMIN_PERMISSIONS,
  'config.view',
  'config.edit',
];

const BY_ROLE: Record<AdminRole, readonly Permission[]> = {
  ADMIN: ADMIN_PERMISSIONS,
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
};

export function isAdminRole(role: string | undefined): role is AdminRole {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function can(
  role: string | undefined,
  permission: Permission,
): boolean {
  if (!isAdminRole(role)) return false;
  return BY_ROLE[role].includes(permission);
}

/** Route prefix → permission required to open it. Used by middleware. */
export const ROUTE_PERMISSIONS: readonly {
  prefix: string;
  permission: Permission;
}[] = [
  { prefix: '/dashboard', permission: 'dashboard.view' },
  { prefix: '/verifications', permission: 'verifications.view' },
  { prefix: '/reports', permission: 'reports.view' },
  { prefix: '/users', permission: 'users.view' },
  { prefix: '/rides', permission: 'rides.view' },
  { prefix: '/config', permission: 'config.view' },
  { prefix: '/audit-log', permission: 'audit.view' },
] as const;

'use client';

import { useSession } from 'next-auth/react';

import { can, type Permission } from '@/config/permissions';

/**
 * UI-level half of RBAC. Renders `children` only when the signed-in admin holds
 * `permission`; `fallback` otherwise.
 *
 * This is presentation, not security — the route is guarded by middleware and
 * the data by the backend's RolesGuard. It exists so admins are not shown
 * controls that would fail when pressed.
 */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { data: session } = useSession();
  return can(session?.user?.role, permission) ? <>{children}</> : <>{fallback}</>;
}

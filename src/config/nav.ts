import type { Permission } from './permissions';

/**
 * Sidebar navigation. Icons are resolved in the sidebar rather than stored here
 * so this stays a plain data module usable from the server.
 */
export interface NavItem {
  key:
    | 'dashboard'
    | 'verifications'
    | 'reports'
    | 'users'
    | 'rides'
    | 'config'
    | 'audit-log';
  href: string;
  label: string;
  /** Hidden from the sidebar unless the admin holds this. */
  permission: Permission;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    permission: 'dashboard.view',
  },
  {
    key: 'verifications',
    href: '/verifications',
    label: 'Verifications',
    permission: 'verifications.view',
  },
  { key: 'reports', href: '/reports', label: 'Reports', permission: 'reports.view' },
  { key: 'users', href: '/users', label: 'Users', permission: 'users.view' },
  { key: 'rides', href: '/rides', label: 'Rides', permission: 'rides.view' },
  { key: 'config', href: '/config', label: 'App Config', permission: 'config.view' },
  {
    key: 'audit-log',
    href: '/audit-log',
    label: 'Audit Log',
    permission: 'audit.view',
  },
] as const;

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  AuditLogIcon,
  ConfigIcon,
  DashboardIcon,
  ReportsIcon,
  RidesIcon,
  UsersIcon,
  VerificationsIcon,
} from '@/components/icons';
import { NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/utils';

const ICONS = {
  dashboard: DashboardIcon,
  verifications: VerificationsIcon,
  reports: ReportsIcon,
  users: UsersIcon,
  rides: RidesIcon,
  config: ConfigIcon,
  'audit-log': AuditLogIcon,
} as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 min-h-screen flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold text-blue-600">UniRide Admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, key }) => {
          const Icon = ICONS[key];
          // Match nested routes too, so /verifications/:id keeps the parent lit.
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

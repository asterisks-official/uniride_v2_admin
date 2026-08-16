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

/** Routes with no page yet — shown, but visibly not ready. */
const UNBUILT = new Set(['reports', 'users', 'rides', 'config', 'audit-log']);

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[240px] shrink-0 flex-col bg-shell">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          U
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-shell-foreground">
          UniRide
        </span>
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-shell-muted">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {NAV_ITEMS.map(({ href, label, key }) => {
          const Icon = ICONS[key];
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const unbuilt = UNBUILT.has(key);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                active
                  ? 'bg-primary/15 text-white'
                  : 'text-shell-muted hover:bg-shell-hover hover:text-shell-foreground',
              )}
            >
              {/* The active marker is a rail, not a fill — it survives the eye
                  scanning down a column of otherwise identical rows. */}
              <span
                className={cn(
                  'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-opacity',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Icon className="size-[17px] shrink-0" />
              <span className="flex-1">{label}</span>
              {unbuilt ? (
                <span className="text-[10px] font-normal text-shell-muted/70">
                  soon
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[11px] text-shell-muted/60">
        UniRide Admin · v0.1
      </div>
    </aside>
  );
}

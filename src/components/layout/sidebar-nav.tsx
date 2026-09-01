'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import logo from '@/assets/logo/logo.png';
import {
  AuditLogIcon,
  ConfigIcon,
  DashboardIcon,
  ReportsIcon,
  RidesIcon,
  UsersIcon,
  VerificationsIcon,
} from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { can } from '@/config/permissions';
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
const UNBUILT = new Set(['config', 'audit-log']);

interface SidebarNavProps {
  /** Fires on every link click — used to close the mobile drawer. */
  onNavigate?: () => void;
}

/**
 * The nav list itself, shared between the fixed desktop sidebar and the
 * off-canvas mobile drawer so the two never drift apart.
 *
 * Items the signed-in role can't reach are hidden rather than shown-disabled —
 * a SUPER_ADMIN-only link has no reason to appear for an ADMIN at all.
 */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const role = session?.user.role;

  const items = NAV_ITEMS.filter((item) => can(role, item.permission));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Image src={logo} alt="UniRide" className="size-8 shrink-0 rounded-lg" priority />
        <span className="text-[15px] font-semibold tracking-tight text-shell-foreground">
          UniRide
        </span>
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-shell-muted">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {status === 'loading'
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="size-[17px] shrink-0 rounded-md bg-white/10" />
                <Skeleton className="h-3.5 flex-1 rounded-md bg-white/10" />
              </div>
            ))
          : items.map(({ href, label, key }) => {
              const Icon = ICONS[key];
              const active = pathname === href || pathname.startsWith(`${href}/`);
              const unbuilt = UNBUILT.has(key);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
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
    </div>
  );
}

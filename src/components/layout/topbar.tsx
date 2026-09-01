'use client';

import { signOut, useSession } from 'next-auth/react';

import { MenuIcon, SignOutIcon } from '@/components/icons';
import { UserAvatar } from '@/components/shared/user-avatar';

interface TopbarProps {
  onMenuClick?: () => void;
}

/** Who is signed in, the way out, and — below `lg` — the way into the sidebar. */
export function Topbar({ onMenuClick }: TopbarProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
      >
        <MenuIcon className="size-[18px]" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <div className="text-[13px] font-medium text-foreground">
              {user?.name ?? '—'}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {user?.role?.replace('_', ' ').toLowerCase() ?? ''}
            </div>
          </div>
          <UserAvatar name={user?.name ?? '?'} />
        </div>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: '/login' })}
          aria-label="Sign out"
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SignOutIcon className="size-[18px]" />
        </button>
      </div>
    </header>
  );
}

'use client';

import { signOut, useSession } from 'next-auth/react';

import { SignOutIcon } from '@/components/icons';

/** Who is signed in, and the way out. Both were missing entirely. */
export function Topbar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b border-border bg-card px-8">
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="text-[13px] font-medium text-foreground">
            {user?.name ?? '—'}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {user?.role?.replace('_', ' ').toLowerCase() ?? ''}
          </div>
        </div>
        <span className="grid size-9 place-items-center rounded-full bg-primary-wash text-[13px] font-semibold text-primary">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </span>
      </div>
      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: '/login' })}
        aria-label="Sign out"
        className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SignOutIcon className="size-[18px]" />
      </button>
    </header>
  );
}

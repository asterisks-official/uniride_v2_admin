'use client';

import { useEffect, useState } from 'react';

import { USER_ROLES, type UserRole, type UserRow } from '@/apikit/users';
import { SearchIcon, UsersIcon } from '@/components/icons';
import { ErrorState } from '@/components/shared/error-state';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTableParams } from '@/hooks/use-table-params';
import { cn } from '@/lib/utils';

import { useSuspendUser, useUser, useUsers } from '../hooks/use-users';
import { SuspendDialog } from '../modals/suspend-dialog';
import { formatDate, roleLabel, trustBand } from '../utils';

import { UserDetailSheet } from './user-detail-sheet';

function isRole(value: string | null): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function UsersView() {
  const { get, setParams, page } = useTableParams();
  const searchParam = get('search') ?? '';
  const roleParam = get('role');
  const suspendedParam = get('suspended');

  const role = isRole(roleParam) ? roleParam : undefined;
  const isSuspended =
    suspendedParam === 'true' ? true : suspendedParam === 'false' ? false : undefined;

  // Local mirror so typing is responsive; the URL is updated on submit rather
  // than per keystroke, which would push a history entry per character.
  const [searchInput, setSearchInput] = useState(searchParam);
  useEffect(() => setSearchInput(searchParam), [searchParam]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const query = {
    search: searchParam || undefined,
    role,
    isSuspended,
    page,
    limit: 20,
  };
  const { data, isLoading, isError, refetch } = useUsers(query);
  const detail = useUser(sheetOpen ? selectedId : null);
  const suspend = useSuspendUser();

  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const current = detail.data;

  function open(user: UserRow) {
    setSelectedId(user.id);
    setSheetOpen(true);
  }

  function confirmSuspend(reason: string) {
    if (!current) return;
    suspend.mutate(
      {
        id: current.id,
        suspend: !current.isSuspended,
        reason: reason || undefined,
      },
      { onSuccess: () => setSuspendOpen(false) },
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Users
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Every account on the platform. Search by name or email.
          </p>
        </div>
        {pagination ? (
          <div className="flex items-baseline gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
            <span className="text-[22px] font-semibold tabular-nums leading-none text-foreground">
              {pagination.total}
            </span>
            <span className="text-[12.5px] text-muted-foreground">
              {isSuspended ? 'suspended' : 'accounts'}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParams({ search: searchInput.trim() || null, page: null });
          }}
          className="relative"
        >
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name or email"
            aria-label="Search users"
            className="w-64 pl-9"
          />
        </form>

        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          <Filter active={!role} onClick={() => setParams({ role: null, page: null })}>
            All roles
          </Filter>
          {USER_ROLES.map((value) => (
            <Filter
              key={value}
              active={role === value}
              onClick={() => setParams({ role: value, page: null })}
            >
              {roleLabel(value)}
            </Filter>
          ))}
        </div>

        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          <Filter
            active={isSuspended === undefined}
            onClick={() => setParams({ suspended: null, page: null })}
          >
            Any status
          </Filter>
          <Filter
            active={isSuspended === true}
            onClick={() => setParams({ suspended: 'true', page: null })}
          >
            Suspended
          </Filter>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : isError ? (
        <ErrorState
          message="Could not load users."
          onRetry={() => void refetch()}
        />
      ) : users.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-full bg-primary-wash">
            <UsersIcon className="size-6 text-primary" />
          </span>
          <p className="text-[15px] font-medium text-foreground">
            {searchParam ? 'No matches' : 'No accounts yet'}
          </p>
          {searchParam ? (
            <p className="mt-1 text-[13px] text-muted-foreground">
              Nothing matching “{searchParam}”.
            </p>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => {
            const band = trustBand(user.stats?.trustScore ?? 50);
            return (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => open(user)}
                  className={cn(
                    'group flex w-full items-center gap-4 rounded-xl border bg-card px-4 py-3.5 text-left transition-all',
                    'hover:border-primary/40 hover:shadow-[0_1px_12px_-4px_hsl(var(--primary)/0.25)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    user.isSuspended ? 'border-destructive/40' : 'border-border',
                  )}
                >
                  <UserAvatar name={user.name} size="lg" />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14.5px] font-medium text-foreground">
                        {user.name}
                      </span>
                      {user.isSuspended ? (
                        <span className="shrink-0 rounded-md border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
                          Suspended
                        </span>
                      ) : null}
                      {!user.isEmailVerified ? (
                        <span className="shrink-0 rounded-md border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[11px] font-medium text-warning">
                          Unverified
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-[12.5px] text-muted-foreground">
                      {user.email}
                    </span>
                  </span>

                  <span className="hidden w-28 shrink-0 sm:block">
                    <span className="block text-[13px] text-foreground">
                      {roleLabel(user.role)}
                    </span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {user.university ?? '—'}
                    </span>
                  </span>

                  <span className="hidden w-20 shrink-0 lg:block">
                    <span
                      className={cn(
                        'block text-[13px] font-medium tabular-nums',
                        band.tone,
                      )}
                    >
                      {user.stats?.trustScore ?? 50}
                    </span>
                    <span className="block text-[11.5px] text-muted-foreground">
                      trust
                    </span>
                  </span>

                  <span className="hidden w-24 shrink-0 xl:block text-[12.5px] text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </span>

                  <span className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    View
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <nav className="mt-5 flex items-center justify-between">
          <span className="text-[12.5px] tabular-nums text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ·{' '}
            {pagination.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setParams({ page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setParams({ page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}

      <UserDetailSheet
        user={current}
        isLoading={detail.isLoading}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuspend={() => setSuspendOpen(true)}
        isPending={suspend.isPending}
      />

      <SuspendDialog
        name={current?.name ?? null}
        suspending={!current?.isSuspended}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        onConfirm={confirmSuspend}
        isPending={suspend.isPending}
      />
    </div>
  );
}

function Filter({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

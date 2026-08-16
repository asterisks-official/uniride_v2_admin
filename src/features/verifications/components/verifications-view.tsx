'use client';

import { useState } from 'react';

import {
  VERIFICATION_STATUSES,
  type Verification,
  type VerificationStatus,
} from '@/apikit/verifications';
import { VerificationsIcon } from '@/components/icons';
import { ErrorState } from '@/components/shared/error-state';
import { useTableParams } from '@/hooks/use-table-params';
import { cn } from '@/lib/utils';

import {
  useDecideVerification,
  useUnblockRider,
  useVerifications,
} from '../hooks/use-verifications';
import { RejectDialog } from '../modals/reject-dialog';
import { initials, vehicleLabel, waitingFor } from '../utils';

import { AttemptsMeter } from './attempts-meter';
import { VerificationDetailSheet } from './verification-detail-sheet';

const TABS: { value: VerificationStatus; label: string }[] = [
  { value: 'PENDING', label: 'Queue' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

function isStatus(value: string | null): value is VerificationStatus {
  return VERIFICATION_STATUSES.includes(value as VerificationStatus);
}

export function VerificationsView() {
  const { get, setParams, page } = useTableParams();
  const statusParam = get('status');
  const status: VerificationStatus = isStatus(statusParam)
    ? statusParam
    : 'PENDING';

  const [selected, setSelected] = useState<Verification | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const query = { status, page, limit: 20 };
  const { data, isLoading, isError, refetch } = useVerifications(query);
  const decide = useDecideVerification();
  const unblock = useUnblockRider();

  function open(verification: Verification) {
    setSelected(verification);
    setSheetOpen(true);
  }

  function approve() {
    if (!selected) return;
    decide.mutate(
      { userId: selected.userId, action: 'APPROVE' },
      { onSuccess: () => setSheetOpen(false) },
    );
  }

  function reject(note: string) {
    if (!selected) return;
    decide.mutate(
      { userId: selected.userId, action: 'REJECT', note },
      {
        onSuccess: () => {
          setRejectOpen(false);
          setSheetOpen(false);
        },
      },
    );
  }

  const riders = data?.riders ?? [];
  const pagination = data?.pagination;
  const isQueue = status === 'PENDING';

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
            Verifications
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Approve riders, or send an application back with a reason.{' '}
            <span className="text-warning">Three rejections block an account.</span>
          </p>
        </div>

        {isQueue && pagination ? (
          <div className="flex items-baseline gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
            <span className="text-[22px] font-semibold tabular-nums leading-none text-foreground">
              {pagination.total}
            </span>
            <span className="text-[12.5px] text-muted-foreground">
              waiting for review
            </span>
          </div>
        ) : null}
      </div>

      <div className="mb-5 inline-flex rounded-xl border border-border bg-card p-1">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setParams({ status: value, page: null })}
            aria-pressed={status === value}
            className={cn(
              'rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              status === value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <QueueSkeleton />
      ) : isError ? (
        <ErrorState
          message="Could not load verifications."
          onRetry={() => void refetch()}
        />
      ) : riders.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-full bg-primary-wash">
            <VerificationsIcon className="size-6 text-primary" />
          </span>
          <p className="text-[15px] font-medium text-foreground">
            {isQueue ? 'Queue is clear' : `Nothing ${TABS.find((t) => t.value === status)?.label.toLowerCase()}`}
          </p>
          {isQueue ? (
            <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
              New rider applications land here the moment they are submitted.
            </p>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-2">
          {riders.map((verification) => {
            const waiting = waitingFor(verification.createdAt);
            // Anything sitting more than three days is the thing to look at
            // first — that is what a queue view is for.
            const stale = isQueue && waiting.days >= 3;

            return (
              <li key={verification.id}>
                <button
                  type="button"
                  onClick={() => open(verification)}
                  className={cn(
                    'group flex w-full items-center gap-4 rounded-xl border bg-card px-4 py-3.5 text-left transition-all',
                    'hover:border-primary/40 hover:shadow-[0_1px_12px_-4px_hsl(var(--primary)/0.25)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    stale ? 'border-warning/40' : 'border-border',
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-wash text-[13px] font-semibold text-primary">
                    {initials(verification.user.name)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-medium text-foreground">
                      {verification.user.name}
                    </span>
                    <span className="block truncate text-[12.5px] text-muted-foreground">
                      {verification.user.university ?? verification.user.email}
                    </span>
                  </span>

                  <span className="hidden min-w-0 flex-1 md:block">
                    <span className="block truncate text-[13px] text-foreground">
                      {vehicleLabel(verification)}
                    </span>
                    <span className="block text-[12px] capitalize text-muted-foreground">
                      {verification.vehicleType}
                    </span>
                  </span>

                  <span className="hidden w-24 shrink-0 lg:block">
                    <span
                      className={cn(
                        'block text-[13px] font-medium tabular-nums',
                        stale ? 'text-warning' : 'text-foreground',
                      )}
                    >
                      {waiting.label}
                    </span>
                    <span className="block text-[11.5px] text-muted-foreground">
                      {isQueue ? 'waiting' : 'ago'}
                    </span>
                  </span>

                  <span className="hidden w-28 shrink-0 sm:block">
                    <AttemptsMeter used={verification.rejectionCount} />
                  </span>

                  <span className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    Review
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
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="flex gap-2">
            <PageButton
              disabled={pagination.page <= 1}
              onClick={() => setParams({ page: pagination.page - 1 })}
            >
              Previous
            </PageButton>
            <PageButton
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setParams({ page: pagination.page + 1 })}
            >
              Next
            </PageButton>
          </div>
        </nav>
      ) : null}

      <VerificationDetailSheet
        verification={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onApprove={approve}
        onReject={() => setRejectOpen(true)}
        onUnblock={() => {
          if (!selected) return;
          unblock.mutate(selected.userId, {
            onSuccess: () => setSheetOpen(false),
          });
        }}
        isPending={decide.isPending || unblock.isPending}
      />

      <RejectDialog
        verification={selected}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={reject}
        isPending={decide.isPending}
      />
    </div>
  );
}

function PageButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-primary/40 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

/** Mirrors the row layout so the page does not reflow when data lands. */
function QueueSkeleton() {
  return (
    <ul className="space-y-2" aria-busy>
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5"
        >
          <span className="size-10 shrink-0 animate-pulse rounded-full bg-secondary" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-40 animate-pulse rounded bg-secondary" />
            <span className="block h-2.5 w-24 animate-pulse rounded bg-secondary/70" />
          </span>
          <span className="hidden h-3 w-32 animate-pulse rounded bg-secondary md:block" />
          <span className="hidden h-3 w-16 animate-pulse rounded bg-secondary lg:block" />
          <span className="h-7 w-16 shrink-0 animate-pulse rounded-lg bg-secondary" />
        </li>
      ))}
    </ul>
  );
}

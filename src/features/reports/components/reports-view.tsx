'use client';

import { useState } from 'react';

import {
  REPORT_SEVERITIES,
  REPORT_STATUSES,
  type Report,
  type ReportSeverity,
  type ReportStatus,
} from '@/apikit/reports';
import { ReportsIcon } from '@/components/icons';
import { Can } from '@/components/shared/can';
import { ErrorState } from '@/components/shared/error-state';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Button } from '@/components/ui/button';
import { useTableParams } from '@/hooks/use-table-params';
import { cn } from '@/lib/utils';

import { useReports, useResolveReport } from '../hooks/use-reports';
import { ResolveDialog } from '../modals/resolve-dialog';
import {
  formatDateTime,
  initials,
  isOpen,
  openFor,
  severityTone,
  typeLabel,
} from '../utils';

const TABS: { value: ReportStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

function isReportStatus(value: string | null): value is ReportStatus {
  return REPORT_STATUSES.includes(value as ReportStatus);
}

function isSeverity(value: string | null): value is ReportSeverity {
  return REPORT_SEVERITIES.includes(value as ReportSeverity);
}

/**
 * The safety queue.
 *
 * Ordered by the backend as severity first, then age — the two things that
 * decide what to open next — and the list repeats both so the ordering is
 * legible rather than merely correct.
 */
export function ReportsView() {
  const { get, setParams, page } = useTableParams();
  const statusParam = get('status');
  const severityParam = get('severity');
  const status: ReportStatus = isReportStatus(statusParam)
    ? statusParam
    : 'OPEN';
  const severity = isSeverity(severityParam) ? severityParam : undefined;

  const [selected, setSelected] = useState<Report | null>(null);
  const [action, setAction] = useState<'RESOLVE' | 'DISMISS'>('RESOLVE');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useReports({
    status,
    severity,
    page,
    limit: 20,
  });
  const resolve = useResolveReport();

  const reports = data?.reports ?? [];
  const pagination = data?.pagination;
  const actionable = isOpen(status);

  function decide(report: Report, next: 'RESOLVE' | 'DISMISS') {
    setSelected(report);
    setAction(next);
    setDialogOpen(true);
  }

  function confirm(note: string) {
    if (!selected) return;
    resolve.mutate(
      { id: selected.id, action, note: note || undefined },
      { onSuccess: () => setDialogOpen(false) },
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Reports
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Safety and conduct reports raised by riders and passengers.
          </p>
        </div>

        {actionable && pagination ? (
          <div className="flex items-baseline gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
            <span className="text-[22px] font-semibold tabular-nums leading-none text-foreground">
              {pagination.total}
            </span>
            <span className="text-[12.5px] text-muted-foreground">
              awaiting a decision
            </span>
          </div>
        ) : null}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
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

        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setParams({ severity: null, page: null })}
            aria-pressed={!severity}
            className={cn(
              'rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              !severity
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            All severities
          </button>
          {REPORT_SEVERITIES.map((value) => {
            const tone = severityTone(value);
            const on = severity === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setParams({ severity: value, page: null })}
                aria-pressed={on}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  on
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className={cn('size-1.5 rounded-full', tone.dot)} />
                {value.toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : isError ? (
        <ErrorState
          message="Could not load reports."
          onRetry={() => void refetch()}
        />
      ) : reports.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-full bg-primary-wash">
            <ReportsIcon className="size-6 text-primary" />
          </span>
          <p className="text-[15px] font-medium text-foreground">
            {actionable
              ? 'Nothing to review'
              : `Nothing ${TABS.find((t) => t.value === status)?.label.toLowerCase()}`}
          </p>
          {actionable ? (
            <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
              Reports raised in the app land here, most serious first.
            </p>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-2">
          {reports.map((report) => {
            const tone = severityTone(report.severity);
            const age = openFor(report.createdAt);
            // Anything serious and more than a day old is the thing to open
            // first. A safety report going stale is the failure this list
            // exists to prevent.
            const stale =
              actionable &&
              age.days >= 1 &&
              (report.severity === 'CRITICAL' || report.severity === 'HIGH');

            return (
              <li
                key={report.id}
                className={cn(
                  'rounded-xl border bg-card px-4 py-3.5',
                  stale ? 'border-destructive/40' : 'border-border',
                )}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-[13px] font-semibold text-muted-foreground">
                    {initials(report.reported.name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-md border px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-wide',
                          tone.chip,
                        )}
                      >
                        {report.severity}
                      </span>
                      <span className="text-[14.5px] font-medium text-foreground">
                        {typeLabel(report.type)}
                      </span>
                      <span className="text-[12.5px] text-muted-foreground">
                        against {report.reported.name}
                      </span>
                    </div>

                    <p className="mt-1.5 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-foreground">
                      {report.description}
                    </p>

                    <p className="mt-1.5 text-[12px] text-muted-foreground">
                      Reported by {report.reporter.name} ·{' '}
                      <span title={formatDateTime(report.createdAt)}>
                        {age.label}
                        {actionable ? ' open' : ' ago'}
                      </span>
                      {report.rideId ? ' · linked to a ride' : ''}
                    </p>

                    {report.adminNote ? (
                      <p className="mt-2 rounded-lg border border-border bg-secondary px-3 py-2 text-[12.5px] text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Admin note:
                        </span>{' '}
                        {report.adminNote}
                      </p>
                    ) : null}
                  </div>

                  {actionable ? (
                    <Can permission="reports.resolve">
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => decide(report, 'DISMISS')}
                        >
                          Dismiss
                        </Button>
                        <Button size="sm" onClick={() => decide(report, 'RESOLVE')}>
                          Resolve
                        </Button>
                      </div>
                    </Can>
                  ) : (
                    <span className="shrink-0 text-[12px] text-muted-foreground">
                      {report.resolvedAt
                        ? formatDateTime(report.resolvedAt)
                        : null}
                    </span>
                  )}
                </div>
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

      <ResolveDialog
        report={selected}
        action={action}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={confirm}
        isPending={resolve.isPending}
      />
    </div>
  );
}

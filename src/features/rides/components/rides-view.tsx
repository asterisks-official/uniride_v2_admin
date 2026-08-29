'use client';

import { RIDE_STATUSES, type RideStatus } from '@/apikit/rides';
import { RidesIcon } from '@/components/icons';
import { ErrorState } from '@/components/shared/error-state';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Button } from '@/components/ui/button';
import { useTableParams } from '@/hooks/use-table-params';
import { cn } from '@/lib/utils';

import { useRides } from '../hooks/use-rides';
import { formatDateTime, formatFare, statusLabel, statusTone } from '../utils';

function isRideStatus(value: string | null): value is RideStatus {
  return RIDE_STATUSES.includes(value as RideStatus);
}

/**
 * Operational oversight, not a management surface.
 *
 * There is no admin endpoint that mutates a ride, so this deliberately offers
 * nothing to click on a row: it answers "what is happening right now" and
 * "what happened to that one", and stops there rather than implying powers the
 * backend does not grant.
 */
export function RidesView() {
  const { get, setParams, page } = useTableParams();
  const statusParam = get('status');
  const status = isRideStatus(statusParam) ? statusParam : undefined;

  const { data, isLoading, isError, refetch } = useRides({
    status,
    page,
    limit: 20,
  });

  const rides = data?.rides ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Rides
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Every trip on the platform. Refreshes on its own while open.
          </p>
        </div>
        {pagination ? (
          <div className="flex items-baseline gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
            <span className="text-[22px] font-semibold tabular-nums leading-none text-foreground">
              {pagination.total}
            </span>
            <span className="text-[12.5px] text-muted-foreground">
              {status ? statusLabel(status) : 'rides'}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mb-5 inline-flex flex-wrap rounded-xl border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setParams({ status: null, page: null })}
          aria-pressed={!status}
          className={cn(
            'rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !status
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          All
        </button>
        {RIDE_STATUSES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setParams({ status: value, page: null })}
            aria-pressed={status === value}
            className={cn(
              'rounded-lg px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              status === value
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {statusLabel(value)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : isError ? (
        <ErrorState
          message="Could not load rides."
          onRetry={() => void refetch()}
        />
      ) : rides.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-full bg-primary-wash">
            <RidesIcon className="size-6 text-primary" />
          </span>
          <p className="text-[15px] font-medium text-foreground">
            {status ? `No ${statusLabel(status)} rides` : 'No rides yet'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rides.map((ride) => (
            <li
              key={ride.id}
              className="rounded-xl border border-border bg-card px-4 py-3.5"
            >
              <div className="flex flex-wrap items-start gap-4">
                <span
                  className={cn(
                    'shrink-0 rounded-md border px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-wide',
                    statusTone(ride.status),
                  )}
                >
                  {statusLabel(ride.status)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-foreground">
                    <span className="font-medium">{ride.originAddress}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="font-medium">{ride.destAddress}</span>
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {ride.type === 'OFFER' ? 'Offered by' : 'Requested by'}{' '}
                    {ride.rider?.name ?? ride.passenger?.name ?? 'unknown'}
                    {ride.rider && ride.passenger
                      ? ` · matched with ${ride.passenger.name}`
                      : ' · unmatched'}
                    {' · '}
                    {ride.mode === 'INSTANT' ? 'instant' : 'scheduled'}
                  </p>
                  {ride.cancelReason ? (
                    <p className="mt-1.5 text-[12.5px] text-destructive">
                      Cancelled: {ride.cancelReason}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[14px] font-semibold tabular-nums text-foreground">
                    {formatFare(ride.fare)}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {formatDateTime(ride.scheduledAt)}
                  </p>
                </div>
              </div>
            </li>
          ))}
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
    </div>
  );
}

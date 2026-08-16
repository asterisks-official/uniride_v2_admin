'use client';

import { useState } from 'react';

import {
  VERIFICATION_STATUSES,
  type Verification,
  type VerificationStatus,
} from '@/apikit/verifications';
import { VerificationsIcon } from '@/components/icons';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageHeader } from '@/components/shared/page-header';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTableParams } from '@/hooks/use-table-params';
import { cn } from '@/lib/utils';

import {
  useDecideVerification,
  useUnblockRider,
  useVerifications,
} from '../hooks/use-verifications';
import { RejectDialog } from '../modals/reject-dialog';
import { attemptsLeft, formatDate, vehicleLabel } from '../utils';

import { VerificationDetailSheet } from './verification-detail-sheet';

const TAB_LABELS: Record<VerificationStatus, string> = {
  PENDING: 'Queue',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

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

  return (
    <>
      <PageHeader
        title="Verifications"
        description="Review rider applications. Three rejections block an account permanently."
      />

      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
        {VERIFICATION_STATUSES.map((value) => (
          <button
            key={value}
            type="button"
            // Status and page both live in the URL, so a reviewer can send a
            // colleague a link to exactly what they are looking at.
            onClick={() => setParams({ status: value, page: null })}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              status === value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
            aria-pressed={status === value}
          >
            {TAB_LABELS[value]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : isError ? (
        <ErrorState
          message="Could not load verifications."
          onRetry={() => void refetch()}
        />
      ) : riders.length === 0 ? (
        <EmptyState
          icon={VerificationsIcon}
          title={
            status === 'PENDING'
              ? 'Nothing waiting for review'
              : `No ${TAB_LABELS[status].toLowerCase()} applications`
          }
          description={
            status === 'PENDING'
              ? 'New rider applications will appear here as they are submitted.'
              : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {riders.map((verification) => {
                const left = attemptsLeft(verification);
                return (
                  <TableRow
                    key={verification.id}
                    className="cursor-pointer"
                    onClick={() => open(verification)}
                  >
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {verification.user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {verification.user.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {vehicleLabel(verification)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(verification.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={left <= 1 ? 'destructive' : 'secondary'}
                      >
                        {left} left
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          open(verification);
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <nav className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
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
    </>
  );
}

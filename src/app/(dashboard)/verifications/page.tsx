import type { Metadata } from 'next';
import { Suspense } from 'react';

import { TableSkeleton } from '@/components/shared/table-skeleton';
import { VerificationsView } from '@/features/verifications';

export const metadata: Metadata = { title: 'Verifications · UniRide Admin' };

/** Thin by design — routing and metadata only. The UI lives in the feature. */
export default function VerificationsPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={5} />}>
      <VerificationsView />
    </Suspense>
  );
}

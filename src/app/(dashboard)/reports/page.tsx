import type { Metadata } from 'next';
import { Suspense } from 'react';

import { TableSkeleton } from '@/components/shared/table-skeleton';
import { ReportsView } from '@/features/reports';

export const metadata: Metadata = { title: 'Reports · UniRide Admin' };

/** Thin by design — routing and metadata only. The UI lives in the feature. */
export default function ReportsPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={5} />}>
      <ReportsView />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { TableSkeleton } from '@/components/shared/table-skeleton';
import { RidesView } from '@/features/rides';

export const metadata: Metadata = { title: 'Rides · UniRide Admin' };

/** Thin by design — routing and metadata only. The UI lives in the feature. */
export default function RidesPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={6} />}>
      <RidesView />
    </Suspense>
  );
}

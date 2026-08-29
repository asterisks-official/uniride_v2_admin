import type { Metadata } from 'next';
import { Suspense } from 'react';

import { TableSkeleton } from '@/components/shared/table-skeleton';
import { UsersView } from '@/features/users';

export const metadata: Metadata = { title: 'Users · UniRide Admin' };

/** Thin by design — routing and metadata only. The UI lives in the feature. */
export default function UsersPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={5} />}>
      <UsersView />
    </Suspense>
  );
}

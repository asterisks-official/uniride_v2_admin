import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/features/auth';

export const metadata: Metadata = { title: 'Sign in · UniRide Admin' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-shell px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-[15px] font-bold text-primary-foreground">
            U
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-foreground">
            UniRide Admin
          </span>
        </div>
        <h1 className="mb-1 text-[22px] font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="mb-7 text-[13.5px] text-muted-foreground">Admin and super admin accounts only.</p>
        {/* useSearchParams needs a Suspense boundary to stay statically rendered. */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/features/auth';

export const metadata: Metadata = { title: 'Sign in · UniRide Admin' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">UniRide Admin</h1>
        <p className="mb-8 text-gray-500">Sign in to your account</p>
        {/* useSearchParams needs a Suspense boundary to stay statically rendered. */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

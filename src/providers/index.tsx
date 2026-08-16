'use client';

import { SessionProvider } from 'next-auth/react';

import { Toaster } from '@/components/ui/sonner';

import { QueryProvider } from './query-provider';

/** Every client-side provider the app needs, mounted once in the root layout. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </SessionProvider>
  );
}

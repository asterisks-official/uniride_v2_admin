import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';

import logo from '@/assets/logo/logo.png';
import { ReportsIcon, UsersIcon, VerificationsIcon } from '@/components/icons';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = { title: 'Sign in · UniRide Admin' };

const HIGHLIGHTS = [
  { icon: VerificationsIcon, label: 'Review rider verifications' },
  { icon: ReportsIcon, label: 'Resolve safety reports' },
  { icon: UsersIcon, label: 'Manage every account' },
] as const;

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel — the sidebar's own dark ground, so sign-in and the
          dashboard behind it read as one surface rather than two apps. */}
      <div className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden bg-shell px-12 py-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -left-20 size-96 rounded-full bg-primary/25 blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-16 size-[420px] rotate-12 opacity-[0.07]"
        >
          <Image src={logo} alt="" fill className="object-contain" />
        </div>

        <div className="relative flex items-center gap-2.5">
          <Image src={logo} alt="UniRide" className="size-8 shrink-0 rounded-lg" priority />
          <span className="text-[15px] font-semibold tracking-tight text-shell-foreground">
            UniRide
          </span>
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-shell-muted">
            Admin
          </span>
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-[30px] font-semibold leading-[1.15] tracking-tight text-shell-foreground">
            The UniRide control room.
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-shell-muted">
            Verify riders, act on reports, and manage every account from one
            place.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 text-shell-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="text-[13.5px] text-shell-foreground/90">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] text-shell-muted/60">UniRide Admin · v0.1</p>
      </div>

      {/* Sign-in panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Image src={logo} alt="UniRide" className="size-8 shrink-0 rounded-lg" priority />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              UniRide Admin
            </span>
          </div>

          <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-primary">
            Admin access
          </p>
          <h1 className="mb-1.5 text-[26px] font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mb-8 text-[13.5px] text-muted-foreground">
            Sign in with your admin or super admin account.
          </p>

          {/* useSearchParams needs a Suspense boundary to stay statically rendered. */}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <p className="mt-8 text-center text-[12.5px] text-muted-foreground">
            Need access? Contact your platform administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

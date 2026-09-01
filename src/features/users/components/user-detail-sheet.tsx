'use client';

import type { UserDetail } from '@/apikit/users';
import { SpinnerIcon } from '@/components/icons';
import { Can } from '@/components/shared/can';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { formatDate, roleLabel, trustBand } from '../utils';

/**
 * Everything known about one account, on the surface where it gets suspended.
 *
 * Suspension is the consequential action here, and the history is what makes it
 * a judgement rather than a guess — cancellations against completions, rating,
 * trust score, whether they are a verified rider. Deciding from a list row
 * alone is how the wrong account gets locked out.
 */
export function UserDetailSheet({
  user,
  isLoading,
  open,
  onOpenChange,
  onSuspend,
  isPending,
}: {
  user: UserDetail | undefined;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuspend: () => void;
  isPending: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        {isLoading || !user ? (
          <div className="grid flex-1 place-items-center">
            <SpinnerIcon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SheetHeader className="border-b border-border px-6 pb-5 pt-6">
              <div className="flex items-start gap-4">
                <UserAvatar name={user.name} size="lg" className="size-12 text-[15px]" />
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate text-[17px]">
                    {user.name}
                  </SheetTitle>
                  <SheetDescription className="truncate">
                    {user.email}
                  </SheetDescription>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Chip>{roleLabel(user.role)}</Chip>
                    {user.isSuspended ? (
                      <Chip tone="destructive">Suspended</Chip>
                    ) : null}
                    {!user.isEmailVerified ? (
                      <Chip tone="warning">Email unverified</Chip>
                    ) : null}
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {user.isSuspended ? (
                <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-destructive">
                    Suspended
                  </p>
                  <p className="mt-1 text-[13.5px] text-foreground">
                    {user.suspendedReason ?? 'No reason recorded.'}
                  </p>
                </div>
              ) : null}

              <Section title="Behaviour">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat
                    label="Completed"
                    value={String(user.stats?.ridesCompleted ?? 0)}
                  />
                  <Stat
                    label="Cancelled"
                    value={String(user.stats?.ridesCancelled ?? 0)}
                    // Cancellations are the number that changes a decision, so
                    // it is called out rather than sitting flat beside the rest.
                    tone={
                      (user.stats?.ridesCancelled ?? 0) >= 5
                        ? 'text-warning'
                        : undefined
                    }
                  />
                  <Stat
                    label="Rating"
                    value={
                      user.stats?.totalRatings
                        ? `${user.stats.averageRating.toFixed(1)}★`
                        : '—'
                    }
                    hint={
                      user.stats?.totalRatings
                        ? `${user.stats.totalRatings} ratings`
                        : 'no ratings yet'
                    }
                  />
                  <Stat
                    label="Trust"
                    value={String(user.stats?.trustScore ?? 50)}
                    hint={trustBand(user.stats?.trustScore ?? 50).label}
                    tone={trustBand(user.stats?.trustScore ?? 50).tone}
                  />
                </div>
              </Section>

              <Section title="Account">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
                  <Field label="University" value={user.university} />
                  <Field label="Student ID" value={user.studentIdNumber} />
                  <Field label="Phone" value={user.phone} />
                  <Field label="Gender" value={user.gender} />
                  <Field label="Joined" value={formatDate(user.createdAt)} />
                  <Field
                    label="Devices"
                    value={
                      user.devices.length
                        ? `${user.devices.length} registered`
                        : 'none'
                    }
                  />
                </dl>
              </Section>

              {user.riderProfile ? (
                <Section title="Rider profile">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
                    <Field
                      label="Vehicle"
                      value={`${user.riderProfile.vehicleMake} ${user.riderProfile.vehicleModel}`}
                    />
                    <Field
                      label="Plate"
                      value={user.riderProfile.licensePlate}
                    />
                    <Field
                      label="Verification"
                      value={user.riderProfile.verificationStatus}
                    />
                    <Field
                      label="Rejections"
                      value={String(user.riderProfile.rejectionCount)}
                    />
                  </dl>
                </Section>
              ) : null}

              <Section title="Activity">
                <dl className="grid grid-cols-3 gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
                  <Field
                    label="Rides as rider"
                    value={String(user._count.ridesAsRider)}
                  />
                  <Field
                    label="As passenger"
                    value={String(user._count.ridesAsPassenger)}
                  />
                  <Field
                    label="Ratings received"
                    value={String(user._count.ratingsReceived)}
                  />
                </dl>
              </Section>
            </div>

            <Can permission="users.suspend">
              <div className="border-t border-border px-6 py-4">
                {user.role === 'SUPER_ADMIN' ? (
                  <p className="text-center text-[13px] text-muted-foreground">
                    A super admin cannot be suspended.
                  </p>
                ) : (
                  <Button
                    variant={user.isSuspended ? 'default' : 'destructive'}
                    className="w-full"
                    onClick={onSuspend}
                    disabled={isPending}
                  >
                    {user.isSuspended ? 'Lift suspension' : 'Suspend account'}
                  </Button>
                )}
              </div>
            </Can>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <p className="text-[11.5px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 text-[19px] font-semibold tabular-nums leading-none',
          tone ?? 'text-foreground',
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11.5px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[11.5px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-[13.5px] text-foreground">
        {value ?? '—'}
      </dd>
    </div>
  );
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: 'destructive' | 'warning';
}) {
  return (
    <span
      className={cn(
        'rounded-md border px-2 py-0.5 text-[11.5px] font-medium',
        tone === 'destructive'
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : tone === 'warning'
            ? 'border-warning/40 bg-warning/10 text-warning'
            : 'border-border bg-secondary text-muted-foreground',
      )}
    >
      {children}
    </span>
  );
}

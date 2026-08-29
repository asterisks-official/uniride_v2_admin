'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import type { Verification } from '@/apikit/verifications';
import { CheckIcon, CloseIcon, SpinnerIcon } from '@/components/icons';
import { Can } from '@/components/shared/can';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { useDocumentUrl } from '../hooks/use-document-url';
import { formatDate, initials, waitingFor } from '../utils';

import { AttemptsMeter } from './attempts-meter';

/**
 * The whole application on one surface.
 *
 * Laid out around the question the reviewer is actually answering: *is this the
 * same person, and is this a real vehicle*. So the selfie sits beside the two
 * identity documents at a size you can judge, and everything else — vehicle
 * details, dates — is secondary and reads as such.
 */
export function VerificationDetailSheet({
  verification,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onUnblock,
  isPending,
}: {
  verification: Verification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  onUnblock: () => void;
  isPending: boolean;
}) {
  if (!verification) return null;

  const isPendingReview = verification.verificationStatus === 'PENDING';
  const isBlocked =
    verification.verificationStatus === 'REJECTED' &&
    verification.rejectionCount >= 3;
  const waiting = waitingFor(verification.createdAt);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <SheetHeader className="shrink-0 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-wash text-sm font-semibold text-primary">
              {initials(verification.user.name)}
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate text-[17px]">
                {verification.user.name}
              </SheetTitle>
              <SheetDescription className="truncate text-[12.5px]">
                {verification.user.email}
                {verification.user.university
                  ? ` · ${verification.user.university}`
                  : null}
              </SheetDescription>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Meta label="Submitted" value={formatDate(verification.createdAt)} />
            {isPendingReview ? (
              <Meta
                label="Waiting"
                value={waiting.label}
                tone={waiting.days >= 3 ? 'warning' : undefined}
              />
            ) : null}
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                Attempts
              </div>
              <div className="mt-1">
                <AttemptsMeter used={verification.rejectionCount} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <Section
            title="Is this the same person?"
            hint={
              verification.faceVerifiedAt
                ? `Liveness check passed ${formatDate(verification.faceVerifiedAt)} — the selfie was captured live, not uploaded.`
                : 'No liveness check on file. This application predates face verification, so the selfie cannot be trusted as live.'
            }
          >
            <div className="grid grid-cols-3 gap-3">
              <Document
                label="Face check"
                url={verification.selfieUrl}
                primary
              />
              <Document label="Licence" url={verification.licenseDocUrl} />
              <Document label="Student ID" url={verification.studentIdDocUrl} />
            </div>
          </Section>

          <Section title="The vehicle">
            <div className="grid grid-cols-2 gap-3">
              <Document label="Vehicle" url={verification.vehiclePhotoUrl} />
              <Document
                label="Number plate"
                url={verification.licensePlatePhotoUrl}
              />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
              <Field label="Type" value={verification.vehicleType} />
              <Field
                label="Make & model"
                value={`${verification.vehicleMake} ${verification.vehicleModel}`}
              />
              <Field label="Year" value={String(verification.vehicleYear)} />
              <Field label="Colour" value={verification.vehicleColor} />
              <Field
                label="Plate"
                value={verification.licensePlate}
                mono
              />
            </dl>
          </Section>

          {verification.adminNote ? (
            <Section title="Last reason given">
              <p className="rounded-xl border border-warning/30 bg-warning-wash px-4 py-3 text-[13.5px] leading-relaxed text-foreground">
                {verification.adminNote}
              </p>
            </Section>
          ) : null}
        </div>

        {isBlocked ? (
          <Can permission="verifications.decide">
            <footer className="shrink-0 space-y-3 border-t border-border bg-card px-6 py-4">
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                This account is blocked. Its email, student ID and phone number
                cannot register again until the block is lifted.
              </p>
              <button
                type="button"
                onClick={onUnblock}
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 px-4 py-2.5 text-[13.5px] font-medium text-destructive transition-colors hover:bg-destructive-wash disabled:opacity-50"
              >
                {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
                Unblock account
              </button>
            </footer>
          </Can>
        ) : isPendingReview ? (
          <Can permission="verifications.decide">
            <footer className="flex shrink-0 gap-3 border-t border-border bg-card px-6 py-4">
              <button
                type="button"
                onClick={onReject}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-[13.5px] font-medium text-foreground transition-colors hover:border-destructive/50 hover:bg-destructive-wash hover:text-destructive disabled:opacity-50"
              >
                <CloseIcon className="size-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={onApprove}
                disabled={isPending}
                className="flex flex-[1.4] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-deep disabled:opacity-50"
              >
                {isPending ? (
                  <SpinnerIcon className="size-4 animate-spin" />
                ) : (
                  <CheckIcon className="size-4" />
                )}
                Approve rider
              </button>
            </footer>
          </Can>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Meta({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'warning';
}) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          'mt-1 text-[13px] font-medium',
          tone === 'warning' ? 'text-warning' : 'text-foreground',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7 last:mb-0">
      <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
      {hint ? (
        <p className="mb-3 mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : (
        <div className="mb-3" />
      )}
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          'mt-0.5 text-[13.5px] font-medium capitalize text-foreground',
          mono && 'font-mono uppercase tracking-wide',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Document({
  label,
  url,
  primary = false,
}: {
  label: string;
  /** As stored on the application. Not fetchable on its own — see useDocumentUrl. */
  url: string | null;
  primary?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const { url: signedUrl, isLoading, isError } = useDocumentUrl(url);

  // The signature is refreshed while the sheet stays open, so a load that
  // failed against an expired URL must not stay failed against the new one --
  // otherwise the tile is stuck on "could not load" for the rest of the review.
  useEffect(() => setFailed(false), [signedUrl]);

  // Four states, and the reviewer has to be able to tell them apart: no
  // document was ever uploaded, one exists and is being signed, one exists and
  // could not be read, or one is ready. Collapsing the middle two into a
  // broken-image icon is what made this panel unusable.
  const showImage = Boolean(signedUrl) && !failed;
  const message = !url
    ? 'Not provided'
    : isLoading
      ? 'Loading…'
      : isError
        ? 'No access'
        : 'Could not load';

  return (
    <figure className="space-y-2">
      <div
        className={cn(
          'relative aspect-[4/5] overflow-hidden rounded-xl border bg-secondary',
          primary ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border',
        )}
      >
        {showImage ? (
          <a
            href={signedUrl as string}
            target="_blank"
            rel="noreferrer"
            className="group block size-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Open full size"
          >
            {/* Unoptimized on purpose: routing private identity documents
                through this server's image optimizer would cache them on the
                panel's own infrastructure. */}
            <Image
              src={signedUrl as string}
              alt={label}
              fill
              unoptimized
              sizes="240px"
              onError={() => setFailed(true)}
              className="object-cover transition-transform duration-200 group-hover:scale-[1.04]"
            />
          </a>
        ) : (
          <div className="grid size-full place-items-center px-3 text-center">
            <span className="text-[11.5px] leading-snug text-muted-foreground">
              {message}
            </span>
          </div>
        )}
      </div>
      <figcaption
        className={cn(
          'text-[11.5px] font-medium',
          primary ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {label}
      </figcaption>
    </figure>
  );
}

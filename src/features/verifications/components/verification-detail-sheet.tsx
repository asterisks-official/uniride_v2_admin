'use client';

import Image from 'next/image';

import type { Verification } from '@/apikit/verifications';
import { CheckIcon, SpinnerIcon } from '@/components/icons';
import { Can } from '@/components/shared/can';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { attemptsLeft, formatDate } from '../utils';

/**
 * The whole application on one surface.
 *
 * The selfie is placed first and next to the two identity documents rather than
 * in a row of thumbnails, because the decision the reviewer is actually making
 * is "is this the same person" — the layout should put those three side by side.
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
  const left = attemptsLeft(verification);
  // Out of attempts on a rejected application means the account is banned and
  // its email, student ID and phone are blocklisted.
  const isBlocked = verification.verificationStatus === 'REJECTED' && left === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{verification.user.name}</SheetTitle>
          <SheetDescription>
            {verification.user.email}
            {verification.user.university
              ? ` · ${verification.user.university}`
              : null}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 py-6">
          <section>
            <SectionLabel>Identity</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <DocumentTile
                label="Face check"
                url={verification.selfieUrl}
                highlight
              />
              <DocumentTile label="Licence" url={verification.licenseDocUrl} />
              <DocumentTile
                label="Student ID"
                url={verification.studentIdDocUrl}
              />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {verification.faceVerifiedAt
                ? `Liveness check passed ${formatDate(verification.faceVerifiedAt)}. Compare it against both documents.`
                : 'No liveness check on file — this application predates face verification.'}
            </p>
          </section>

          <section>
            <SectionLabel>Vehicle</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <DocumentTile
                label="Vehicle"
                url={verification.vehiclePhotoUrl}
              />
              <DocumentTile
                label="Number plate"
                url={verification.licensePlatePhotoUrl}
              />
            </div>
            <dl className="mt-4 divide-y rounded-lg border bg-white text-sm">
              <Row label="Type" value={verification.vehicleType} />
              <Row
                label="Make & model"
                value={`${verification.vehicleMake} ${verification.vehicleModel}`}
              />
              <Row label="Year" value={String(verification.vehicleYear)} />
              <Row label="Colour" value={verification.vehicleColor} />
              <Row label="Plate" value={verification.licensePlate} />
            </dl>
          </section>

          <section>
            <SectionLabel>Application</SectionLabel>
            <dl className="divide-y rounded-lg border bg-white text-sm">
              <Row label="Submitted" value={formatDate(verification.createdAt)} />
              <Row
                label="Attempts left"
                value={
                  <Badge variant={left <= 1 ? 'destructive' : 'secondary'}>
                    {left} of 3
                  </Badge>
                }
              />
              {verification.adminNote ? (
                <Row
                  label="Last reason"
                  value={
                    <span className="text-gray-600">{verification.adminNote}</span>
                  }
                />
              ) : null}
            </dl>
          </section>
        </div>

        {isBlocked ? (
          <Can permission="verifications.decide">
            <div className="sticky bottom-0 space-y-3 border-t bg-white py-4">
              <p className="text-sm text-gray-600">
                This account is blocked. Its email, student ID and phone cannot
                register again until it is lifted.
              </p>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
                onClick={onUnblock}
                disabled={isPending}
              >
                {isPending ? (
                  <SpinnerIcon className="size-4 animate-spin" />
                ) : null}
                Unblock account
              </Button>
            </div>
          </Can>
        ) : isPendingReview ? (
          <Can permission="verifications.decide">
            <div className="sticky bottom-0 flex gap-3 border-t bg-white py-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onReject}
                disabled={isPending}
              >
                Reject
              </Button>
              <Button
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                onClick={onApprove}
                disabled={isPending}
              >
                {isPending ? (
                  <SpinnerIcon className="size-4 animate-spin" />
                ) : (
                  <CheckIcon className="size-4" />
                )}
                Approve
              </Button>
            </div>
          </Can>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </h3>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function DocumentTile({
  label,
  url,
  highlight = false,
}: {
  label: string;
  url: string | null;
  highlight?: boolean;
}) {
  return (
    <figure className="space-y-1.5">
      <div
        className={
          highlight
            ? 'relative aspect-square overflow-hidden rounded-lg border-2 border-blue-400 bg-gray-100'
            : 'relative aspect-square overflow-hidden rounded-lg border bg-gray-100'
        }
      >
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="block size-full">
            {/* Unoptimized: these are CDN documents, not site assets, and
                routing them through the image optimizer would proxy private
                identity documents through this server. */}
            <Image
              src={url}
              alt={label}
              fill
              unoptimized
              sizes="200px"
              className="object-cover transition-transform hover:scale-105"
            />
          </a>
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-gray-400">
            Not provided
          </div>
        )}
      </div>
      <figcaption className="text-xs font-medium text-gray-600">
        {label}
      </figcaption>
    </figure>
  );
}

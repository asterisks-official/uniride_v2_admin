import { MAX_REJECTIONS, type Verification } from '@/apikit/verifications';

/** Resubmissions left before the account is blocked for good. */
export function attemptsLeft(verification: Verification): number {
  return Math.max(0, MAX_REJECTIONS - verification.rejectionCount);
}

/**
 * True when rejecting now is the decision that blocks the account and
 * blocklists the applicant's email, student ID and phone permanently.
 */
export function isFinalRejection(verification: Verification): boolean {
  return attemptsLeft(verification) <= 1;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function vehicleLabel(verification: Verification): string {
  return `${verification.vehicleMake} ${verification.vehicleModel} · ${verification.licensePlate}`;
}

/**
 * How long this has been waiting, in the words a reviewer triages by.
 *
 * A queue is worked by urgency, and "4 days" answers that where a date makes
 * you do the arithmetic yourself.
 */
export function waitingFor(iso: string): { label: string; days: number } {
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 86_400_000,
  );
  if (days <= 0) return { label: 'Today', days: 0 };
  if (days === 1) return { label: '1 day', days };
  return { label: `${days} days`, days };
}

/** Initials for the avatar stand-in. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

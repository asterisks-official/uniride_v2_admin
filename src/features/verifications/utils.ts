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

import type { Paginated } from '../types';

export const VERIFICATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** Rejections allowed before the account is blocked outright. */
export const MAX_REJECTIONS = 3;

export interface VerificationApplicant {
  id: string;
  name: string;
  email: string;
  university: string | null;
  createdAt: string;
}

/** A rider profile as returned by `GET /admin/riders/pending`. */
export interface Verification {
  id: string;
  userId: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  licensePlate: string;
  licenseDocUrl: string;
  vehiclePhotoUrl: string;
  licensePlatePhotoUrl: string | null;
  studentIdDocUrl: string | null;
  selfieUrl: string | null;
  faceVerifiedAt: string | null;
  verificationStatus: VerificationStatus;
  adminNote: string | null;
  rejectionCount: number;
  reviewedAt: string | null;
  createdAt: string;
  user: VerificationApplicant;
}

export type VerificationList = Paginated<Verification, 'riders'>;

export interface VerificationsQuery {
  status?: VerificationStatus;
  page?: number;
  limit?: number;
}

/**
 * The backend expects `action`, not `status`, and `note`, not `adminNote` —
 * the project spec documents both incorrectly.
 */
export interface DecideVerificationPayload {
  userId: string;
  action: 'APPROVE' | 'REJECT';
  note?: string;
}

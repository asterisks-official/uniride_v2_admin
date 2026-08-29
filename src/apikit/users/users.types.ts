import type { Paginated } from '../types';

export const USER_ROLES = [
  'PASSENGER',
  'RIDER',
  'ADMIN',
  'SUPER_ADMIN',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface UserStats {
  ridesCompleted: number;
  ridesCancelled?: number;
  totalRatings?: number;
  averageRating: number;
  /** 0-100, starts at 50. */
  trustScore: number;
  totalEarnings?: string;
}

/** A row in the list. Deliberately narrower than the detail response. */
export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  university: string | null;
  isSuspended: boolean;
  suspendedReason: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  stats: UserStats | null;
}

export interface UserDevice {
  fcmToken: string;
  deviceType: string;
  updatedAt: string;
}

export interface RiderProfile {
  id: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  licensePlate: string;
  verificationStatus: string;
  rejectionCount: number;
  faceVerifiedAt: string | null;
  createdAt: string;
}

/** What `GET /admin/users/:id` adds on top of the row. */
export interface UserDetail extends Omit<UserRow, 'stats'> {
  phone: string | null;
  studentIdNumber: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  gender: string | null;
  activeMode?: string | null;
  updatedAt: string;
  deletedAt: string | null;
  stats: UserStats | null;
  riderProfile: RiderProfile | null;
  devices: UserDevice[];
  _count: {
    ridesAsRider: number;
    ridesAsPassenger: number;
    ratingsReceived: number;
  };
}

export type UserList = Paginated<UserRow, 'users'>;

export interface UsersQuery {
  search?: string;
  role?: UserRole;
  isSuspended?: boolean;
  page?: number;
  limit?: number;
}

export interface SuspendUserPayload {
  id: string;
  /** true suspends, false lifts it. */
  suspend: boolean;
  reason?: string;
}

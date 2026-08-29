import type { Paginated } from '../types';

/// Ordered as a ride actually progresses, so tabs read left to right as a
/// lifecycle rather than an alphabetised set.
export const RIDE_STATUSES = [
  'SEARCHING',
  'MATCHED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
] as const;
export type RideStatus = (typeof RIDE_STATUSES)[number];

export type RideType = 'OFFER' | 'REQUEST';
export type RideMode = 'INSTANT' | 'SCHEDULED';

export interface RideParty {
  id: string;
  name: string;
  email: string;
}

export interface Ride {
  id: string;
  type: RideType;
  mode: RideMode;
  status: RideStatus;
  originAddress: string;
  destAddress: string;
  /** Decimal on the wire, so a string rather than a number. */
  fare: string;
  seatsAvailable: number;
  genderPref: string;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  /** Null until someone takes the other side of the ride. */
  rider: RideParty | null;
  passenger: RideParty | null;
}

export type RideList = Paginated<Ride, 'rides'>;

export interface RidesQuery {
  status?: RideStatus;
  page?: number;
  limit?: number;
}

import type { RidesQuery } from './rides.types';

export const rideKeys = {
  all: ['rides'] as const,
  lists: () => [...rideKeys.all, 'list'] as const,
  list: (query: RidesQuery) => [...rideKeys.lists(), query] as const,
};

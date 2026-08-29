'use client';

import { useQuery } from '@tanstack/react-query';

import { getRides, rideKeys, type RidesQuery } from '@/apikit/rides';

export function useRides(query: RidesQuery) {
  return useQuery({
    queryKey: rideKeys.list(query),
    queryFn: async () => (await getRides(query)).data.data,
    // Rides in flight change without anyone touching this screen, so the list
    // goes stale on its own rather than only on navigation.
    refetchInterval: 30_000,
  });
}

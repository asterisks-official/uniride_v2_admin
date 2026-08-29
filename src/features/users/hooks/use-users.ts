'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getUserById,
  getUsers,
  suspendUser,
  userKeys,
  type SuspendUserPayload,
  type UsersQuery,
} from '@/apikit/users';

export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: async () => (await getUsers(query)).data.data,
  });
}

/** Only fetched once a row is opened — the list already carries enough to scan. */
export function useUser(id: string | null) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ''),
    queryFn: async () => (await getUserById(id as string)).data.data,
    enabled: Boolean(id),
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SuspendUserPayload) =>
      (await suspendUser(payload)).data.data,
    onSuccess: (_result, variables) => {
      toast.success(
        variables.suspend ? 'Account suspended.' : 'Suspension lifted.',
      );
      // Both the row and the open detail are now stale.
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
    // Failures are toasted by the APIKit interceptor.
  });
}

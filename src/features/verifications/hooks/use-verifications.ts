'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  decideVerification,
  getVerifications,
  unblockRider,
  verificationKeys,
  type DecideVerificationPayload,
  type VerificationsQuery,
} from '@/apikit/verifications';

export function useVerifications(query: VerificationsQuery) {
  return useQuery({
    queryKey: verificationKeys.list(query),
    queryFn: async () => (await getVerifications(query)).data.data,
  });
}

export function useDecideVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DecideVerificationPayload) =>
      (await decideVerification(payload)).data.data,
    onSuccess: (_result, variables) => {
      toast.success(
        variables.action === 'APPROVE'
          ? 'Rider approved.'
          : 'Application rejected.',
      );
      // Every tab's count changes when a decision lands, so invalidate the
      // whole list namespace rather than the current filter.
      void queryClient.invalidateQueries({ queryKey: verificationKeys.lists() });
    },
    // Failures are toasted by the APIKit interceptor.
  });
}

export function useUnblockRider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => (await unblockRider(userId)).data.data,
    onSuccess: () => {
      toast.success('Account unblocked. They can apply again.');
      void queryClient.invalidateQueries({ queryKey: verificationKeys.lists() });
    },
  });
}

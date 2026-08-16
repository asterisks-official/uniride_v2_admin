'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  decideVerification,
  getVerifications,
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

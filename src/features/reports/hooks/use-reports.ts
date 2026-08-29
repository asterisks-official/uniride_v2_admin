'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getReports,
  reportKeys,
  resolveReport,
  type ReportsQuery,
  type ResolveReportPayload,
} from '@/apikit/reports';

export function useReports(query: ReportsQuery) {
  return useQuery({
    queryKey: reportKeys.list(query),
    queryFn: async () => (await getReports(query)).data.data,
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ResolveReportPayload) =>
      (await resolveReport(payload)).data.data,
    onSuccess: (_result, variables) => {
      toast.success(
        variables.action === 'RESOLVE'
          ? 'Report resolved.'
          : 'Report dismissed.',
      );
      // A decision moves the row between tabs, so every list is stale, not
      // just the one on screen.
      void queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
    // Failures are toasted by the APIKit interceptor.
  });
}

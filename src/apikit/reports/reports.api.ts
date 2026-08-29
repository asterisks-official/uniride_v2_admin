import type { AxiosResponse } from 'axios';

import { apiClient } from '../client';
import type { ApiResponse } from '../types';

import type { Report, ReportList, ReportsQuery, ResolveReportPayload } from './reports.types';

export function getReports(
  query: ReportsQuery = {},
): Promise<AxiosResponse<ApiResponse<ReportList>>> {
  return apiClient.get('/admin/reports', { params: query });
}

/** Resolve or dismiss. Both close the report; only the meaning differs. */
export function resolveReport({
  id,
  ...body
}: ResolveReportPayload): Promise<AxiosResponse<ApiResponse<Report>>> {
  return apiClient.patch(`/admin/reports/${id}`, body);
}

import type { AxiosResponse } from 'axios';

import { apiClient } from '../client';
import type { ApiResponse } from '../types';

import type {
  DecideVerificationPayload,
  Verification,
  VerificationList,
  VerificationsQuery,
} from './verifications.types';

export function getVerifications(
  query: VerificationsQuery = {},
): Promise<AxiosResponse<ApiResponse<VerificationList>>> {
  return apiClient.get('/admin/riders/pending', { params: query });
}

/** Approve or reject. Keyed on the applicant's userId, not the profile id. */
export function decideVerification({
  userId,
  ...body
}: DecideVerificationPayload): Promise<AxiosResponse<ApiResponse<Verification>>> {
  return apiClient.patch(`/admin/riders/${userId}/verify`, body);
}

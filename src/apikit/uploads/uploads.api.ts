import type { AxiosResponse } from 'axios';

import { apiClient } from '../client';
import type { ApiResponse } from '../types';

import type { UploadView } from './uploads.types';

/**
 * Exchanges a stored document URL (or a bare key) for a short-lived signed URL
 * that actually resolves.
 *
 * The uploads bucket is private and only writes were ever presigned, so the
 * `licenseDocUrl` on an application answers 403 when fetched directly.
 */
export function getUploadView(
  key: string,
): Promise<AxiosResponse<ApiResponse<UploadView>>> {
  return apiClient.get('/uploads/view', { params: { key } });
}

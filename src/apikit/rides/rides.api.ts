import type { AxiosResponse } from 'axios';

import { apiClient } from '../client';
import type { ApiResponse } from '../types';

import type { RideList, RidesQuery } from './rides.types';

export function getRides(
  query: RidesQuery = {},
): Promise<AxiosResponse<ApiResponse<RideList>>> {
  return apiClient.get('/admin/rides', { params: query });
}

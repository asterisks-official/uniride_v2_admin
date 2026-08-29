import type { AxiosResponse } from 'axios';

import { apiClient } from '../client';
import type { ApiResponse } from '../types';

import type {
  SuspendUserPayload,
  UserDetail,
  UserList,
  UsersQuery,
} from './users.types';

export function getUsers(
  query: UsersQuery = {},
): Promise<AxiosResponse<ApiResponse<UserList>>> {
  return apiClient.get('/admin/users', { params: query });
}

export function getUserById(
  id: string,
): Promise<AxiosResponse<ApiResponse<UserDetail>>> {
  return apiClient.get(`/admin/users/${id}`);
}

/** Suspends or lifts a suspension. The same endpoint does both. */
export function suspendUser({
  id,
  ...body
}: SuspendUserPayload): Promise<AxiosResponse<ApiResponse<UserDetail>>> {
  return apiClient.patch(`/admin/users/${id}/suspend`, body);
}

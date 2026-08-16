import axios, { AxiosError, type AxiosInstance } from 'axios';
import { toast } from 'sonner';

import type { ApiError } from './types';

/**
 * The only network client the browser uses.
 *
 * `baseURL` is `/api` — this app's own proxy — so the real backend origin is
 * never present in a client bundle. There is no auth header here either: the
 * token is attached server-side by the proxy from an httpOnly cookie.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

/** Statuses the UI is expected to render itself rather than toast. */
const SILENT_STATUSES = new Set([401, 403, 404]);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? 0;

    const message =
      error.response?.data?.message ??
      (error.code === 'ECONNABORTED'
        ? 'The server took too long to respond.'
        : status === 0
          ? 'Could not reach the server.'
          : 'Something went wrong.');

    // Toasting centrally is what keeps every component from growing its own
    // catch block. 401/403/404 are excluded because a screen showing "signed
    // out" or an empty state should not also fire a toast about it.
    if (!SILENT_STATUSES.has(status)) {
      toast.error(message);
    }

    if (status === 401 && typeof window !== 'undefined') {
      // The session died — refresh failed, or the cookie was cleared.
      window.location.href = '/login';
    }

    const normalized: ApiError = { status, message };
    return Promise.reject(normalized);
  },
);

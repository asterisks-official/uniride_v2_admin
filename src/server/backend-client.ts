import 'server-only';

import axios, { AxiosError, type AxiosInstance } from 'axios';

import { env } from '@/config/env';

/**
 * The only axios instance that knows the real backend origin. Lives on the
 * server so route handlers stay three lines and no handler has to remember to
 * attach auth or normalise an error.
 */
export const backendClient: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
  // Let 4xx through to the caller so a handler can forward the backend's own
  // status and message instead of collapsing everything into a 500.
  validateStatus: () => true,
});

/** Shape every route handler returns, success or failure. */
export interface NormalizedError {
  status: number;
  message: string;
}

/**
 * The backend's error envelope is `{ statusCode, error, message: string[] }`,
 * while transport failures have no envelope at all. Both become one shape so
 * the client interceptor has a single thing to read.
 */
export function normalizeError(error: unknown): NormalizedError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string | string[] }>;

    if (!axiosError.response) {
      const timedOut = axiosError.code === 'ECONNABORTED';
      return {
        status: 504,
        message: timedOut
          ? 'The server took too long to respond.'
          : 'Could not reach the server.',
      };
    }

    return {
      status: axiosError.response.status,
      message: messageFrom(axiosError.response.data),
    };
  }

  return { status: 500, message: 'Something went wrong.' };
}

/** Pulls a single human-readable line out of a backend response body. */
export function messageFrom(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const { message } = data as { message?: string | string[] };
    if (Array.isArray(message) && message.length > 0) return message[0];
    if (typeof message === 'string') return message;
  }
  return 'Something went wrong.';
}

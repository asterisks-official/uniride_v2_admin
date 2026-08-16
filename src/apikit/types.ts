/** The backend wraps every success in `{ data, meta }`. */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** List endpoints return the collection alongside its pagination block. */
export type Paginated<T, K extends string> = {
  [P in K]: T[];
} & {
  pagination: PaginationMeta;
};

/**
 * What every APIKit rejection is normalised to, so callers never branch on
 * axios internals.
 */
export interface ApiError {
  status: number;
  message: string;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
}

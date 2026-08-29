'use client';

import { useQuery } from '@tanstack/react-query';

import { getUploadView, uploadKeys } from '@/apikit/uploads';

/** How long a signed URL lasts, per the backend's PRESIGN_TTL_SECONDS. */
const SIGNED_URL_TTL_MS = 300_000;

/**
 * Refreshed comfortably inside the TTL rather than at it.
 *
 * A reviewer reads an application for minutes, not seconds — long enough for a
 * five-minute URL to die while the sheet is still open, which would turn every
 * document into "Could not load" halfway through a decision. Re-signing in the
 * background keeps the tiles alive for as long as the sheet is.
 */
const REFRESH_MS = SIGNED_URL_TTL_MS - 60_000;

/**
 * Turns a stored document URL into one that actually loads.
 *
 * The uploads bucket is private, so `licenseDocUrl` and friends answer 403 when
 * fetched directly; the backend signs a short-lived read on request. Passing
 * null (a document that was never provided) skips the request entirely.
 */
export function useDocumentUrl(storedUrl: string | null) {
  const query = useQuery({
    queryKey: uploadKeys.view(storedUrl ?? ''),
    queryFn: async () => (await getUploadView(storedUrl as string)).data.data,
    enabled: Boolean(storedUrl),
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
    // A 403 means this reviewer may not read the document, and a retry will
    // return 403 again — three more round trips would only delay the message.
    retry: false,
  });

  return {
    url: query.data?.viewUrl ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

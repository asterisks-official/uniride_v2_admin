/** What the backend returns for a signed read of one uploaded object. */
export interface UploadView {
  /** Short-lived S3 URL. Expires — see `expiresIn`. */
  viewUrl: string;
  /** Seconds the URL stays valid, from the moment it was issued. */
  expiresIn: number;
}

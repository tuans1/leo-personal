/**
 * S3 API response types — mirror backend contract.
 * No `any`; used for typed responses from BE.
 */

export interface UploadResult {
  key: string;
  bucket: string;
  etag?: string;
}

export interface PresignedUrlResult {
  url: string;
  expiresIn: number;
}

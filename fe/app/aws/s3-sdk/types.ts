/**
 * S3 SDK (FE) types. Temp credentials response mirrors backend.
 */

export interface TempCredentialsResponse {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
  region: string;
  bucket: string;
}

export interface UploadResultSdk {
  key: string;
  bucket: string;
  etag?: string;
}

/** Response from GET presigned-upload-url — use url to PUT file directly to S3. */
export interface PresignedUploadUrlUploadResult {
  url: string;
  expiresIn: number;
  bucket: string;
}

/**
 * S3 API path and config constants.
 * Avoids magic strings; align with backend routes.
 */

export const AWS_S3_PATH = "aws/s3" as const;

export enum S3ApiPath {
  Upload = "aws/s3/upload",
  File = "aws/s3/file",
  PresignedUrl = "aws/s3/presigned-url",
}

/** Default presigned URL expiry in seconds (1 hour). Match backend default. */
export const PRESIGNED_URL_DEFAULT_EXPIRES_IN = 3600;

/** Min/max presigned expiry (seconds) — backend enforces 60–86400. */
export const PRESIGNED_URL_MIN_EXPIRES_IN = 60;
export const PRESIGNED_URL_MAX_EXPIRES_IN = 86400;

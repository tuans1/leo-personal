/**
 * S3 SDK route: path to backend temp-credentials endpoint.
 */

export const AWS_S3_TEMP_CREDENTIALS_PATH = "aws/s3/temp-credentials" as const;

export const AWS_S3_PRESIGNED_UPLOAD_URL_PATH =
  "aws/s3/presigned-upload-url" as const;

/** Default presigned URL expiry in seconds (1 hour). */
export const PRESIGNED_URL_DEFAULT_EXPIRES_IN = 3600;

/** Refresh credentials when less than this many seconds remain. */
export const CREDENTIALS_REFRESH_BUFFER_SECONDS = 5 * 60;

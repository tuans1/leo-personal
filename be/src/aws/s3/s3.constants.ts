/**
 * Config keys for S3 (used with ConfigService.get).
 * Avoids magic strings when reading env.
 */
export const S3ConfigKey = {
  Region: process.env.REGION,
  Bucket: process.env.BUCKET,
  AccessKey: process.env.ACCESS_KEY,
  SecretAccessKey: process.env.SECRET_ACCESS_KEY,
}

/** Default presigned URL expiry in seconds (1 hour). */
export const S3_DEFAULT_PRESIGNED_EXPIRES_IN = 3600;

/** Max presigned URL expiry in seconds (24 hours). */
export const S3_MAX_PRESIGNED_EXPIRES_IN = 86400;

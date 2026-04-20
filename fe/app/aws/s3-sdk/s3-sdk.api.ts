import { request } from "@/app/lib/api/client";
import {
  AWS_S3_PRESIGNED_UPLOAD_URL_PATH,
  AWS_S3_TEMP_CREDENTIALS_PATH,
  PRESIGNED_URL_DEFAULT_EXPIRES_IN,
} from "@/app/aws/s3-sdk/constants";
import type {
  PresignedUploadUrlUploadResult,
  TempCredentialsResponse,
} from "@/app/aws/s3-sdk/types";

/**
 * Fetch temporary credentials from backend for use with S3Client in the browser.
 */
export async function getS3TempCredentials(): Promise<TempCredentialsResponse> {
  return request<TempCredentialsResponse>(AWS_S3_TEMP_CREDENTIALS_PATH, {
    method: "GET",
  });
}

export interface GetPresignedUploadUrlOptions {
  expiresIn?: number;
  contentType?: string;
}

/**
 * Get presigned PUT URL from backend; then use uploadViaPresignedUrl to PUT file directly to S3.
 */
export async function getPresignedUploadUrl(
  key: string,
  options?: GetPresignedUploadUrlOptions
): Promise<PresignedUploadUrlUploadResult> {
  const query: Record<string, string> = { key };
  if (options?.expiresIn != null) {
    query.expiresIn = String(options.expiresIn);
  }
  if (options?.contentType != null && options.contentType !== "") {
    query.contentType = options.contentType;
  }
  return request<PresignedUploadUrlUploadResult>(
    AWS_S3_PRESIGNED_UPLOAD_URL_PATH,
    { method: "GET", query }
  );
}

export interface UploadViaPresignedUrlResult {
  key: string;
  bucket: string;
}

/**
 * PUT file directly to S3 using presigned URL. File does not go through backend.
 */
export async function uploadViaPresignedUrl(
  file: File,
  key: string,
  presignedResult: { url: string; bucket: string }
): Promise<UploadViaPresignedUrlResult> {
  const response = await fetch(presignedResult.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Upload failed: ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`
    );
  }
  return { key, bucket: presignedResult.bucket };
}

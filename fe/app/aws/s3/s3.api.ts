import { multipartFormData, request } from "@/app/lib/api/client";
import {
  PRESIGNED_URL_DEFAULT_EXPIRES_IN,
  S3ApiPath,
} from "@/app/aws/s3/constants";
import type { PresignedUrlResult, UploadResult } from "@/app/aws/s3/types";

export interface UploadS3Options {
  key?: string;
  prefix?: string;
}

/**
 * Upload file to S3 via backend. Uses form-data field "file"; key or prefix as query.
 */
export async function uploadS3(
  file: File,
  options?: UploadS3Options
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const query: Record<string, string> = {};
  if (options?.key?.trim()) {
    query.key = options.key.trim();
  } else if (options?.prefix?.trim()) {
    query.prefix = options.prefix.trim();
  }

  return multipartFormData<UploadResult>(S3ApiPath.Upload, formData, query);
}

/**
 * Get presigned URL for a key. Key is encoded for query. expiresIn optional (60–86400).
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = PRESIGNED_URL_DEFAULT_EXPIRES_IN
): Promise<PresignedUrlResult> {
  const query: Record<string, string> = {
    key,
    expiresIn: String(expiresIn),
  };
  return request<PresignedUrlResult>(S3ApiPath.PresignedUrl, {
    method: "GET",
    query,
  });
}

/**
 * Delete file by key. Key is encoded in path (e.g. slashes as %2F).
 */
export async function deleteS3File(key: string): Promise<void> {
  const encodedKey = encodeURIComponent(key);
  await request<void>(`${S3ApiPath.File}/${encodedKey}`, {
    method: "DELETE",
  });
}

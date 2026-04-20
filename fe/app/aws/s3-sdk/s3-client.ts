import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CREDENTIALS_REFRESH_BUFFER_SECONDS } from "@/app/aws/s3-sdk/constants";
import type { TempCredentialsResponse } from "@/app/aws/s3-sdk/types";

export interface S3ClientState {
  client: S3Client;
  bucket: string;
  region: string;
  expirationMs: number;
}

/**
 * Build S3Client and bucket from temp credentials response.
 * Caller is responsible for caching and refreshing when expiration approaches.
 */
export function createS3ClientFromCreds(creds: TempCredentialsResponse): S3ClientState {
  const client = new S3Client({
    region: creds.region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
    },
  });
  const expirationMs = new Date(creds.expiration).getTime();
  return {
    client,
    bucket: creds.bucket,
    region: creds.region,
    expirationMs,
  };
}

/**
 * Returns true if state is still valid (not within refresh buffer of expiration).
 */
export function isCredentialStateValid(state: S3ClientState): boolean {
  const now = Date.now();
  const bufferMs = CREDENTIALS_REFRESH_BUFFER_SECONDS * 1000;
  return state.expirationMs - now > bufferMs;
}

export interface UploadWithSdkInput {
  client: S3Client;
  bucket: string;
  key: string;
  file: File;
}

export interface UploadWithSdkResult {
  key: string;
  bucket: string;
  etag?: string;
}

export async function uploadWithSdk(input: UploadWithSdkInput): Promise<UploadWithSdkResult> {
  const body = await input.file.arrayBuffer();
  const command = new PutObjectCommand({
    Bucket: input.bucket,
    Key: input.key,
    Body: new Uint8Array(body),
    ContentType: input.file.type || undefined,
  });
  const output = await input.client.send(command);
  return {
    key: input.key,
    bucket: input.bucket,
    etag: output.ETag,
  };
}

export async function deleteWithSdk(
  client: S3Client,
  bucket: string,
  key: string
): Promise<void> {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await client.send(command);
}

export async function getPresignedUrlWithSdk(
  client: S3Client,
  bucket: string,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn });
}

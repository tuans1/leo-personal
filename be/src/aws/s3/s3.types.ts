import type { Readable } from 'stream';

/** Shape of file from multer (FileInterceptor) when using memory storage. */
export interface UploadedFilePayload {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface UploadResult {
  key: string;
  bucket: string;
  etag?: string;
}

export interface PresignedUrlResult {
  url: string;
  expiresIn: number;
}

/** Response for GET /aws/s3/presigned-upload-url — URL for client to PUT file directly to S3. */
export interface PresignedUploadUrlResult {
  url: string;
  expiresIn: number;
  bucket: string;
}

export interface GetFileStreamResult {
  body: Readable;
  contentType?: string;
  contentLength?: number;
}

export interface DeleteResult {
  deleted: true;
}

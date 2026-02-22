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

export interface GetFileStreamResult {
  body: Readable;
  contentType?: string;
  contentLength?: number;
}

export interface DeleteResult {
  deleted: true;
}

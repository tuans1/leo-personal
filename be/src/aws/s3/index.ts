export { S3Module } from './s3.module';
export { S3Service } from './s3.service';
export {
  S3ConfigKey,
  S3_DEFAULT_PRESIGNED_EXPIRES_IN,
  S3_MAX_PRESIGNED_EXPIRES_IN,
} from './s3.constants';

export type {
  DeleteResult,
  GetFileStreamResult,
  PresignedUrlResult,
  UploadResult,
} from './s3.types';

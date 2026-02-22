import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3ConfigKey, S3_DEFAULT_PRESIGNED_EXPIRES_IN } from './s3.constants';
import type {
  DeleteResult,
  GetFileStreamResult,
  PresignedUrlResult,
  UploadResult,
} from './s3.types';

export interface UploadInput {
  key: string;
  body: Buffer;
  contentType?: string;
}

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('REGION');

    this.client = new S3Client({
      region,
    });

    const bucket = this.configService.get<string>('BUCKET');
    if (!bucket) {
      throw new Error(
        `S3 bucket is not configured. Set ${S3ConfigKey.Bucket} in env.`,
      );
    }
    this.bucket = bucket;
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    });

    const output = await this.client.send(command);

    return {
      key: input.key,
      bucket: this.bucket,
      etag: output.ETag,
    };
  }

  async getFileStream(key: string): Promise<GetFileStreamResult | null> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const output = await this.client.send(command);

    if (!output.Body) {
      return null;
    }

    return {
      body: output.Body as GetFileStreamResult['body'],
      contentType: output.ContentType,
      contentLength: output.ContentLength,
    };
  }

  async getPresignedUrl(
    key: string,
    expiresIn: number = S3_DEFAULT_PRESIGNED_EXPIRES_IN,
  ): Promise<PresignedUrlResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });
    return {
      url,
      expiresIn,
    };
  }

  async delete(key: string): Promise<DeleteResult> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);

    return { deleted: true };
  }
}

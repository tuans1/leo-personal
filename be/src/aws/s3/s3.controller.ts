import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MaxFileSizeValidator } from '@nestjs/common/pipes/file/max-file-size.validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3_MAX_PRESIGNED_EXPIRES_IN } from './s3.constants';
import { S3Service } from './s3.service';
import type { UploadedFilePayload } from './s3.types';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@Controller('aws/s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
        ],
      }),
    )
    file: UploadedFilePayload,
    @Query('key') key?: string,
    @Query('prefix') prefix?: string,
  ) {
    const effectiveKey = this.resolveUploadKey(key, prefix, file.originalname);
    if (!effectiveKey.trim()) {
      throw new BadRequestException(
        'Key or prefix + file name must be provided',
      );
    }

    const result = await this.s3Service.upload({
      key: effectiveKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    return result;
  }

  @Get('file/:key')
  async getFile(@Param('key') key: string) {
    const decodedKey = decodeURIComponent(key);
    if (!decodedKey.trim()) {
      throw new BadRequestException('Key is required');
    }

    const result = await this.s3Service.getFileStream(decodedKey);
    if (!result) {
      throw new NotFoundException(`File not found: ${decodedKey}`);
    }

    return new StreamableFile(result.body, {
      type: result.contentType,
      length: result.contentLength,
    });
  }

  @Get('presigned-url')
  async getPresignedUrl(
    @Query('key') key: string,
    @Query('expiresIn') expiresInStr?: string,
  ) {
    if (!key?.trim()) {
      throw new BadRequestException('Query "key" is required');
    }

    const decodedKey = decodeURIComponent(key);
    const expiresIn = expiresInStr
      ? Math.min(
        Math.max(60, parseInt(expiresInStr, 10)),
        S3_MAX_PRESIGNED_EXPIRES_IN,
      )
      : undefined;

    const result = await this.s3Service.getPresignedUrl(decodedKey, expiresIn);
    return result;
  }

  @Delete('file/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('key') key: string): Promise<void> {
    const decodedKey = decodeURIComponent(key);
    if (!decodedKey.trim()) {
      throw new BadRequestException('Key is required');
    }

    await this.s3Service.delete(decodedKey);
  }

  private resolveUploadKey(
    key: string | undefined,
    prefix: string | undefined,
    originalName: string,
  ): string {
    if (key?.trim()) {
      return key.trim();
    }
    if (prefix?.trim()) {
      const cleanPrefix = prefix.trim().replace(/\/$/, '');
      return cleanPrefix ? `${cleanPrefix}/${originalName}` : originalName;
    }
    return originalName;
  }
}

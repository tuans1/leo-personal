import {
  BadRequestException,
  Controller,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileService } from './file.service';
import type { CsvProductUploadResponse } from './file.types';

@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Post('products/csv-stream')
  async uploadProductsCsvStream(
    @Req() req: Request,
  ): Promise<CsvProductUploadResponse> {
    req.on('data', () => console.log('chunk'));
    req.on('end', () => console.log('done'));
    const contentType = req.headers['content-type'] ?? '';
    if (!String(contentType).toLowerCase().includes('multipart/form-data')) {
      throw new BadRequestException(
        'Content-Type phải là multipart/form-data.',
      );
    }
    const t0 = Date.now();
    this.logger.log(
      'POST products/csv-stream — bắt đầu nhận multipart stream trực tiếp',
    );
    const result =
      await this.fileService.importProductsFromMultipartRequest(req);
    this.logger.log(
      `POST products/csv-stream — xong trong ${Date.now() - t0}ms, inserted=${result.inserted}`,
    );
    return result;
  }
}

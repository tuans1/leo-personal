import {
  BadRequestException,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileUploadField, MAX_CSV_FILE_BYTES } from './file.constants';
import type {
  CsvMemoryUploadedFile,
  CsvProductUploadResponse,
} from './file.types';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * Chỉ cần `limits`: multer dùng **memory storage mặc định** khi không set `storage` / `dest`
 * (xem constructor trong package `multer`). Nhờ đó không phải `import` package `export =`
 * (Vite/ESLint hay báo `error` + cấm `require`).
 */
const csvFileInterceptorOptions: MulterOptions = {
  limits: { fileSize: MAX_CSV_FILE_BYTES },
  // storage: memoryStorage() -- default storage is memory storage
};

@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  /**
   * Multipart field name matches FE `file` and Next demo route.
   * Memory storage keeps a Buffer — OK for our max size (study: simple, not disk temp files).
   */
  @Post('products/csv')
  @UseInterceptors(
    FileInterceptor(FileUploadField.File, csvFileInterceptorOptions),
  )
  async uploadProductsCsv(
    @UploadedFile() file: CsvMemoryUploadedFile | undefined,
  ): Promise<CsvProductUploadResponse> {
    if (file == null) {
      throw new BadRequestException('Thiếu file (field "file").');
    }
    const lower = file.originalname.toLowerCase();
    if (!lower.endsWith('.csv')) {
      throw new BadRequestException('Chỉ chấp nhận file .csv');
    }
    if (!file.buffer) {
      throw new BadRequestException('Không đọc được nội dung file.');
    }
    const t0 = Date.now();
    this.logger.log(
      `POST products/csv — nhận file (multer), bắt đầu import: name=${file.originalname} size=${file.size} bytes`,
    );
    const result = await this.fileService.importProductsFromCsvBuffer(
      file.buffer,
      file.originalname,
      file.size,
    );
    this.logger.log(
      `POST products/csv — xong trong ${Date.now() - t0}ms, inserted=${result.inserted}`,
    );
    return result;
  }
}

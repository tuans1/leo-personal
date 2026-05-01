import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { parse } from 'csv-parse';
import busboy from 'busboy';
import type { IncomingHttpHeaders } from 'node:http';
import { PassThrough, pipeline } from 'node:stream';
import type { Request } from 'express';
import { DataSource } from 'typeorm';
import { Product } from '../../redis/cart/entities';
import {
  FileUploadField,
  MAX_CSV_FILE_BYTES,
  PRODUCT_INSERT_CHUNK_BYTES,
  PRODUCT_INSERT_CHUNK_SIZE,
  ProductCsvHeader,
} from './file.constants';
import type {
  CsvProductUploadResponse,
  CsvUploadStreamMeta,
} from './file.types';

/** PostgreSQL integer range (matches TypeORM `integer` on `Product.price`). */
const PG_INT_MIN = -2147483648;
const PG_INT_MAX = 2147483647;

/** PostgreSQL smallint range (matches `smallint` on `Product.quantity`). */
const PG_SMALLINT_MIN = -32768;
const PG_SMALLINT_MAX = 32767;

interface MultipartFileInfo {
  filename: string;
  mimeType: string;
}

interface MultipartFileStream extends NodeJS.ReadableStream {
  truncated?: boolean;
}

interface MultipartParser extends NodeJS.WritableStream {
  on(
    event: 'file',
    listener: (
      fieldName: string,
      stream: MultipartFileStream,
      info: MultipartFileInfo,
    ) => void,
  ): this;
  on(event: 'close', listener: () => void): this;
  on(event: 'error', listener: (error: unknown) => void): this;
}

type MultipartParserFactory = (config: {
  headers: IncomingHttpHeaders;
  limits: { files: number; fileSize: number };
}) => MultipartParser;

const createMultipartParser = busboy as unknown as MultipartParserFactory;

/** CSV cells are usually strings; avoid `String(object)` (eslint no-base-to-string / `[object Object]`). */
function cellToTrimmedString(v: unknown): string {
  if (v == null) {
    return '';
  }
  if (typeof v === 'string') {
    return v.trim();
  }
  if (
    typeof v === 'number' ||
    typeof v === 'boolean' ||
    typeof v === 'bigint'
  ) {
    return String(v);
  }
  return '';
}

function normalizeRowKeys(
  row: Record<string, unknown>,
): Record<string, string> {
  // Header CSV có thể bị viết hoa/thừa khoảng trắng: Name, PRICE, quantity...
  // Chuẩn hóa về lower-case để map ổn định với enum `ProductCsvHeader`.
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.trim().toLowerCase()] = cellToTrimmedString(v);
  }
  return out;
}

function parseOptionalIntColumn(
  raw: string,
  lineNumber: number,
  column: string,
  range: 'int' | 'smallint',
): number | null {
  // Cho phép để trống -> lưu null (phù hợp schema hiện tại).
  if (raw === '') {
    return null;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new BadRequestException(
      `Dòng ${lineNumber}: cột "${column}" phải là số nguyên (nhận được "${raw}").`,
    );
  }
  if (range === 'int') {
    if (n < PG_INT_MIN || n > PG_INT_MAX) {
      throw new BadRequestException(
        `Dòng ${lineNumber}: "${column}" vượt phạm vi số nguyên cho phép.`,
      );
    }
  } else if (n < PG_SMALLINT_MIN || n > PG_SMALLINT_MAX) {
    throw new BadRequestException(
      `Dòng ${lineNumber}: "${column}" vượt phạm vi smallint (-32768..32767).`,
    );
  }
  return n;
}

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private static readonly STREAM_LOG_EVERY_BYTES = 5 * 1024 * 1024;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Parse CSV from multipart upload stream directly (no multer memory buffer).
   * The request stream is consumed once and rows are inserted by chunk policies.
   */
  async importProductsFromMultipartRequest(
    req: Request,
  ): Promise<CsvProductUploadResponse> {
    const tStart = Date.now();
    const openResult = (await this.openCsvStreamFromMultipart(req)) as {
      stream: PassThrough;
      streamMeta: CsvUploadStreamMeta;
      uploadCompleted: Promise<void>;
      getReceivedBytes: () => number;
    };
    const { stream, streamMeta, uploadCompleted, getReceivedBytes } =
      openResult;

    this.logger.log(
      `importProductsFromMultipartRequest: start streaming file="${streamMeta.filename}" mime="${streamMeta.mimeType}"`,
    );

    // STEP 1: Mở transaction để đảm bảo all-or-nothing cho cả file import.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // STEP 2: Dựng parser dạng stream trực tiếp từ request multipart file stream.
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    });
    stream.pipe(parser);

    // Trạng thái trong suốt vòng đời import.
    let headerChecked = false;
    let rowCount = 0;
    let inserted = 0;
    let chunkIndex = 0;
    let batch: Array<Pick<Product, 'name' | 'price' | 'quantity'>> = [];
    let batchApproxBytes = 0;

    // STEP 3: Flush batch hiện tại xuống DB theo chunk policy.
    const flushBatch = async (
      reason: 'row-threshold' | 'byte-threshold' | 'final-flush',
    ): Promise<void> => {
      if (batch.length === 0) {
        return;
      }
      const rowsToInsert = batch.length;
      const bytesToInsert = batchApproxBytes;
      await queryRunner.manager.insert(Product, batch);
      inserted += rowsToInsert;
      chunkIndex += 1;
      batch = [];
      batchApproxBytes = 0;
      if (inserted % 10000 === 0 || inserted < 3000) {
        this.logger.log(
          `stream insert progress: rows=${inserted}, chunks=${chunkIndex}, flushReason=${reason}, lastChunkRows=${rowsToInsert}, lastChunkBytesApprox=${bytesToInsert}`,
        );
      }
    };

    try {
      // STEP 4: Đọc parser theo stream (mỗi vòng = 1 record CSV).
      for await (const record of parser) {
        rowCount += 1;
        const normalized = normalizeRowKeys(record as Record<string, unknown>);

        // Header chỉ cần kiểm tra 1 lần ở record đầu tiên.
        if (!headerChecked) {
          for (const col of [
            ProductCsvHeader.Name,
            ProductCsvHeader.Price,
            ProductCsvHeader.Quantity,
          ]) {
            if (!(col in normalized)) {
              throw new BadRequestException(
                `Dòng 1: CSV cần header đủ 3 cột: name, price, quantity (thiếu "${col}").`,
              );
            }
          }
          headerChecked = true;
        }

        const lineNumber = rowCount + 1;
        const nameVal = normalized[ProductCsvHeader.Name] ?? '';
        const priceRaw = normalized[ProductCsvHeader.Price] ?? '';
        const qtyRaw = normalized[ProductCsvHeader.Quantity] ?? '';

        // Bỏ qua dòng trắng hoàn toàn.
        if (nameVal === '' && priceRaw === '' && qtyRaw === '') {
          continue;
        }
        if (nameVal === '') {
          throw new BadRequestException(
            `Dòng ${lineNumber}: "name" không được để trống.`,
          );
        }

        const price = parseOptionalIntColumn(
          priceRaw,
          lineNumber,
          ProductCsvHeader.Price,
          'int',
        );
        const quantity = parseOptionalIntColumn(
          qtyRaw,
          lineNumber,
          ProductCsvHeader.Quantity,
          'smallint',
        );

        // Gom records hợp lệ. Chunk được quyết định bởi số row và payload xấp xỉ.
        batch.push({ name: nameVal, price, quantity });
        batchApproxBytes +=
          Buffer.byteLength(nameVal, 'utf8') +
          Buffer.byteLength(priceRaw, 'utf8') +
          Buffer.byteLength(qtyRaw, 'utf8');

        if (batch.length >= PRODUCT_INSERT_CHUNK_SIZE) {
          await flushBatch('row-threshold');
        } else if (batchApproxBytes >= PRODUCT_INSERT_CHUNK_BYTES) {
          await flushBatch('byte-threshold');
        }

        if (rowCount % 100000 === 0) {
          this.logger.log(
            `stream parse progress: rowsParsed=${rowCount}, rowsInserted=${inserted}, bytesReceived=${getReceivedBytes()}`,
          );
        }
      }

      if (!headerChecked) {
        throw new BadRequestException('CSV không có dòng dữ liệu.');
      }

      // STEP 5: Flush phần còn lại (< chunk size).
      await flushBatch('final-flush');

      if (inserted === 0) {
        throw new BadRequestException('Không có dòng sản phẩm hợp lệ.');
      }
      await uploadCompleted;
      const size = getReceivedBytes();
      if (size === 0) {
        throw new BadRequestException('File rỗng.');
      }

      // STEP 6: Thành công -> commit transaction.
      await queryRunner.commitTransaction();
      this.logger.log(
        `stream import done: file="${streamMeta.filename}", bytesReceived=${size}, parsed=${rowCount}, inserted=${inserted}, chunks=${chunkIndex}, totalMs=${Date.now() - tStart}`,
      );
      return {
        success: true,
        name: streamMeta.filename,
        size,
        inserted,
      };
    } catch (err) {
      // Bất kỳ lỗi nào trong parse/validate/insert đều rollback toàn bộ.
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `stream import failed after ${Date.now() - tStart}ms`,
        err instanceof Error ? err.stack : undefined,
      );
      throw err;
    } finally {
      // Luôn release connection để tránh leak pool.
      await queryRunner.release();
    }
  }

  private async openCsvStreamFromMultipart(req: Request): Promise<{
    stream: PassThrough;
    streamMeta: CsvUploadStreamMeta;
    uploadCompleted: Promise<void>;
    getReceivedBytes: () => number;
  }> {
    // Guard sớm để tránh parse request không phải multipart.
    const contentType = req.headers['content-type'];
    if (typeof contentType !== 'string') {
      throw new BadRequestException('Thiếu Content-Type multipart/form-data.');
    }

    // Khởi tạo parser multipart với giới hạn đúng cho endpoint CSV upload.
    const multipart = createMultipartParser({
      headers: req.headers,
      limits: { files: 1, fileSize: MAX_CSV_FILE_BYTES },
    });

    // Runtime state dùng để tracking tiến trình upload stream.
    let receivedBytes = 0;
    let nextProgressMark = FileService.STREAM_LOG_EVERY_BYTES;
    let fileFound = false;
    let settled = false;

    // PassThrough là cầu nối từ stream file multipart -> csv parser.
    const pass = new PassThrough();
    let selectedFilename = '';
    let selectedMimeType = '';

    // "ready" resolve khi đã xác định đúng file CSV hợp lệ và bắt đầu stream.
    let readyResolve: (() => void) | undefined;
    let readyReject: ((reason?: unknown) => void) | undefined;
    const ready = new Promise<void>((resolve, reject) => {
      readyResolve = resolve;
      readyReject = reject;
    });

    // "uploadCompleted" resolve khi busboy đọc xong toàn bộ multipart request.
    // Promise này giúp caller biết upload đã kết thúc hoàn toàn.
    const uploadCompleted = new Promise<void>((resolve, reject) => {
      multipart.on('close', () => {
        if (!fileFound) {
          reject(new BadRequestException('Thiếu file (field "file").'));
          return;
        }
        resolve();
      });
      multipart.on('error', reject);
      pass.on('error', reject);
    });

    // Chặn resolve/reject lặp lại từ nhiều event cạnh tranh nhau.
    const rejectOnce = (reason: unknown): void => {
      if (settled) {
        return;
      }
      settled = true;
      readyReject?.(reason);
    };
    const resolveOnce = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      readyResolve?.();
    };

    // Sự kiện chính: nhận từng file part từ multipart request.
    multipart.on('file', (fieldName, file, info) => {
      const filename = info.filename;
      const mimeType = info.mimeType;

      // Bỏ qua file không đúng field đích; vẫn phải resume để stream không bị treo.
      if (fieldName !== String(FileUploadField.File)) {
        file.resume();
        return;
      }

      // Endpoint này chỉ cho 1 file CSV.
      if (fileFound) {
        file.resume();
        rejectOnce(new BadRequestException('Chỉ cho phép upload 1 file.'));
        return;
      }
      fileFound = true;

      // Validate loại file trước khi pipe vào parser.
      const lower = filename.toLowerCase();
      if (!lower.endsWith('.csv')) {
        file.resume();
        rejectOnce(new BadRequestException('Chỉ chấp nhận file .csv'));
        return;
      }

      this.logger.log(
        `stream upload started: field=${fieldName}, file="${filename}", mime="${mimeType}"`,
      );
      selectedFilename = filename;
      selectedMimeType = mimeType;
      resolveOnce();

      // Theo dõi tiến trình byte-level để logging runtime.
      file.on('data', (chunk: Buffer) => {
        receivedBytes += chunk.length;
        if (receivedBytes >= nextProgressMark) {
          this.logger.log(
            `stream upload progress: bytesReceived=${receivedBytes}`,
          );
          nextProgressMark += FileService.STREAM_LOG_EVERY_BYTES;
        }
      });

      // Busboy phát "limit" khi vượt fileSize; dừng pipeline ngay.
      file.on('limit', () => {
        rejectOnce(
          new BadRequestException('File vượt quá kích thước cho phép.'),
        );
        pass.destroy(
          new BadRequestException('File vượt quá kích thước cho phép.'),
        );
      });
      file.on('error', rejectOnce);

      // Pipe raw file stream sang PassThrough để tầng parse CSV consume.
      pipeline(file, pass, (err) => {
        if (err) {
          rejectOnce(err);
        }
      });
    });

    // Bắt đầu tiêu thụ request stream bởi busboy.
    req.pipe(multipart);

    // Chờ đến khi file mục tiêu hợp lệ xuất hiện rồi mới trả stream cho caller.
    await ready;
    const streamMeta: CsvUploadStreamMeta = {
      filename: selectedFilename,
      mimeType: selectedMimeType,
    };
    return {
      stream: pass,
      streamMeta,
      uploadCompleted,
      getReceivedBytes: () => receivedBytes,
    };
  }
}

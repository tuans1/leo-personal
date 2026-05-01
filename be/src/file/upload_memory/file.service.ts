import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { parse } from 'csv-parse/sync';
import { DataSource } from 'typeorm';
import { Product } from '../../redis/cart/entities';
import {
  MAX_CSV_FILE_BYTES,
  PRODUCT_INSERT_CHUNK_SIZE,
  ProductCsvHeader,
} from './file.constants';
import type { CsvProductUploadResponse } from './file.types';

/** PostgreSQL integer range (matches TypeORM `integer` on `Product.price`). */
const PG_INT_MIN = -2147483648;
const PG_INT_MAX = 2147483647;

/** PostgreSQL smallint range (matches `smallint` on `Product.quantity`). */
const PG_SMALLINT_MIN = -32768;
const PG_SMALLINT_MAX = 32767;

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

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Parse CSV (header: name,price,quantity) and insert all rows in one transaction, in chunks.
   * Why one transaction: all-or-nothing on validation/DB errors (simple study behavior).
   */
  async importProductsFromCsvBuffer(
    buffer: Buffer,
    originalName: string,
    size: number,
  ): Promise<CsvProductUploadResponse> {
    const tStart = Date.now();
    this.logger.log(
      `importProductsFromCsvBuffer: bắt đầu file="${originalName}" size=${size} bytes`,
    );

    if (size > MAX_CSV_FILE_BYTES) {
      throw new BadRequestException('File vượt quá kích thước cho phép.');
    }
    if (size === 0) {
      throw new BadRequestException('File rỗng.');
    }

    let records: Record<string, unknown>[];
    const tParse0 = Date.now();
    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
      }) as Record<string, unknown>[];
    } catch {
      throw new BadRequestException('Không đọc được file CSV.');
    }
    this.logger.log(
      `parse CSV xong: ${records.length} dòng thô, ${Date.now() - tParse0}ms`,
    );

    if (records.length === 0) {
      throw new BadRequestException('CSV không có dòng dữ liệu.');
    }
    console.log(records.length, '-----Number of rows-----');
    const headerSample = normalizeRowKeys(records[0]);
    for (const col of [
      ProductCsvHeader.Name,
      ProductCsvHeader.Price,
      ProductCsvHeader.Quantity,
    ]) {
      if (!(col in headerSample)) {
        throw new BadRequestException(
          `Dòng 1: CSV cần header đủ 3 cột: name, price, quantity (thiếu "${col}").`,
        );
      }
    }

    const products: Array<Pick<Product, 'name' | 'price' | 'quantity'>> = [];

    for (let i = 0; i < records.length; i++) {
      const lineNumber = i + 2;
      const normalized = normalizeRowKeys(records[i]);

      const nameVal = normalized[ProductCsvHeader.Name] ?? '';
      const priceRaw = normalized[ProductCsvHeader.Price] ?? '';
      const qtyRaw = normalized[ProductCsvHeader.Quantity] ?? '';

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

      products.push({ name: nameVal, price, quantity });
    }

    if (products.length === 0) {
      throw new BadRequestException('Không có dòng sản phẩm hợp lệ.');
    }
    this.logger.log(
      `sau validate: ${products.length} sản phẩm, chuẩn bị ghi DB (chunk=${PRODUCT_INSERT_CHUNK_SIZE})`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const tTx0 = Date.now();
    await queryRunner.startTransaction();
    try {
      let chunkIndex = 0;
      for (
        let offset = 0;
        offset < products.length;
        offset += PRODUCT_INSERT_CHUNK_SIZE
      ) {
        const chunk = products.slice(
          offset,
          offset + PRODUCT_INSERT_CHUNK_SIZE,
        );
        await queryRunner.manager.insert(Product, chunk);
        chunkIndex += 1;
      }
      this.logger.log(
        `insert xong: ${chunkIndex} câu lệnh chunk, ${products.length} dòng`,
      );
      await queryRunner.commitTransaction();
      this.logger.log(
        `DB transaction commit: ${Date.now() - tTx0}ms (tổng từ đầu import: ${Date.now() - tStart}ms)`,
      );
    } catch (err) {
      this.logger.error(
        `DB transaction lỗi sau ${Date.now() - tTx0}ms`,
        err instanceof Error ? err.stack : undefined,
      );
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    this.logger.log(
      `import hoàn tất: inserted=${products.length} tổng thời gian=${Date.now() - tStart}ms`,
    );

    return {
      success: true,
      name: originalName,
      size,
      inserted: products.length,
    };
  }
}

/**
 * Form field for multipart upload — same as FE `CsvUploadFormField.file`.
 * Why: one shared name so axios FormData and Nest FileInterceptor match.
 */
export enum FileUploadField {
  File = 'file',
}

/**
 * Max CSV size (~5MB files with margin). Multer rejects larger uploads early.
 */
export const MAX_CSV_FILE_BYTES = 50 * 1024 * 1024;

/**
 * How many product rows to insert per SQL statement.
 * Why batching: one giant INSERT of 50k rows can hit statement_timeout; chunks stay under limits.
 */
export const PRODUCT_INSERT_CHUNK_SIZE = 1500;

export enum ProductCsvHeader {
  Name = 'name',
  Price = 'price',
  Quantity = 'quantity',
}

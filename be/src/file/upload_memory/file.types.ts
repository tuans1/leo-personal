/**
 * JSON returned after a successful import — keep aligned with `fe` CsvUploadResponse (add `inserted`).
 */
export interface CsvProductUploadResponse {
  success: true;
  /** Original uploaded filename. */
  name: string;
  /** Upload size in bytes. */
  size: number;
  /** Rows inserted into `products`. */
  inserted: number;
}

/**
 * Shape of an in-memory file from `multer` (fields we use).
 * Declared here on purpose: `Express.Multer.File` and `Request['file']` can resolve to
 * `any` or clash with the DOM `File` global, which triggers @typescript-eslint/no-unsafe-*.
 */
export interface CsvMemoryUploadedFile {
  originalname: string;
  size: number;
  buffer: Buffer;
}

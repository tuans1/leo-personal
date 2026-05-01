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
 * Metadata resolved from multipart stream for CSV upload.
 */
export interface CsvUploadStreamMeta {
  filename: string;
  mimeType: string;
}

import axios, { isAxiosError, type AxiosProgressEvent } from "axios";
import { CsvUploadFormField } from "./csv.constants";

export { CsvUploadFormField } from "./csv.constants";

/**
 * Trực tiếp endpoint Nest: `FileController` → POST `/file/products/csv`.
 * Cổng mặc định theo `be/src/main.ts` (4000) — sửa ở đây nếu deploy khác.
 */
const NEST_CSV_UPLOAD_URL = "http://localhost:4000/file/products/csv";
const NEST_CSV_STREAM_UPLOAD_URL = "http://localhost:4000/file/products/csv-stream";

export interface CsvUploadResponse {
  success: true;
  name: string;
  size: number;
  /** Số dòng đã insert (backend Nest / Supabase). */
  inserted?: number;
}

function getProgressPercent(e: AxiosProgressEvent): number {
  const { loaded, total } = e;
  if (total != null && total > 0) {
    return Math.min(100, Math.round((loaded * 100) / total));
  }
  return 0;
}

/**
 * `uploadPercent` = byte gửi đi / tổng body (chỉ giai đoạn client → server).
 * `isServerProcessing` = body đã gửi hết, đang chờ server (parse CSV + insert DB) + response.
 */
export interface CsvUploadProgressState {
  uploadPercent: number;
  isServerProcessing: boolean;
}

function isUploadBodyComplete(e: AxiosProgressEvent): boolean {
  const { loaded, total } = e;
  return total != null && total > 0 && loaded >= total;
}

function getErrorMessageFromAxios(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data;
    if (data != null && typeof data === "object" && "message" in data) {
      const m = (data as { message?: unknown }).message;
      if (typeof m === "string") {
        return m;
      }
      if (Array.isArray(m) && m.every((x) => typeof x === "string")) {
        return m.join(", ");
      }
    }
    if (err.message) {
      return err.message;
    }
  }
  return "Upload thất bại.";
}

const LOG_PREFIX = "[csv-upload]";

/**
 * POST multipart/form-data tới Nest (`NEST_CSV_UPLOAD_URL`).
 * Dùng axios `onUploadProgress` — chỉ phản ánh gửi body; sau đó còn thời gian xử lý ở server.
 */
async function uploadCsvFileByUrl(
  url: string,
  logPrefix: string,
  file: File,
  onProgress: (state: CsvUploadProgressState) => void
): Promise<CsvUploadResponse> {
  const formData = new FormData();
  formData.append(CsvUploadFormField.File, file);
  const t0 = performance.now();
  // eslint-disable-next-line no-console -- dev tracking; remove or gate if noisy
  console.info(logPrefix, "start", { name: file.name, size: file.size, url });

  try {
    const { data } = await axios.post<CsvUploadResponse>(
      url,
      formData,
      {
        onUploadProgress: (e) => {
          const uploadPercent = getProgressPercent(e);
          const isServerProcessing = isUploadBodyComplete(e);
          // eslint-disable-next-line no-console -- dev tracking
          console.info(logPrefix, "progress", {
            loaded: e.loaded,
            total: e.total,
            uploadPercent,
            isServerProcessing,
          });
          onProgress({ uploadPercent, isServerProcessing });
        },
      }
    );
    // eslint-disable-next-line no-console -- dev tracking
    console.info(logPrefix, "response ok", {
      ms: Math.round(performance.now() - t0),
      inserted: data?.inserted,
    });

    if (!data || data.success !== true) {
      throw new Error("Phản hồi server không hợp lệ.");
    }
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console -- dev tracking
    console.error(logPrefix, "failed", err);
    throw new Error(getErrorMessageFromAxios(err));
  }
}

export async function uploadCsvFile(
  file: File,
  onProgress: (state: CsvUploadProgressState) => void
): Promise<CsvUploadResponse> {
  return uploadCsvFileByUrl(NEST_CSV_UPLOAD_URL, "[csv-upload:memory]", file, onProgress);
}

export async function uploadCsvFileStream(
  file: File,
  onProgress: (state: CsvUploadProgressState) => void
): Promise<CsvUploadResponse> {
  return uploadCsvFileByUrl(
    NEST_CSV_STREAM_UPLOAD_URL,
    "[csv-upload:stream]",
    file,
    onProgress
  );
}

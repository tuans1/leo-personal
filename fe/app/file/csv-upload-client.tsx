"use client";

import { useState } from "react";
import {
  uploadCsvFile,
  type CsvUploadProgressState,
  type CsvUploadResponse,
} from "./csv.api";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export function CsvUploadClient() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<CsvUploadProgressState>({
    uploadPercent: 0,
    isServerProcessing: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CsvUploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setUploadState({ uploadPercent: 0, isServerProcessing: false });
    if (!file) {
      setError("Vui lòng chọn file CSV.");
      return;
    }
    setIsUploading(true);
    try {
      const res = await uploadCsvFile(file, (s) => setUploadState(s));
      setResult(res);
      setFile(null);
      const input = document.getElementById("csv-upload-file") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload thất bại.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && (
        <div
          className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}
      {result && (
        <div
          className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-3 py-2 text-sm"
          role="status"
        >
          <p className="font-medium">Upload thành công</p>
          <p>Tên file: {result.name}</p>
          <p>Kích thước: {result.size} bytes</p>
          {result.inserted != null && <p>Đã import: {result.inserted} sản phẩm</p>}
        </div>
      )}

      <div>
        <label htmlFor="csv-upload-file" className={labelClass}>
          File CSV
        </label>
        <input
          id="csv-upload-file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={inputClass}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {uploadState.isServerProcessing
                  ? "Đang xử lý trên server (parse + ghi DB)…"
                  : "Đang gửi file tới server"}
              </span>
              <span>
                {uploadState.isServerProcessing
                  ? "—"
                  : `${uploadState.uploadPercent}%`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-[width] duration-150 ${
                  uploadState.isServerProcessing
                    ? "w-full bg-amber-500 motion-safe:animate-pulse"
                    : "bg-blue-600"
                }`}
                style={
                  uploadState.isServerProcessing
                    ? undefined
                    : { width: `${uploadState.uploadPercent}%` }
                }
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Thanh màu xanh = gửi file; cảnh báo màu vàng = server đang parse/ghi DB (không tính trong % gửi).
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading || !file}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? "Đang upload…" : "Upload"}
      </button>
    </form>
  );
}

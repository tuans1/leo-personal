"use client";

import { useState } from "react";
import {
  uploadCsvFileStream,
  type CsvUploadProgressState,
  type CsvUploadResponse,
} from "./csv.api";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export function CsvUploadStreamClient() {
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
      const res = await uploadCsvFileStream(file, (s) => setUploadState(s));
      setResult(res);
      setFile(null);
      const input = document.getElementById("csv-stream-upload-file") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload stream thất bại.");
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
          className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3 py-2 text-sm"
          role="status"
        >
          <p className="font-medium">Stream upload thành công</p>
          <p>Tên file: {result.name}</p>
          <p>Kích thước: {result.size} bytes</p>
          {result.inserted != null && <p>Đã import: {result.inserted} sản phẩm</p>}
        </div>
      )}

      <div>
        <label htmlFor="csv-stream-upload-file" className={labelClass}>
          File CSV (stream endpoint)
        </label>
        <input
          id="csv-stream-upload-file"
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
                  ? "Đang xử lý stream trên server…"
                  : "Đang gửi file tới stream endpoint"}
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
                    ? "w-full bg-emerald-500 motion-safe:animate-pulse"
                    : "bg-emerald-600"
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
            Endpoint test: <code>/file/products/csv-stream</code>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading || !file}
        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? "Đang upload stream…" : "Upload Stream"}
      </button>
    </form>
  );
}

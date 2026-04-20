"use client";

import { useState } from "react";
import { ApiClientError } from "@/app/lib/api/client";
import { deleteS3File, getPresignedUrl } from "@/app/aws/s3/s3.api";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function FileActions() {
  const [key, setKey] = useState("");
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingPresigned, setLoadingPresigned] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleGetPresignedUrl = async () => {
    const effectiveKey = key.trim();
    if (!effectiveKey) {
      setError("Nhập key để lấy presigned URL.");
      return;
    }
    setError(null);
    setPresignedUrl(null);
    setLoadingPresigned(true);
    try {
      const result = await getPresignedUrl(effectiveKey);
      setPresignedUrl(result.url);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Lấy URL thất bại.";
      setError(message);
    } finally {
      setLoadingPresigned(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!presignedUrl) return;
    try {
      await navigator.clipboard.writeText(presignedUrl);
      setSuccess("Đã copy URL.");
      setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError("Copy thất bại.");
    }
  };

  const handleOpenUrl = () => {
    if (presignedUrl) window.open(presignedUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    const effectiveKey = key.trim();
    if (!effectiveKey) {
      setError("Nhập key để xóa file.");
      return;
    }
    if (!window.confirm(`Xóa file "${effectiveKey}"?`)) return;
    setError(null);
    setSuccess(null);
    setPresignedUrl(null);
    setLoadingDelete(true);
    try {
      await deleteS3File(effectiveKey);
      setSuccess("Đã xóa file.");
      setKey("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Xóa file thất bại.";
      setError(message);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-3 py-2 text-sm">
          {success}
        </div>
      )}

      <div>
        <label htmlFor="s3-file-key" className={labelClass}>
          Key (full S3 key)
        </label>
        <input
          id="s3-file-key"
          type="text"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setPresignedUrl(null);
          }}
          className={inputClass}
          placeholder="vd: my-folder/sample.pdf"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGetPresignedUrl}
          disabled={loadingPresigned || !key.trim()}
          className="py-2 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loadingPresigned ? "Đang lấy..." : "Lấy Presigned URL"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loadingDelete || !key.trim()}
          className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loadingDelete ? "Đang xóa..." : "Xóa file"}
        </button>
      </div>

      {presignedUrl && (
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Presigned URL
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
            {presignedUrl}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="py-1.5 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={handleOpenUrl}
              className="py-1.5 px-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg"
            >
              Mở trong tab mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

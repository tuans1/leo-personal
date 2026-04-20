"use client";

import { useState } from "react";
import { ApiClientError } from "@/app/lib/api/client";
import { uploadS3 } from "@/app/aws/s3/s3.api";
import type { UploadResult } from "@/app/aws/s3/types";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [key, setKey] = useState("");
  const [prefix, setPrefix] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setError("Vui lòng chọn file.");
      return;
    }
    const effectiveKey = key.trim();
    const effectivePrefix = prefix.trim();
    setIsSubmitting(true);
    try {
      const uploadResult = await uploadS3(file, {
        ...(effectiveKey ? { key: effectiveKey } : {}),
        ...(effectivePrefix ? { prefix: effectivePrefix } : {}),
      });
      setResult(uploadResult);
      setFile(null);
      setKey("");
      setPrefix("");
      // Reset file input
      const fileInput = document.getElementById("s3-upload-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Upload thất bại.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {result && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-3 py-2 text-sm">
          <p className="font-medium">Upload thành công</p>
          <p>Key: {result.key}</p>
          <p>Bucket: {result.bucket}</p>
        </div>
      )}

      <div>
        <label htmlFor="s3-upload-file" className={labelClass}>
          File
        </label>
        <input
          id="s3-upload-file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="s3-upload-key" className={labelClass}>
          Key (full S3 key, optional nếu dùng prefix)
        </label>
        <input
          id="s3-upload-key"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className={inputClass}
          placeholder="vd: my-folder/sample.pdf"
        />
      </div>

      <div>
        <label htmlFor="s3-upload-prefix" className={labelClass}>
          Prefix (optional, key = prefix + tên file)
        </label>
        <input
          id="s3-upload-prefix"
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          className={inputClass}
          placeholder="vd: uploads"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {isSubmitting ? "Đang upload..." : "Upload"}
      </button>
    </form>
  );
}

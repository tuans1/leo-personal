"use client";

import { useState } from "react";
import { ApiClientError } from "@/app/lib/api/client";
import { useS3SdkClient } from "@/app/aws/s3-sdk/S3SdkProvider";
import {
  getPresignedUploadUrl,
  uploadViaPresignedUrl,
} from "@/app/aws/s3-sdk/s3-sdk.api";
import { uploadWithSdk } from "@/app/aws/s3-sdk/s3-client";
import { PRESIGNED_URL_DEFAULT_EXPIRES_IN } from "@/app/aws/s3-sdk/constants";
import type { UploadResultSdk } from "@/app/aws/s3-sdk/types";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

type UploadMode = "presigned" | "sdk";

function resolveKey(key: string, prefix: string, fileName: string): string {
  if (key.trim()) return key.trim();
  if (prefix.trim()) {
    const clean = prefix.trim().replace(/\/$/, "");
    return clean ? `${clean}/${fileName}` : fileName;
  }
  return fileName;
}

export default function UploadForm() {
  const { getValidClient } = useS3SdkClient();
  const [uploadMode, setUploadMode] = useState<UploadMode>("presigned");
  const [file, setFile] = useState<File | null>(null);
  const [key, setKey] = useState("");
  const [prefix, setPrefix] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(UploadResultSdk & { mode: UploadMode }) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setError("Vui lòng chọn file.");
      return;
    }
    const effectiveKey = resolveKey(key, prefix, file.name);
    setIsSubmitting(true);
    try {
      if (uploadMode === "presigned") {
        const presignedResult = await getPresignedUploadUrl(effectiveKey, {
          contentType: file.type || undefined,
          expiresIn: PRESIGNED_URL_DEFAULT_EXPIRES_IN,
        });
        console.log("🚀 ~ handleSubmit ~ presignedResult:", presignedResult)
        const uploadResult = await uploadViaPresignedUrl(
          file,
          effectiveKey,
          presignedResult
        );
        setResult({ ...uploadResult, mode: "presigned" });
      } else {
        const { client, bucket } = await getValidClient();
        const uploadResult = await uploadWithSdk({
          client,
          bucket,
          key: effectiveKey,
          file,
        });
        setResult({ ...uploadResult, mode: "sdk" });
      }
      setFile(null);
      setKey("");
      setPrefix("");
      const fileInput = document.getElementById("s3-sdk-upload-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Upload thất bại.";
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
          <p className="font-medium">
            Upload thành công ({result.mode === "presigned" ? "Presigned URL" : "S3 SDK"})
          </p>
          <p>Key: {result.key}</p>
          <p>Bucket: {result.bucket}</p>
        </div>
      )}

      <div>
        <span className={labelClass}>Cách upload</span>
        <div className="mt-1 flex gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="upload-mode"
              checked={uploadMode === "presigned"}
              onChange={() => setUploadMode("presigned")}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Presigned URL (upload thẳng S3, giảm tải server)
            </span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="upload-mode"
              checked={uploadMode === "sdk"}
              onChange={() => setUploadMode("sdk")}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              SDK (temp credentials)
            </span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="s3-sdk-upload-file" className={labelClass}>
          File
        </label>
        <input
          id="s3-sdk-upload-file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="s3-sdk-upload-key" className={labelClass}>
          Key (full S3 key, optional nếu dùng prefix)
        </label>
        <input
          id="s3-sdk-upload-key"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className={inputClass}
          placeholder="vd: my-folder/sample.pdf"
        />
      </div>

      <div>
        <label htmlFor="s3-sdk-upload-prefix" className={labelClass}>
          Prefix (optional)
        </label>
        <input
          id="s3-sdk-upload-prefix"
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

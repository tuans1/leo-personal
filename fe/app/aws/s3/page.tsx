import Link from "next/link";
import UploadForm from "@/app/aws/s3/UploadForm";
import FileActions from "@/app/aws/s3/FileActions";

export default function S3Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex text-sky-600 dark:text-sky-400 hover:underline mb-4"
          >
            ← Về trang chủ
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AWS S3
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload file, lấy presigned URL và xóa file qua API backend.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-800 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload file
            </h2>
            <UploadForm />
          </div>

          <div className="rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-800 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Lấy URL / Xóa file
            </h2>
            <FileActions />
          </div>
        </div>
      </div>
    </div>
  );
}

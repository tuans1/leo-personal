import { CsvUploadClient } from "./csv-upload-client";
import { CsvUploadStreamClient } from "./csv-upload-stream-client";

export const metadata = {
  title: "Upload CSV | Demo",
  description: "Demo upload CSV với thanh tiến trình",
};

export default function FilePage() {
  return (
    <div className="min-h-svh p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload CSV (demo)</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Chọn file .csv; tiến trình upload hiển thị dưới dạng phần trăm. Test song song memory và stream:
          </p>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>
              Memory endpoint:{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                http://localhost:4000/file/products/csv
              </code>
            </p>
            <p>
              Stream endpoint:{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                http://localhost:4000/file/products/csv-stream
              </code>
            </p>
          </div>
        </header>
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Upload qua memory endpoint
          </h2>
          <CsvUploadClient />
        </section>
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Upload qua stream endpoint
          </h2>
          <CsvUploadStreamClient />
        </section>
      </div>
    </div>
  );
}

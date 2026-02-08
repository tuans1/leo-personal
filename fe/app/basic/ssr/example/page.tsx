import Link from "next/link";
import { fetchExampleData } from "./mock-data";
import B from "./B";
import C from "./C";

/**
 * A - Server Component (SSR)
 * Fetch data trên server, truyền xuống C qua composition:
 * A render <B><C data={data} /></B>
 * → C chạy trên server với data từ A, kết quả được truyền vào B qua children.
 */
export default async function SSRCompositionPage() {
  const data = await fetchExampleData();
  console.log(1)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/basic/ssr"
            className="inline-flex text-green-600 dark:text-green-400 hover:underline mb-4"
          >
            ← Về SSR
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            A (SSR) → B (CSR) → C (SSR)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Composition: A fetch data, truyền cho C. B nhận children (output của
            C). C vẫn là Server Component.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border-2 border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/20 p-4">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
              A (SSR) – trang này
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fetch data trên server, render{" "}
              <code className="rounded bg-amber-100 dark:bg-amber-900/50 px-1">
                &lt;B&gt;&lt;C data=&#123;data&#125; /&gt;&lt;/B&gt;
              </code>
            </p>
          </div>

          <B>
            <C data={data} />
          </B>
        </div>
      </div>
    </div>
  );
}

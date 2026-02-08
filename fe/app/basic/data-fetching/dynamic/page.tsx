import Link from "next/link";
import { getProducts } from "../mock-data";

/**
 * Dynamic data fetching – tương đương getServerSideProps.
 * Data fetch mỗi request. Export dynamic = 'force-dynamic'.
 */
export const dynamic = "force-dynamic";

export default async function DynamicDataPage() {
  const products = await getProducts();
  const fetchedAt = new Date().toISOString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/basic/data-fetching"
            className="inline-flex text-cyan-600 dark:text-cyan-400 hover:underline mb-4"
          >
            ← Về Data Fetching
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dynamic (getServerSideProps)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Trang này dùng dynamic data – tương đương getServerSideProps. Mỗi
            lần mở/refresh trang, server fetch lại data.
          </p>
          <p className="text-sm font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded inline-block">
            Fetched at: {fetchedAt}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Danh sách sản phẩm (dynamic)
          </h2>
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {p.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {p.description}
                </div>
                <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mt-1">
                  {p.price.toLocaleString("vi-VN")} ₫
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

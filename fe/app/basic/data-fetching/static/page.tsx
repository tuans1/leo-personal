import Link from "next/link";
import { getProducts } from "../mock-data";

/**
 * Static data fetching – tương đương getStaticProps.
 * Data lấy lúc build (hoặc revalidate), không fetch mỗi request.
 * Không export dynamic = 'force-dynamic'.
 */
export default async function StaticDataPage() {
  const products = await getProducts();
  const generatedAt = new Date().toISOString();

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
            Static (getStaticProps)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Trang này dùng static data – tương đương getStaticProps. Data được
            lấy lúc build và được cache.
          </p>
          <p className="text-sm font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded inline-block">
            Generated at: {generatedAt}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Danh sách sản phẩm (static)
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

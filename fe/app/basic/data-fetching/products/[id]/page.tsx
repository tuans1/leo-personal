import Link from "next/link";
import { getProductById } from "../../mock-data";

/**
 * Static Paths – tương đương getStaticPaths + getStaticProps.
 * generateStaticParams định nghĩa các path /1, /2, /3 được build sẵn.
 */
export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  const generatedAt = new Date().toISOString();

  if (!product) {
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
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sản phẩm không tồn tại
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ID &quot;{id}&quot; không có trong danh sách build sẵn (1, 2, 3).
            </p>
            <Link
              href="/basic/data-fetching"
              className="inline-block text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
            >
              Quay lại danh sách ví dụ
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Trang chi tiết sản phẩm – các path /1, /2, /3 được build sẵn
            (generateStaticParams).
          </p>
          <p className="text-sm font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded inline-block">
            Generated at: {generatedAt}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {product.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {product.description}
          </p>
          <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
            {product.price.toLocaleString("vi-VN")} ₫
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            ID: {product.id}
          </p>
        </div>

        <div className="mt-4 flex gap-4">
          <Link
            href="/basic/data-fetching/products/1"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Sản phẩm 1
          </Link>
          <Link
            href="/basic/data-fetching/products/2"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Sản phẩm 2
          </Link>
          <Link
            href="/basic/data-fetching/products/3"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Sản phẩm 3
          </Link>
        </div>
      </div>
    </div>
  );
}

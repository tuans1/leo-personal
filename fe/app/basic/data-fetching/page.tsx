import Link from "next/link";

/**
 * Data Fetching Examples – Index
 *
 * Giải thích ba loại data fetching trong App Router:
 * Static (getStaticProps), Dynamic (getServerSideProps), Static Paths (getStaticPaths).
 */
export default function DataFetchingIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:underline mb-4"
          >
            ← Về trang chủ
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Data Fetching – Ví dụ
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ba cách lấy data trong App Router (thay cho getStaticProps,
            getServerSideProps, getStaticPaths)
          </p>
        </div>

        <div className="space-y-6">
          {/* Static */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              1. Static (tương đương getStaticProps)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Data lấy một lần lúc build (hoặc revalidate), được cache. Refresh
              trang không đổi thời điểm &quot;Generated at&quot; (sau khi build
              + start).
            </p>
            <Link
              href="/basic/data-fetching/static"
              className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
            >
              Xem ví dụ Static →
            </Link>
          </div>

          {/* Dynamic */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              2. Dynamic (tương đương getServerSideProps)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Data lấy mỗi request. Mỗi lần refresh sẽ thấy thời điểm
              &quot;Fetched at&quot; đổi.
            </p>
            <Link
              href="/basic/data-fetching/dynamic"
              className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
            >
              Xem ví dụ Dynamic →
            </Link>
          </div>

          {/* Static Paths */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              3. Static Paths (tương đương getStaticPaths + getStaticProps)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Một số path (vd. /products/1, /2, /3) được build sẵn. Path không
              có trong danh sách (vd. /products/99) sẽ hiển thị &quot;Sản phẩm
              không tồn tại&quot;.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/basic/data-fetching/products/1"
                className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
              >
                Sản phẩm 1
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/basic/data-fetching/products/2"
                className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
              >
                Sản phẩm 2
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/basic/data-fetching/products/3"
                className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
              >
                Sản phẩm 3
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/basic/data-fetching/products/99"
                className="inline-flex items-center text-amber-600 dark:text-amber-400 hover:underline font-medium"
              >
                ID 99 (không tồn tại)
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            So sánh nhanh
          </h2>
          <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto bg-gray-50 dark:bg-gray-900 p-4 rounded">
            {`Static:     Build time → Cache HTML → Request: serve cache
Dynamic:   Request → Fetch data → Render HTML
Paths:     generateStaticParams → Build /1 /2 /3 → Request: serve prebuilt or 404`}
          </pre>
        </div>
      </div>
    </div>
  );
}

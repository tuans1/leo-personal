import { getServerClient, serializeCache } from "@/app/lib/apollo/ssr-utils";
import { GET_TODOS } from "@/app/lib/apollo/queries";
import { TodosData, Todo } from "@/app/lib/apollo/types";
import SSRClientWrapper from "./client-wrapper";
import Link from "next/link";

/**
 * SSR Demo Page
 * 
 * Server Component:
 * - Fetch data với Apollo Client trên server
 * - Serialize cache
 * - Pass data và cache xuống Client Component
 * 
 * Client Component:
 * - Restore cache từ server
 * - Sử dụng Apollo Client hooks với cache đã có sẵn
 * - No duplicate requests!
 */
export default async function SSRDemoPage() {
  // Tạo Apollo Client instance cho server
  // Mỗi request có instance riêng để tránh cache conflicts
  const serverClient = getServerClient();

  // Fetch data trên server
  const { data, error } = await serverClient.query<TodosData>({
    query: GET_TODOS,
    // fetchPolicy: "network-only" để luôn fetch từ network trên server
    // Cache sẽ được serialize và restore trên client
    fetchPolicy: "network-only",
  });

  // Serialize cache để truyền xuống client
  const initialCache = serializeCache(serverClient);

  return (
    <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Apollo Client SSR Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Server-Side Rendering với Apollo Client và Cache Hydration
          </p>
        </div>

        {/* Server Data Display */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Server-Side Data (Fetched on Server)
          </h2>
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">
                Error: {error.message}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ✅ Data đã được fetch trên server. HTML đã chứa data này.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Todos Count: <span className="font-bold">{data?.todos?.length || 0}</span>
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {data?.todos?.slice(0, 3).map((todo: Todo) => (
                    <div
                      key={todo.id}
                      className="p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {todo.title}
                      </p>
                    </div>
                  ))}
                  {data?.todos && data.todos.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ... và {data.todos.length - 3} todos khác
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Client Component với Cache Hydration */}
        <SSRClientWrapper initialCache={initialCache} />

        {/* Explanation */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🔍 Cách SSR với Apollo Client hoạt động
          </h2>
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                1. Server-Side (Server Component):
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Tạo Apollo Client instance riêng cho mỗi request</li>
                <li>Fetch data với <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">serverClient.query()</code></li>
                <li>Serialize cache: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">cache.extract()</code></li>
                <li>Render HTML với data đã có</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                2. Client-Side (Client Component):
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nhận serialized cache từ server</li>
                <li>Restore cache: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">cache.restore(initialCache)</code></li>
                <li>Sử dụng Apollo hooks (useQuery) với cache đã có</li>
                <li>No duplicate requests! Cache đã có sẵn</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                💡 Cache Hydration Benefits:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
                <li>No duplicate requests: Client reuse cache từ server</li>
                <li>Faster initial load: Data có sẵn trong HTML</li>
                <li>Better SEO: Search engines thấy content ngay</li>
                <li>Smooth hydration: React không cần re-fetch</li>
              </ul>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                ⚠️ Important Notes:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-300">
                <li>Mỗi request cần Apollo Client instance riêng trên server</li>
                <li>Cache được serialize → có thể tăng HTML size</li>
                <li>Đảm bảo cache structure giống nhau giữa server và client</li>
                <li>Server cache không persist giữa các requests</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📊 SSR vs CSR với Apollo Client
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                ✅ SSR (Server-Side Rendering)
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Data fetch trên server</li>
                <li>HTML có data sẵn (SEO friendly)</li>
                <li>Cache được serialize và hydrate</li>
                <li>No duplicate requests</li>
                <li>Faster initial load</li>
                <li>Better for SEO</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                ⚙️ CSR (Client-Side Rendering)
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Data fetch trên client</li>
                <li>HTML rỗng (no SEO)</li>
                <li>Cache chỉ trên client</li>
                <li>Request mỗi khi load</li>
                <li>Loading state visible</li>
                <li>Better for interactivity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Links */}
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/exercises/apollo"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Apollo Cache Demo
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}


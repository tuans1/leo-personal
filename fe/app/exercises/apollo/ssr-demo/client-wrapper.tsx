"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useMemo } from "react";
import { NormalizedCacheObject } from "@apollo/client";
import { makeClientClient } from "@/app/lib/apollo/make-client";
import { useQuery } from "@apollo/client/react";
import { GET_TODOS } from "@/app/lib/apollo/queries";
import { TodosData } from "@/app/lib/apollo/types";

interface SSRClientWrapperProps {
  initialCache: NormalizedCacheObject;
}

/**
 * Client Component wrapper để restore cache và sử dụng Apollo hooks
 */
function TodoListClient() {
  // Query với cache đã restore từ server
  // Vì cache đã có sẵn, query này sẽ không gửi network request
  const { data, loading, error, networkStatus } = useQuery<TodosData>(
    GET_TODOS,
    {
      // fetchPolicy: "cache-first" sẽ sử dụng cache nếu có
      // Vì cache đã được restore từ server, nó sẽ dùng cache ngay lập tức
      fetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    }
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        🖥️ Client-Side với Cache Hydration
      </h2>

      {loading ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-300">⏳ Loading...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Error: {error.message}
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              ✅ Cache đã được restore từ server. Query này sử dụng cache, không
              gửi network request!
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Network Status:</span>
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {networkStatus === 1
                  ? "Loading"
                  : networkStatus === 7
                  ? "Ready (from cache)"
                  : `Status: ${networkStatus}`}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Todos Count: <span className="font-bold">{data?.todos?.length || 0}</span>
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data?.todos?.map((todo) => (
                <div
                  key={todo.id}
                  className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {todo.title}
                        </h3>
                        {todo.completed && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {todo.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        ID: {todo.id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-300">
              💡 <strong>Cache Hydration Success!</strong> Data này đến từ cache
              được restore từ server. Mở Network tab trong DevTools để xác nhận:
              không có request đến GraphQL endpoint!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SSRClientWrapper({
  initialCache,
}: SSRClientWrapperProps) {
  // Tạo Apollo Client với cache đã restore từ server
  const client = useMemo(() => {
    return makeClientClient(initialCache);
  }, [initialCache]);

  return (
    <ApolloProvider client={client}>
      <TodoListClient />
    </ApolloProvider>
  );
}


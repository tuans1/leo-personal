"use client";

import { useQuery } from "@apollo/client/react";
import { NetworkStatus } from "@apollo/client";
import { GET_TODOS, GET_TODO_BY_ID } from "@/app/lib/apollo/queries";
import { Todo, TodosData, TodoData } from "@/app/lib/apollo/types";
import { useState } from "react";
import Link from "next/link";

export default function ApolloCacheDemoPage() {
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [refetchTime, setRefetchTime] = useState<Date | null>(null);

  // Query để lấy tất cả todos
  const {
    data: todosData,
    loading: todosLoading,
    error: todosError,
    refetch: refetchTodos,
    networkStatus: todosNetworkStatus,
  } = useQuery<TodosData>(GET_TODOS, {
    // fetchPolicy: "cache-first" là mặc định
    // Cache sẽ được sử dụng nếu có, nếu không thì fetch từ network
    notifyOnNetworkStatusChange: true,
  });

  // Query để lấy một todo cụ thể
  const {
    data: todoData,
    loading: todoLoading,
    error: todoError,
    refetch: refetchTodo,
    networkStatus: todoNetworkStatus,
  } = useQuery<TodoData>(GET_TODO_BY_ID, {
    variables: { id: selectedTodoId || "" },
    skip: !selectedTodoId, // Skip query nếu chưa chọn todo
    fetchPolicy: "cache-and-network", // Fetch từ cache và network
    notifyOnNetworkStatusChange: true,
  });

  // Check if đang refetch
  const isRefetchingTodos = todosNetworkStatus === NetworkStatus.refetch;
  const isRefetchingTodo = todoNetworkStatus === NetworkStatus.refetch;

  const handleSelectTodo = (id: string) => {
    setSelectedTodoId(id);
  };

  const handleRefetchTodos = async () => {
    setRefetchTime(new Date());
    await refetchTodos({
      fetchPolicy: "network-only", // Force fetch từ network
    });
  };

  const handleRefetchTodo = async () => {
    setRefetchTime(new Date());
    await refetchTodo({
      fetchPolicy: "network-only", // Force fetch từ network
    });
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Apollo Client Cache Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Kiểm tra cache trong Apollo DevTools
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Cách kiểm tra cache:
          </h2>
          <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>Mở Chrome DevTools (F12)</li>
            <li>
              Vào tab &quot;Apollo&quot; (cần cài Apollo Client DevTools
              extension)
            </li>
            <li>Xem cache trong &quot;Cache&quot; section</li>
            <li>Click vào các todos để trigger queries và xem cache update</li>
            <li>Thử refetch để so sánh cache vs network fetch</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Todos List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Todos List
              </h2>
              <button
                onClick={handleRefetchTodos}
                disabled={isRefetchingTodos || todosLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isRefetchingTodos || todosLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Refetching...
                  </>
                ) : (
                  "Refetch"
                )}
              </button>
            </div>

            {isRefetchingTodos && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-sm text-blue-800 dark:text-blue-300">
                🔄 Đang refetch từ network...
              </div>
            )}

            {refetchTime && !isRefetchingTodos && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 text-sm text-green-800 dark:text-green-300">
                ✅ Đã refetch lúc {refetchTime.toLocaleTimeString()}
              </div>
            )}

            {todosLoading && !todosData && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Đang tải...
              </div>
            )}

            {todosError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                Error: {todosError.message}
              </div>
            )}

            {todosData && (
              <div className="space-y-3">
                {todosData.todos.map((todo: Todo) => (
                  <div
                    key={todo.id}
                    onClick={() => handleSelectTodo(todo.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTodoId === todo.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
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
            )}
          </div>

          {/* Right Column: Selected Todo Detail */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Todo Detail
              </h2>
              {selectedTodoId && (
                <button
                  onClick={handleRefetchTodo}
                  disabled={isRefetchingTodo || todoLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isRefetchingTodo || todoLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Refetching...
                    </>
                  ) : (
                    "Refetch"
                  )}
                </button>
              )}
            </div>

            {isRefetchingTodo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-sm text-blue-800 dark:text-blue-300">
                🔄 Đang refetch từ network...
              </div>
            )}

            {refetchTime && !isRefetchingTodo && selectedTodoId && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 text-sm text-green-800 dark:text-green-300">
                ✅ Đã refetch lúc {refetchTime.toLocaleTimeString()}
              </div>
            )}

            {!selectedTodoId && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Chọn một todo để xem chi tiết</p>
                <p className="text-sm mt-2">
                  Cache sẽ được sử dụng nếu todo đã được fetch trước đó
                </p>
              </div>
            )}

            {selectedTodoId && todoLoading && !todoData && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Đang tải từ{" "}
                {todosData?.todos.find((t: Todo) => t.id === selectedTodoId)
                  ? "cache"
                  : "network"}
                ...
              </div>
            )}

            {todoError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                Error: {todoError.message}
              </div>
            )}

            {todoData && todoData.todo && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {todoData.todo.title}
                    </h3>
                    {todoData.todo.completed ? (
                      <span className="px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {todoData.todo.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        ID:
                      </span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {todoData.todo.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Created At:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(todoData.todo.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Cache Tip:</strong> Khi bạn chọn một todo từ
                    list, nếu nó đã được cache (vì đã fetch trong GET_TODOS),
                    Apollo sẽ trả về từ cache ngay lập tức. Xem trong Apollo
                    DevTools để thấy cache được normalize và reused.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cache Info */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Cache Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Cache Features:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Normalized cache by ID</li>
                <li>Cache-first policy (default)</li>
                <li>Automatic cache updates</li>
                <li>Query deduplication</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How to test:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Click &quot;Refetch&quot; để fetch từ network</li>
                <li>Click lại todo đã chọn để xem cache hit</li>
                <li>Check Apollo DevTools để xem cache structure</li>
                <li>Compare loading times (cache vs network)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

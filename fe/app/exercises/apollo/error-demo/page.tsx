"use client";

import { useQuery } from "@apollo/client/react";
import { GET_TODOS, GET_TODO_BY_ID } from "@/app/lib/apollo/queries";
import { TodosData, TodoData } from "@/app/lib/apollo/types";
import { useState } from "react";
import Link from "next/link";

type ErrorType = "none" | "graphql" | "network" | "timeout";

export default function ApolloErrorDemoPage() {
  const [errorType, setErrorType] = useState<ErrorType>("none");
  const [selectedTodoId, setSelectedTodoId] = useState<string>("1");

  // Query với error type variable
  const {
    data: todosData,
    loading: todosLoading,
    error: todosError,
    refetch: refetchTodos,
  } = useQuery<TodosData>(GET_TODOS, {
    variables: {
      __errorType: errorType === "none" ? undefined : errorType,
    } as any,
    skip: false,
    fetchPolicy: "network-only", // Always fetch from network to trigger errors
    errorPolicy: "all", // Return both data and errors
  });

  const {
    data: todoData,
    loading: todoLoading,
    error: todoError,
    refetch: refetchTodo,
  } = useQuery<TodoData>(GET_TODO_BY_ID, {
    variables: {
      id: selectedTodoId,
      __errorType: errorType === "none" ? undefined : errorType,
    } as any,
    skip: false,
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const handleErrorTypeChange = (type: ErrorType) => {
    setErrorType(type);
  };

  const handleRefetchTodos = () => {
    refetchTodos({
      variables: {
        __errorType: errorType === "none" ? undefined : errorType,
      } as any,
    });
  };

  const handleRefetchTodo = () => {
    refetchTodo({
      variables: {
        id: selectedTodoId,
        __errorType: errorType === "none" ? undefined : errorType,
      } as any,
    });
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Apollo ErrorLink Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Test ErrorLink với các error scenarios khác nhau
          </p>
        </div>

        {/* Error Type Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Error Scenarios
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleErrorTypeChange("none")}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                errorType === "none"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              ✅ Success
            </button>
            <button
              onClick={() => handleErrorTypeChange("graphql")}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                errorType === "graphql"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              ❌ GraphQL Error
            </button>
            <button
              onClick={() => handleErrorTypeChange("network")}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                errorType === "network"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              🌐 Network Error
            </button>
            <button
              onClick={() => handleErrorTypeChange("timeout")}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                errorType === "timeout"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              ⏱️ Timeout Error
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Chọn error type và click "Test Query" để xem ErrorLink xử lý errors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: GET_TODOS */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                GET_TODOS Query
              </h2>
              <button
                onClick={handleRefetchTodos}
                disabled={todosLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {todosLoading ? "Loading..." : "Test Query"}
              </button>
            </div>

            {/* Loading State */}
            {todosLoading && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-blue-800 dark:text-blue-300">
                  ⏳ Đang fetch data...
                </p>
              </div>
            )}

            {/* Error Display */}
            {todosError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">
                  Error Details:
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-red-800 dark:text-red-300">
                      Type:
                    </span>
                    <span className="ml-2 text-red-700 dark:text-red-400">
                      {(todosError as any).graphQLErrors?.length > 0
                        ? "GraphQL Error"
                        : "Network Error"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-red-800 dark:text-red-300">
                      Message:
                    </span>
                    <p className="mt-1 text-red-700 dark:text-red-400 font-mono text-xs break-words">
                      {todosError.message}
                    </p>
                  </div>
                  {!(todosError as any).graphQLErrors?.length ? (
                    <div>
                      <span className="font-semibold text-red-800 dark:text-red-300">
                        Network Error Details:
                      </span>
                      <p className="mt-1 text-red-700 dark:text-red-400 font-mono text-xs">
                        {todosError.message}
                      </p>
                    </div>
                  ) : null}
                  {(todosError as any).graphQLErrors?.length > 0 && (
                    <div>
                      <span className="font-semibold text-red-800 dark:text-red-300">
                        GraphQL Errors:
                      </span>
                      <ul className="mt-1 list-disc list-inside text-red-700 dark:text-red-400">
                        {(todosError as any).graphQLErrors.map((gqlError: any, idx: number) => (
                          <li key={idx} className="font-mono text-xs">
                            {gqlError.message}
                            {gqlError.extensions && (
                              <span className="ml-2 opacity-75">
                                (Code: {gqlError.extensions.code})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs text-red-600 dark:text-red-400">
                  💡 ErrorLink đã log error này vào console. Mở DevTools để xem.
                </p>
              </div>
            )}

            {/* Success Display */}
            {todosData && !todosError && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">
                  ✅ Success
                </h3>
                <p className="text-green-800 dark:text-green-300 text-sm">
                  Fetched {todosData.todos?.length || 0} todos successfully
                </p>
              </div>
            )}

            {/* Data Display */}
            {todosData && todosData.todos && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {todosData.todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {todo.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      ID: {todo.id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: GET_TODO_BY_ID */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                GET_TODO_BY_ID Query
              </h2>
              <button
                onClick={handleRefetchTodo}
                disabled={todoLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {todoLoading ? "Loading..." : "Test Query"}
              </button>
            </div>

            {/* Todo ID Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Todo ID:
              </label>
              <select
                value={selectedTodoId}
                onChange={(e) => setSelectedTodoId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="999">999 (Not Found)</option>
              </select>
            </div>

            {/* Loading State */}
            {todoLoading && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-blue-800 dark:text-blue-300">
                  ⏳ Đang fetch data...
                </p>
              </div>
            )}

            {/* Error Display */}
            {todoError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">
                  Error Details:
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-red-800 dark:text-red-300">
                      Type:
                    </span>
                    <span className="ml-2 text-red-700 dark:text-red-400">
                      {(todoError as any).graphQLErrors?.length > 0
                        ? "GraphQL Error"
                        : "Network Error"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-red-800 dark:text-red-300">
                      Message:
                    </span>
                    <p className="mt-1 text-red-700 dark:text-red-400 font-mono text-xs break-words">
                      {todoError.message}
                    </p>
                  </div>
                  {(todoError as any).graphQLErrors?.length > 0 && (
                    <div>
                      <span className="font-semibold text-red-800 dark:text-red-300">
                        GraphQL Errors:
                      </span>
                      <ul className="mt-1 list-disc list-inside text-red-700 dark:text-red-400">
                        {(todoError as any).graphQLErrors.map((gqlError: any, idx: number) => (
                          <li key={idx} className="font-mono text-xs">
                            {gqlError.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Display */}
            {todoData && todoData.todo && !todoError && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">
                  ✅ Success
                </h3>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {todoData.todo.title}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {todoData.todo.description}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ID: {todoData.todo.id} | Status:{" "}
                    {todoData.todo.completed ? "Completed" : "Pending"}
                  </p>
                </div>
              </div>
            )}

            {todoData && !todoData.todo && !todoError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  ⚠️ Todo không tồn tại
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ErrorLink Information */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ErrorLink Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Error Types Handled:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>GraphQL Errors (server errors, validation errors)</li>
                <li>Network Errors (connection failed, CORS)</li>
                <li>Timeout Errors</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ErrorLink Actions:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Log errors to console</li>
                <li>Handle errors globally</li>
                <li>Can retry failed requests</li>
                <li>Can redirect users (e.g., to login page)</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Tip:</strong> Mở Chrome DevTools (F12) và xem Console để
              thấy ErrorLink log errors. ErrorLink được chain trước MockLink trong
              Apollo Client config.
            </p>
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


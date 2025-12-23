"use client";

import { useEffect } from "react";

/**
 * Analytics Error Boundary
 *
 * File này handle errors trong @analytics slot
 * Mỗi slot có error boundary riêng, error trong một slot không ảnh hưởng đến slots khác
 */

interface AnalyticsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AnalyticsError({
  error,
  reset,
}: AnalyticsErrorProps) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error("Analytics slot error:", error);
  }, [error]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          ⚠️ Analytics Error
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
          @analytics slot
        </span>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
            Có lỗi xảy ra trong Analytics slot:
          </p>
          <p className="text-sm text-red-800 dark:text-red-300 font-mono">
            {error.message}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Thử lại
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            💡 Error trong slot này không ảnh hưởng đến các slots khác. Các slots
            khác vẫn hoạt động bình thường.
          </p>
        </div>
      </div>
    </div>
  );
}



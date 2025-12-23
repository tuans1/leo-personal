"use client";

import { useEffect } from "react";

/**
 * Notifications Error Boundary
 *
 * File này handle errors trong @notifications slot
 */

interface NotificationsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function NotificationsError({
  error,
  reset,
}: NotificationsErrorProps) {
  useEffect(() => {
    console.error("Notifications slot error:", error);
  }, [error]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          ⚠️ Notifications Error
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
          @notifications slot
        </span>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
            Có lỗi xảy ra trong Notifications slot:
          </p>
          <p className="text-sm text-red-800 dark:text-red-300 font-mono">
            {error.message}
          </p>
        </div>

        <button
          onClick={reset}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}



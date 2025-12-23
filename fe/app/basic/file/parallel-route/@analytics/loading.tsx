/**
 * Analytics Loading State
 *
 * File này được render khi @analytics slot đang loading
 * Mỗi slot có loading state riêng, không ảnh hưởng đến các slots khác
 */

export default function AnalyticsLoading() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          📊 Analytics Dashboard
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
          @analytics slot
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đang tải analytics data...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



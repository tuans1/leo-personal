/**
 * Sidebar Loading State
 *
 * File này được render khi @sidebar slot đang loading
 */

export default function SidebarLoading() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* User Profile Skeleton */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
      </div>

      {/* Navigation Skeleton */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-3 animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-3 animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}



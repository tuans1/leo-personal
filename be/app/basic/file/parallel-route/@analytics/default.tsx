/**
 * Analytics Default - Unmatched Route Handler
 *
 * File này được render khi route không match với bất kỳ route nào trong @analytics slot
 * Ví dụ: Khi navigate đến /basic/file/parallel-route/notifications
 * thì @analytics slot sẽ render default.tsx này thay vì page.tsx
 */

export default function AnalyticsDefault() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 border-dashed">
      <div className="text-center py-4">
        <div className="text-4xl mb-2">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Analytics Slot (Default)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Route hiện tại không match với analytics routes
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Đây là default.tsx của @analytics slot
        </p>
      </div>
    </div>
  );
}



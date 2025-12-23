/**
 * Notifications Route - Test Default.tsx
 *
 * Route này để test default.tsx của các slots khác
 * Khi vào route này:
 * - @analytics không match → render @analytics/default.tsx ✅
 * - @notifications có thể match hoặc không → tùy
 * - @sidebar không match → render @sidebar/default.tsx ✅
 */
export default function NotificationsRoute() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Notifications Route - Testing Default.tsx
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Route này để test default.tsx. Hãy xem các slots bên cạnh:
      </p>
      <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
        <li>@analytics slot → nên hiển thị default.tsx (border-dashed)</li>
        <li>@sidebar slot → nên hiển thị default.tsx (border-dashed)</li>
        <li>@notifications slot → có thể match hoặc default</li>
      </ul>
    </div>
  );
}

/**
 * Analytics Sales - Nested Route
 *
 * Đây là nested route trong @analytics slot
 * Route: /basic/file/parallel-route/analytics/sales
 * 
 * Khi navigate đến route này:
 * - @analytics slot sẽ render page này
 * - Các slots khác (@notifications, @sidebar) vẫn giữ nguyên content
 * - Chỉ @analytics slot update, không reload toàn bộ page
 */

interface SalesData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  growth: number;
}

async function fetchSalesData(): Promise<SalesData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    today: 5420,
    thisWeek: 32450,
    thisMonth: 128900,
    growth: 12.5,
  };
}

export default async function SalesPage() {
  const data = await fetchSalesData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          💰 Sales Analytics
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
          @analytics/sales
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Sales Today
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${data.today.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Sales This Week
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${data.thisWeek.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Sales This Month
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              ${data.thisMonth.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Growth Rate
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              +{data.growth}%
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Đây là nested route trong @analytics slot. Khi bạn navigate đến
            route này, chỉ @analytics slot update, các slots khác không thay đổi.
          </p>
        </div>
      </div>
    </div>
  );
}



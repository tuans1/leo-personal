/**
 * Analytics Slot - Main Page
 *
 * Đây là page chính của @analytics slot
 * Slot này được render song song với các slots khác
 */

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  revenue: number;
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    totalViews: 12543,
    uniqueVisitors: 8234,
    conversionRate: 3.2,
    revenue: 45230,
  };
}

export default async function AnalyticsPage() {
  const data = await fetchAnalytics();

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
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Views
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.totalViews.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Unique Visitors
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.uniqueVisitors.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Conversion Rate
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.conversionRate}%
            </div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Revenue
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${data.revenue.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Đây là Server Component - data được fetch trên server trước khi
            render
          </p>
        </div>
      </div>
    </div>
  );
}



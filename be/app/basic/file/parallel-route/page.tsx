"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Parallel Routes Main Page
 *
 * Component này là main page của parallel routes
 * Nó nhận các parallel route slots như props và hiển thị navigation
 *
 * LƯU Ý:
 * - Page component KHÔNG nhận parallel route slots như props
 * - Chỉ layout.tsx mới nhận parallel route slots
 * - Page này chỉ để demo navigation và giải thích cách hoạt động
 */

export default function ParallelRoutesPage() {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/basic/file/parallel-route",
      description: "Trang chủ với tất cả slots",
    },
    {
      name: "Analytics",
      href: "/basic/file/parallel-route/analytics",
      description: "Xem analytics slot",
    },
    {
      name: "Sales Analytics",
      href: "/basic/file/parallel-route/analytics/sales",
      description: "Nested route trong analytics slot",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        📚 Giải thích Parallel Routes
      </h2>

      {/* Info Panel */}
      <div className="space-y-4 text-gray-700 dark:text-gray-300 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            1. Parallel Routes là gì?
          </h3>
          <p className="mb-2">
            Parallel Routes cho phép bạn render nhiều pages cùng lúc trong cùng
            một layout. Mỗi route được định nghĩa bằng folder có tên bắt đầu
            bằng <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">@</code>.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                @analytics
              </code>{" "}
              - Slot cho analytics content
            </li>
            <li>
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                @notifications
              </code>{" "}
              - Slot cho notifications content
            </li>
            <li>
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                @sidebar
              </code>{" "}
              - Slot cho sidebar content
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            2. Cách hoạt động:
          </h3>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>
              Next.js tự động pass các slots như props vào layout.tsx
            </li>
            <li>
              Layout render tất cả slots cùng lúc (parallel rendering)
            </li>
            <li>
              Khi navigate, chỉ slot tương ứng update, các slot khác giữ nguyên
            </li>
            <li>
              Nếu route không match, Next.js render default.tsx của slot đó
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            3. Tính năng đặc biệt:
          </h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <strong>Independent Loading:</strong> Mỗi slot có loading.tsx riêng
            </li>
            <li>
              <strong>Error Boundaries:</strong> Mỗi slot có error.tsx riêng
            </li>
            <li>
              <strong>Unmatched Routes:</strong> Sử dụng default.tsx khi route
              không match
            </li>
            <li>
              <strong>Nested Routes:</strong> Có thể có routes lồng nhau trong
              slots
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🧭 Navigation
        </h3>
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block p-4 rounded-lg border transition-all ${
                  isActive
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Current Route Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">Current Route:</span>{" "}
          <code className="text-blue-600 dark:text-blue-400 font-mono">
            {pathname}
          </code>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Thử navigate giữa các routes để xem cách các slots update độc lập
        </div>
      </div>
    </div>
  );
}



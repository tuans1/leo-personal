"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar Slot - Main Page
 *
 * Đây là page chính của @sidebar slot
 * Component này là Client Component để handle navigation
 */

const menuItems = [
  {
    name: "Dashboard",
    href: "/basic/file/parallel-route",
    icon: "🏠",
  },
  {
    name: "Analytics",
    href: "/basic/file/parallel-route/analytics",
    icon: "📊",
  },
  {
    name: "Sales",
    href: "/basic/file/parallel-route/analytics/sales",
    icon: "💰",
  },
];

export default function SidebarPage() {
  const pathname = usePathname();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* User Profile Section */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
            U
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              User Name
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              user@example.com
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded">
          @sidebar slot
        </span>
      </div>

      {/* Navigation Menu */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
          Navigation
        </h3>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            ⚙️ Settings
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            📥 Export Data
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            🆘 Help & Support
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          💡 Sidebar này luôn hiển thị bất kể route nào đang active
        </p>
      </div>
    </div>
  );
}



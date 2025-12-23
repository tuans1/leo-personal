import Link from "next/link";
import { ReactNode } from "react";

/**
 * Parallel Routes Layout
 *
 * Đây là layout component cho Parallel Routes trong Next.js
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. Next.js tự động pass các parallel route slots như props
 * 2. Mỗi slot (@analytics, @notifications, @sidebar) được render song song
 * 3. Layout này nhận tất cả slots và hiển thị chúng cùng lúc
 * 4. Nếu một slot không match route, Next.js sẽ render default.tsx của slot đó
 *
 * QUAN TRỌNG:
 * - Tên props PHẢI khớp với tên folder (bỏ @)
 * - analytics prop = @analytics folder
 * - notifications prop = @notifications folder
 * - sidebar prop = @sidebar folder
 */

interface ParallelRoutesLayoutProps {
  children: ReactNode;
  analytics: ReactNode;
  notifications: ReactNode;
  sidebar: ReactNode;
}

export default function ParallelRoutesLayout({
  children,
  analytics,
  notifications,
  sidebar,
}: ParallelRoutesLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline mb-4"
          >
            ← Về trang chủ
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Parallel Routes Example
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ví dụ về cách Parallel Routes hoạt động trong Next.js App Router
          </p>
        </div>

        {/* Main Content Grid - Hiển thị tất cả slots song song */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Slot - Chiếm 3 cột */}
          <aside className="lg:col-span-3">
            <div className="sticky top-4">{sidebar}</div>
          </aside>

          {/* Main Content Area - Chiếm 6 cột */}
          <main className="lg:col-span-6">{children}</main>

          {/* Right Sidebar - Chiếm 3 cột */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Analytics Slot */}
            <div>{analytics}</div>

            {/* Notifications Slot */}
            <div>{notifications}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}



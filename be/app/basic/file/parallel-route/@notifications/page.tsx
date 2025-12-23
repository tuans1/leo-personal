"use client";

import { useState, useEffect } from "react";

/**
 * Notifications Slot - Main Page
 *
 * Đây là page chính của @notifications slot
 * Component này là Client Component để demo real-time updates
 */

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "New Message",
    message: "Bạn có tin nhắn mới từ John Doe",
    time: "2 phút trước",
    type: "info",
  },
  {
    id: 2,
    title: "Order Completed",
    message: "Đơn hàng #12345 đã được hoàn thành",
    time: "15 phút trước",
    type: "success",
  },
  {
    id: 3,
    title: "Payment Received",
    message: "Bạn đã nhận được thanh toán $500",
    time: "1 giờ trước",
    type: "success",
  },
  {
    id: 4,
    title: "System Update",
    message: "Hệ thống sẽ bảo trì vào 2h sáng",
    time: "3 giờ trước",
    type: "warning",
  },
];

const typeColors = {
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  success:
    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
};

const typeIcons = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(4);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new notification every 10 seconds
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now(),
          title: "New Notification",
          message: `Notification được tạo lúc ${new Date().toLocaleTimeString()}`,
          time: "Vừa xong",
          type: ["info", "success", "warning"][
            Math.floor(Math.random() * 3)
          ] as Notification["type"],
        };
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            🔔 Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="text-xs text-white bg-red-500 px-2 py-1 rounded-full">
              {unreadCount} mới
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded">
            @notifications slot
          </span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Đánh dấu đã đọc
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${typeColors[notification.type]}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{typeIcons[notification.type]}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  {notification.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {notification.message}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {notification.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          💡 Đây là Client Component - có thể update real-time mà không cần
          reload page
        </p>
      </div>
    </div>
  );
}



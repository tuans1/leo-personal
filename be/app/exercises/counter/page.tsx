"use client";

import { useState, useEffect } from "react";
import {
  getSocketClient,
  disconnectSocket,
} from "@/app/lib/socket/socket-client";
import { SocketEvents } from "@/app/lib/socket/socket-events";
import { Socket } from "socket.io-client";
import Link from "next/link";

interface OnlineCountUpdate {
  count: number;
}

export default function CounterPage() {
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  /**
   * useEffect chạy khi component mount
   * - Lấy socket client (singleton)
   * - Đăng ký các event listeners
   * - Cleanup khi component unmount
   */
  useEffect(() => {
    const socket: Socket = getSocketClient();
    console.log("🚀 ~ CounterPage ~ socket:", socket);

    // Listener khi socket connect thành công
    socket.on("connect", () => {
      setIsConnected(true);
    });

    // Listener khi socket bị disconnect
    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Listener nhận event từ server khi số lượng online thay đổi
    // Server sẽ emit event này mỗi khi có client connect/disconnect
    socket.on(SocketEvents.ONLINE_COUNT_UPDATE, (data: OnlineCountUpdate) => {
      setOnlineCount(data.count);
    });

    // Cleanup: Xóa tất cả listeners và disconnect khi component unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(SocketEvents.ONLINE_COUNT_UPDATE);
      disconnectSocket();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Real-time Counter
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Số người đang online
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-8">
            <div
              className={`relative w-48 h-48 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                isConnected
                  ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/50"
                  : "bg-gradient-to-br from-gray-300 to-gray-400"
              }`}
            >
              <span className="text-6xl font-bold text-white">
                {onlineCount}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              <span
                className={`font-medium ${
                  isConnected
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {isConnected ? "Đã kết nối" : "Đang kết nối..."}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Mở nhiều tab để test real-time updates
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}


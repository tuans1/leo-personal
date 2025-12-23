"use client";

import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

// Singleton pattern: Chỉ tạo 1 socket instance duy nhất để tránh tạo nhiều connections
let socketInstance: Socket | null = null;

/**
 * Lấy socket client instance (singleton)
 * Nếu chưa có thì tạo mới, nếu đã có thì trả về instance cũ
 * Đảm bảo chỉ có 1 connection duy nhất trong toàn bộ app
 */
export const getSocketClient = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // Ưu tiên websocket, fallback về polling
      reconnection: true, // Tự động reconnect nếu mất kết nối
      reconnectionDelay: 3000, // Đợi 1s trước khi reconnect
      reconnectionAttempts: 5, // Thử tối đa 5 lần
    });
  }
  return socketInstance;
};

/**
 * Ngắt kết nối socket và reset instance về null
 * Dùng khi component unmount hoặc không cần socket nữa
 */
export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};


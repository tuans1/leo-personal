"use client";

import { useState, useEffect, useRef } from "react";
import { getSocketClient, disconnectSocket } from "@/app/lib/socket/socket-client";
import {
  ChatEvents,
  ChatMessage,
  SystemNotification,
  JoinRoomData,
  SendMessageData,
} from "@/app/lib/socket/chat-events";
import { Socket } from "socket.io-client";
import Link from "next/link";

export default function ChatPage() {
  const [userName, setUserName] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<(ChatMessage | SystemNotification)[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  /**
   * Auto scroll xuống message mới nhất
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Setup socket connection và listeners
   */
  useEffect(() => {
    const socket = getSocketClient();
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Nhận message mới từ server
    socket.on(ChatEvents.NEW_MESSAGE, (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    // Nhận thông báo khi có user join
    socket.on(ChatEvents.USER_JOINED, (data: Omit<SystemNotification, 'type'>) => {
      setMessages((prev) => [...prev, { ...data, type: "join" as const }]);
    });

    // Nhận thông báo khi có user leave
    socket.on(ChatEvents.USER_LEFT, (data: Omit<SystemNotification, 'type'>) => {
      setMessages((prev) => [...prev, { ...data, type: "leave" as const }]);
    });

    // Nhận lịch sử messages khi vừa join
    socket.on("messages_history", (data: { messages: ChatMessage[] }) => {
      setMessages(data.messages);
    });

    // Nhận error từ server
    socket.on("error", (data: { message: string }) => {
      alert(data.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(ChatEvents.NEW_MESSAGE);
      socket.off(ChatEvents.USER_JOINED);
      socket.off(ChatEvents.USER_LEFT);
      socket.off("messages_history");
      socket.off("error");
    };
  }, []);

  /**
   * Xử lý khi user submit tên để join room
   */
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = userName.trim();
    
    if (!trimmedName) {
      alert("Vui lòng nhập tên của bạn");
      return;
    }

    if (!socketRef.current) {
      alert("Chưa kết nối đến server");
      return;
    }

    // Emit event join room với userName
    const joinData: JoinRoomData = { userName: trimmedName };
    socketRef.current.emit(ChatEvents.USER_JOIN, joinData);
    setIsJoined(true);
  };

  /**
   * Xử lý khi user gửi message
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!socketRef.current || !isJoined) {
      alert("Bạn chưa join room");
      return;
    }

    // Emit event send message
    const messageData: SendMessageData = { message: trimmedMessage };
    socketRef.current.emit(ChatEvents.SEND_MESSAGE, messageData);
    setMessage("");
  };

  /**
   * Format timestamp để hiển thị
   */
  const formatTime = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Live Chat
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Chat room đơn giản
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? "Đã kết nối" : "Đang kết nối..."}
              </span>
            </div>
          </div>
        </div>

        {/* Join Form (nếu chưa join) */}
        {!isJoined && (
          <div className="flex-1 flex items-center justify-center p-6">
            <form onSubmit={handleJoinRoom} className="w-full max-w-md">
              <div className="mb-4">
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nhập tên của bạn
                </label>
                <input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Tên của bạn..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Vào Chat Room
              </button>
            </form>
          </div>
        )}

        {/* Chat Area (nếu đã join) */}
        {isJoined && (
          <>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                </div>
              ) : (
                messages.map((msg, index) => {
                  // System notification (join/leave) - check bằng cách xem có field "type" không
                  const isSystemNotification = (m: ChatMessage | SystemNotification): m is SystemNotification => {
                    return 'type' in m;
                  };

                  if (isSystemNotification(msg)) {
                    return (
                      <div
                        key={`${msg.userName}-${index}`}
                        className="text-center py-2"
                      >
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          {msg.type === "join" ? "✅" : "👋"}{" "}
                          <strong>{msg.userName}</strong>{" "}
                          {msg.type === "join" ? "đã tham gia" : "đã rời khỏi"} chat
                        </span>
                      </div>
                    );
                  }

                  // Regular message
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.userName === userName ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.userName === userName
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <div className="text-xs font-medium mb-1 opacity-80">
                          {msg.userName}
                        </div>
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </div>
                        <div className="text-xs mt-1 opacity-70">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Gửi
                </button>
              </form>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link
            href="/"
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect, useRef } from "react";
import {
  getSocketClient,
  disconnectSocket,
} from "@/app/lib/socket/socket-client";
import {
  MultiRoomChatEvents,
  AVAILABLE_ROOMS,
  RoomName,
  RoomMessage,
  SystemNotification,
  RoomUsersUpdate,
  JoinRoomData,
  SendMessageData,
  SwitchRoomData,
} from "@/app/lib/socket/multi-room-chat-events";
import { Socket } from "socket.io-client";
import Link from "next/link";

export default function MultiRoomChatPage() {
  const [userName, setUserName] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [currentRoom, setCurrentRoom] = useState<RoomName | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    (RoomMessage | SystemNotification)[]
  >([]);
  const [roomUsers, setRoomUsers] = useState<Record<RoomName, string[]>>({
    general: [],
    tech: [],
    random: [],
  });
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

    // Nhận message mới từ server (chỉ trong room hiện tại)
    socket.on(MultiRoomChatEvents.NEW_MESSAGE, (data: RoomMessage) => {
      if (data.roomName === currentRoom) {
        setMessages((prev) => [...prev, data]);
      }
    });

    // Nhận thông báo khi có user join room
    socket.on(
      MultiRoomChatEvents.USER_JOINED_ROOM,
      (data: Omit<SystemNotification, "type">) => {
        if (data.roomName === currentRoom) {
          setMessages((prev) => [...prev, { ...data, type: "join" as const }]);
        }
      }
    );

    // Nhận thông báo khi có user leave room
    socket.on(
      MultiRoomChatEvents.USER_LEFT_ROOM,
      (data: Omit<SystemNotification, "type">) => {
        if (data.roomName === currentRoom) {
          setMessages((prev) => [...prev, { ...data, type: "leave" as const }]);
        }
      }
    );

    // Nhận lịch sử messages khi vừa join/switch room
    socket.on(
      "room_messages_history",
      (data: { roomName: RoomName; messages: RoomMessage[] }) => {
        if (data.roomName === currentRoom || !isJoined) {
          setMessages(data.messages);
        }
      }
    );

    // Nhận cập nhật danh sách users trong room
    socket.on(
      MultiRoomChatEvents.ROOM_USERS_UPDATE,
      (data: RoomUsersUpdate) => {
        setRoomUsers((prev) => ({
          ...prev,
          [data.roomName]: data.users.map((u) => u.userName),
        }));
      }
    );

    // Nhận error từ server
    socket.on("error", (data: { message: string }) => {
      alert(data.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(MultiRoomChatEvents.NEW_MESSAGE);
      socket.off(MultiRoomChatEvents.USER_JOINED_ROOM);
      socket.off(MultiRoomChatEvents.USER_LEFT_ROOM);
      socket.off("room_messages_history");
      socket.off(MultiRoomChatEvents.ROOM_USERS_UPDATE);
      socket.off("error");
    };
  }, [currentRoom, isJoined]);

  /**
   * Xử lý khi user submit tên và chọn room để join
   */
  const handleJoinRoom = (e: React.FormEvent, selectedRoom: RoomName) => {
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

    // Emit event join room với userName và roomName
    const joinData: JoinRoomData = {
      userName: trimmedName,
      roomName: selectedRoom,
    };
    socketRef.current.emit(MultiRoomChatEvents.JOIN_ROOM, joinData);
    setIsJoined(true);
    setCurrentRoom(selectedRoom);
  };

  /**
   * Xử lý khi user switch sang room khác
   */
  const handleSwitchRoom = (newRoom: RoomName) => {
    if (!socketRef.current || !isJoined || newRoom === currentRoom) {
      return;
    }

    const switchData: SwitchRoomData = { newRoomName: newRoom };
    socketRef.current.emit(MultiRoomChatEvents.SWITCH_ROOM, switchData);
    setCurrentRoom(newRoom);
    setMessages([]); // Clear messages, sẽ load lại khi nhận room_messages_history
  };

  /**
   * Xử lý khi user gửi message
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !currentRoom) {
      return;
    }

    if (!socketRef.current || !isJoined) {
      alert("Bạn chưa join room");
      return;
    }

    // Emit event send message với message và roomName
    const messageData: SendMessageData = {
      message: trimmedMessage,
      roomName: currentRoom,
    };
    socketRef.current.emit(MultiRoomChatEvents.SEND_MESSAGE, messageData);
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

  /**
   * Format room name để hiển thị đẹp hơn
   */
  const formatRoomName = (room: RoomName): string => {
    return room.charAt(0).toUpperCase() + room.slice(1);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-[95vh]">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-md p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Multi-Room Chat
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Slack-style với nhiều channels
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
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-b-xl shadow-md">
            <div className="w-full max-w-md p-6">
              <form
                onSubmit={(e) => handleJoinRoom(e, "general")}
                className="space-y-4"
              >
                <div>
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chọn room để bắt đầu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_ROOMS.map((room) => (
                      <button
                        key={room}
                        type="button"
                        onClick={(e) => handleJoinRoom(e, room)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
                      >
                        {formatRoomName(room)}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Chat Area (nếu đã join) */}
        {isJoined && currentRoom && (
          <div className="flex-1 flex bg-white dark:bg-gray-800 rounded-b-xl shadow-md overflow-hidden">
            {/* Sidebar - Room List & Users */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Room List */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Rooms
                </h2>
                <div className="space-y-1">
                  {AVAILABLE_ROOMS.map((room) => (
                    <button
                      key={room}
                      onClick={() => handleSwitchRoom(room)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        room === currentRoom
                          ? "bg-indigo-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      # {formatRoomName(room)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users in Current Room */}
              <div className="flex-1 p-4 overflow-y-auto">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Users in #{formatRoomName(currentRoom)} (
                  {roomUsers[currentRoom]?.length || 0})
                </h2>
                <div className="space-y-1">
                  {roomUsers[currentRoom]?.map((user, index) => (
                    <div
                      key={`${user}-${index}`}
                      className="text-sm text-gray-600 dark:text-gray-400 px-2 py-1"
                    >
                      👤 {user}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Room Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  # {formatRoomName(currentRoom)}
                </h2>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isSystemNotification = (
                      m: RoomMessage | SystemNotification
                    ): m is SystemNotification => {
                      return "type" in m;
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
                            {msg.type === "join"
                              ? "đã tham gia"
                              : "đã rời khỏi"}{" "}
                            room
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.userName === userName
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.userName === userName
                              ? "bg-indigo-600 text-white"
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
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Nhập tin nhắn trong #${formatRoomName(
                      currentRoom
                    )}...`}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    Gửi
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

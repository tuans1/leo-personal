import { Injectable } from '@nestjs/common';
import { ChatUser, ChatMessage } from './chat.types';

/**
 * Service quản lý users và messages trong chat room
 * Lưu trữ state trong memory (sẽ reset khi server restart)
 */
@Injectable()
export class ChatService {
  // Map lưu thông tin users: socketId -> user info
  private users: Map<string, ChatUser> = new Map();
  // Lưu danh sách messages (có thể giới hạn số lượng để tránh memory leak)
  private messages: ChatMessage[] = [];
  private readonly MAX_MESSAGES = 100; // Giới hạn 100 messages

  /**
   * Thêm user mới vào chat room
   * @param socketId Socket ID của client
   * @param userName Tên của user
   * @returns Thông tin user vừa tạo
   */
  addUser(socketId: string, userName: string): ChatUser {
    const user: ChatUser = {
      id: socketId,
      name: userName,
    };
    this.users.set(socketId, user);
    return user;
  }

  /**
   * Xóa user khỏi chat room
   * @param socketId Socket ID của client
   * @returns Thông tin user vừa xóa (nếu có)
   */
  removeUser(socketId: string): ChatUser | undefined {
    const user = this.users.get(socketId);
    if (user) {
      this.users.delete(socketId);
    }
    return user;
  }

  /**
   * Lấy thông tin user theo socket ID
   */
  getUser(socketId: string): ChatUser | undefined {
    return this.users.get(socketId);
  }

  /**
   * Lấy danh sách tất cả users đang online
   */
  getAllUsers(): ChatUser[] {
    return Array.from(this.users.values());
  }

  /**
   * Thêm message mới vào chat
   * Tự động giới hạn số lượng messages để tránh memory leak
   * @param userId Socket ID của người gửi
   * @param message Nội dung message
   * @returns Message vừa tạo
   */
  addMessage(userId: string, message: string): ChatMessage | null {
    const user = this.getUser(userId);
    if (!user) {
      return null; // User không tồn tại
    }

    const chatMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      userId: user.id,
      userName: user.name,
      message: message.trim(),
      timestamp: new Date(),
    };

    this.messages.push(chatMessage);

    // Giới hạn số lượng messages, xóa các message cũ nhất
    if (this.messages.length > this.MAX_MESSAGES) {
      this.messages.shift();
    }

    return chatMessage;
  }

  /**
   * Lấy danh sách messages
   * @param limit Số lượng messages muốn lấy (mặc định lấy tất cả)
   */
  getMessages(limit?: number): ChatMessage[] {
    if (limit) {
      return this.messages.slice(-limit);
    }
    return [...this.messages];
  }
}

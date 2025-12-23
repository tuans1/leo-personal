import { Injectable } from '@nestjs/common';
import {
  RoomUser,
  RoomMessage,
  RoomName,
  AVAILABLE_ROOMS,
} from './multi-room-chat.types';

/**
 * Service quản lý users và messages trong các rooms
 * Sử dụng Socket.IO rooms để quản lý groups of sockets
 */
@Injectable()
export class MultiRoomChatService {
  // Map lưu thông tin users: socketId -> user info
  private users: Map<string, RoomUser> = new Map();
  // Map lưu messages theo room: roomName -> messages[]
  private roomMessages: Map<RoomName, RoomMessage[]> = new Map();
  private readonly MAX_MESSAGES_PER_ROOM = 100;

  constructor() {
    // Khởi tạo empty messages array cho mỗi room
    AVAILABLE_ROOMS.forEach((room) => {
      this.roomMessages.set(room, []);
    });
  }

  /**
   * Thêm user mới vào room
   * @param socketId Socket ID của client
   * @param userName Tên của user
   * @param roomName Room mà user muốn join
   * @returns Thông tin user vừa tạo
   */
  addUserToRoom(
    socketId: string,
    userName: string,
    roomName: RoomName,
  ): RoomUser {
    const user: RoomUser = {
      socketId,
      userName,
      currentRoom: roomName,
    };
    this.users.set(socketId, user);
    return user;
  }

  /**
   * Xóa user khỏi tất cả rooms
   * @param socketId Socket ID của client
   * @returns Thông tin user vừa xóa (nếu có)
   */
  removeUser(socketId: string): RoomUser | undefined {
    const user = this.users.get(socketId);
    if (user) {
      this.users.delete(socketId);
    }
    return user;
  }

  /**
   * Lấy thông tin user theo socket ID
   */
  getUser(socketId: string): RoomUser | undefined {
    return this.users.get(socketId);
  }

  /**
   * Lấy danh sách users trong một room cụ thể
   * @param roomName Tên room
   * @returns Danh sách users trong room đó
   */
  getUsersInRoom(roomName: RoomName): RoomUser[] {
    return Array.from(this.users.values()).filter(
      (user) => user.currentRoom === roomName,
    );
  }

  /**
   * Chuyển user sang room khác
   * @param socketId Socket ID của client
   * @param newRoomName Room mới
   * @returns User info sau khi switch (null nếu user không tồn tại)
   */
  switchUserRoom(socketId: string, newRoomName: RoomName): RoomUser | null {
    const user = this.users.get(socketId);
    if (!user) {
      return null;
    }

    user.currentRoom = newRoomName;
    return user;
  }

  /**
   * Thêm message mới vào room
   * @param socketId Socket ID của người gửi
   * @param roomName Room mà message được gửi vào
   * @param message Nội dung message
   * @returns Message vừa tạo (null nếu user không tồn tại hoặc không ở đúng room)
   */
  addMessageToRoom(
    socketId: string,
    roomName: RoomName,
    message: string,
  ): RoomMessage | null {
    const user = this.getUser(socketId);
    if (!user || user.currentRoom !== roomName) {
      return null; // User không tồn tại hoặc không ở đúng room
    }

    const roomMessage: RoomMessage = {
      id: `${Date.now()}-${Math.random()}`,
      roomName,
      userName: user.userName,
      message: message.trim(),
      timestamp: new Date(),
    };

    const messages = this.roomMessages.get(roomName) || [];
    messages.push(roomMessage);

    // Giới hạn số lượng messages, xóa các message cũ nhất
    if (messages.length > this.MAX_MESSAGES_PER_ROOM) {
      messages.shift();
    }

    this.roomMessages.set(roomName, messages);
    return roomMessage;
  }

  /**
   * Lấy danh sách messages trong một room
   * @param roomName Tên room
   * @param limit Số lượng messages muốn lấy (mặc định lấy tất cả)
   */
  getRoomMessages(roomName: RoomName, limit?: number): RoomMessage[] {
    const messages = this.roomMessages.get(roomName) || [];
    if (limit) {
      return messages.slice(-limit);
    }
    return [...messages];
  }
}

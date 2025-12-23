import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MultiRoomChatService } from './multi-room-chat.service';
import {
  MultiRoomChatEvents,
  AVAILABLE_ROOMS,
  RoomName,
} from './multi-room-chat.types';
import type {
  JoinRoomData,
  SendMessageData,
  SwitchRoomData,
} from './multi-room-chat.types';

/**
 * WebSocket Gateway cho Multi-Room Chat
 * Sử dụng Socket.IO rooms để quản lý groups of sockets
 * Concepts: socket.join('room-name'), io.to('room-name').emit()
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MultiRoomChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: MultiRoomChatService) {}

  /**
   * Xử lý khi client kết nối
   * Chưa join room ngay, phải đợi client emit JOIN_ROOM với userName và roomName
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(_client: Socket) {
    // Chưa làm gì, đợi client gửi userName và roomName qua event JOIN_ROOM
  }

  /**
   * Xử lý khi client ngắt kết nối
   * Xóa user khỏi room và thông báo cho các users còn lại trong room đó
   */
  handleDisconnect(client: Socket) {
    const user = this.chatService.removeUser(client.id);
    if (user) {
      // Thông báo cho tất cả clients trong room đó (không phải tất cả clients)
      this.server
        .to(user.currentRoom)
        .emit(MultiRoomChatEvents.USER_LEFT_ROOM, {
          userName: user.userName,
          roomName: user.currentRoom,
          timestamp: new Date(),
        });

      // Cập nhật danh sách users trong room đó
      this.broadcastRoomUsersUpdate(user.currentRoom);
    }
  }

  /**
   * Xử lý khi client muốn join room
   * Client sẽ gửi userName và roomName qua event này
   * Sử dụng socket.join(roomName) để join Socket.IO room
   */
  @SubscribeMessage(MultiRoomChatEvents.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomData,
  ) {
    const userName = data.userName?.trim();
    const roomName = data.roomName;

    // Validate userName
    if (!userName || userName.length === 0) {
      client.emit('error', { message: 'Tên không hợp lệ' });
      return;
    }

    // Validate roomName
    if (!AVAILABLE_ROOMS.includes(roomName)) {
      client.emit('error', {
        message: `Room không hợp lệ. Chỉ có: ${AVAILABLE_ROOMS.join(', ')}`,
      });
      return;
    }

    // Lấy user hiện tại (nếu đã tồn tại)
    const existingUser = this.chatService.getUser(client.id);
    const previousRoom = existingUser?.currentRoom;

    // Nếu user đã ở trong một room khác, leave room cũ trước
    if (previousRoom && previousRoom !== roomName) {
      void client.leave(previousRoom);
      // Thông báo cho room cũ biết user đã rời
      this.server.to(previousRoom).emit(MultiRoomChatEvents.USER_LEFT_ROOM, {
        userName: existingUser.userName,
        roomName: previousRoom,
        timestamp: new Date(),
      });
      this.broadcastRoomUsersUpdate(previousRoom);
    }

    // Join Socket.IO room - đây là cách Socket.IO quản lý groups of sockets
    void client.join(roomName);

    // Thêm/update user vào room mới
    const user = this.chatService.addUserToRoom(client.id, userName, roomName);

    // Gửi lại danh sách messages hiện tại của room cho user mới
    const messages = this.chatService.getRoomMessages(roomName);
    client.emit('room_messages_history', { roomName, messages });

    // Thông báo cho TẤT CẢ clients trong room này (không phải tất cả clients)
    // io.to(roomName).emit() chỉ gửi cho clients đã join room đó
    this.server.to(roomName).emit(MultiRoomChatEvents.USER_JOINED_ROOM, {
      userName: user.userName,
      roomName: roomName,
      timestamp: new Date(),
    });

    // Cập nhật danh sách users trong room
    this.broadcastRoomUsersUpdate(roomName);
  }

  /**
   * Xử lý khi client muốn switch sang room khác
   * Tương tự join room nhưng có thể đã có user info
   */
  @SubscribeMessage(MultiRoomChatEvents.SWITCH_ROOM)
  handleSwitchRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SwitchRoomData,
  ) {
    const newRoomName = data.newRoomName;

    // Validate roomName
    if (!AVAILABLE_ROOMS.includes(newRoomName)) {
      client.emit('error', {
        message: `Room không hợp lệ. Chỉ có: ${AVAILABLE_ROOMS.join(', ')}`,
      });
      return;
    }

    const user = this.chatService.getUser(client.id);
    if (!user) {
      client.emit('error', { message: 'Bạn chưa join room nào' });
      return;
    }

    const previousRoom = user.currentRoom;

    // Nếu đã ở room đó rồi thì không cần làm gì
    if (previousRoom === newRoomName) {
      return;
    }

    // Leave room cũ
    void client.leave(previousRoom);
    this.server.to(previousRoom).emit(MultiRoomChatEvents.USER_LEFT_ROOM, {
      userName: user.userName,
      roomName: previousRoom,
      timestamp: new Date(),
    });
    this.broadcastRoomUsersUpdate(previousRoom);

    // Join room mới
    void client.join(newRoomName);
    this.chatService.switchUserRoom(client.id, newRoomName);

    // Gửi messages history của room mới
    const messages = this.chatService.getRoomMessages(newRoomName);
    client.emit('room_messages_history', { roomName: newRoomName, messages });

    // Thông báo cho room mới
    this.server.to(newRoomName).emit(MultiRoomChatEvents.USER_JOINED_ROOM, {
      userName: user.userName,
      roomName: newRoomName,
      timestamp: new Date(),
    });
    this.broadcastRoomUsersUpdate(newRoomName);
  }

  /**
   * Xử lý khi client gửi message
   * Chỉ gửi message trong room mà user đang ở
   * Sử dụng io.to(roomName).emit() để chỉ gửi cho clients trong room đó
   */
  @SubscribeMessage(MultiRoomChatEvents.SEND_MESSAGE)
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageData,
  ) {
    const messageText = data.message?.trim();
    const roomName = data.roomName;

    // Validate message
    if (!messageText || messageText.length === 0) {
      client.emit('error', { message: 'Message không được để trống' });
      return;
    }

    // Validate roomName
    if (!AVAILABLE_ROOMS.includes(roomName)) {
      client.emit('error', { message: 'Room không hợp lệ' });
      return;
    }

    // Kiểm tra user đã join room chưa
    const user = this.chatService.getUser(client.id);
    if (!user) {
      client.emit('error', { message: 'Bạn chưa join room' });
      return;
    }

    // Kiểm tra user có ở đúng room không
    if (user.currentRoom !== roomName) {
      client.emit('error', {
        message: 'Bạn không ở trong room này',
      });
      return;
    }

    // Thêm message vào room
    const roomMessage = this.chatService.addMessageToRoom(
      client.id,
      roomName,
      messageText,
    );
    if (!roomMessage) {
      client.emit('error', { message: 'Không thể gửi message' });
      return;
    }

    // Chỉ gửi message cho TẤT CẢ clients trong room này (không phải tất cả clients)
    // io.to(roomName).emit() là cách Socket.IO gửi message cho một group cụ thể
    this.server.to(roomName).emit(MultiRoomChatEvents.NEW_MESSAGE, {
      id: roomMessage.id,
      roomName: roomMessage.roomName,
      userName: roomMessage.userName,
      message: roomMessage.message,
      timestamp: roomMessage.timestamp,
    });
  }

  /**
   * Broadcast danh sách users trong room cho tất cả clients trong room đó
   * Helper method để cập nhật UI danh sách users
   */
  private broadcastRoomUsersUpdate(roomName: RoomName): void {
    const users = this.chatService.getUsersInRoom(roomName);
    this.server.to(roomName).emit(MultiRoomChatEvents.ROOM_USERS_UPDATE, {
      roomName,
      users: users.map((u) => ({ userName: u.userName })),
    });
  }
}

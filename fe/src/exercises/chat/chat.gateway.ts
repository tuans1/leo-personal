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
import { ChatService } from './chat.service';
import { ChatEvents } from './chat.types';
import type { JoinRoomData, SendMessageData } from './chat.types';

/**
 * WebSocket Gateway cho Chat Room
 * Xử lý: join room, leave room, send message, broadcast messages
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  /**
   * Xử lý khi client kết nối
   * Chưa join room ngay, phải đợi client emit event JOIN_ROOM với userName
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(_client: Socket) {
    // Chưa làm gì, đợi client gửi userName qua event JOIN_ROOM
  }

  /**
   * Xử lý khi client ngắt kết nối
   * Xóa user khỏi room và thông báo cho các users còn lại
   */
  handleDisconnect(client: Socket) {
    const user = this.chatService.removeUser(client.id);
    if (user) {
      // Thông báo cho tất cả clients (trừ client vừa disconnect) biết có user rời đi
      this.server.emit(ChatEvents.USER_LEFT, {
        userName: user.name,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Xử lý khi client muốn join room
   * Client sẽ gửi userName qua event này
   */
  @SubscribeMessage(ChatEvents.USER_JOIN)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomData,
  ) {
    const userName = data.userName?.trim();

    // Validate userName
    if (!userName || userName.length === 0) {
      client.emit('error', { message: 'Tên không hợp lệ' });
      return;
    }

    // Thêm user vào room
    const user = this.chatService.addUser(client.id, userName);

    // Gửi lại danh sách messages hiện tại cho user mới
    const messages = this.chatService.getMessages();
    client.emit('messages_history', { messages });

    // Thông báo cho TẤT CẢ clients (bao gồm cả user vừa join) biết có user mới
    this.server.emit(ChatEvents.USER_JOINED, {
      userName: user.name,
      timestamp: new Date(),
    });
  }

  /**
   * Xử lý khi client gửi message
   * Validate message và broadcast cho tất cả clients
   */
  @SubscribeMessage(ChatEvents.SEND_MESSAGE)
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageData,
  ) {
    const messageText = data.message?.trim();

    // Validate message
    if (!messageText || messageText.length === 0) {
      client.emit('error', { message: 'Message không được để trống' });
      return;
    }

    // Kiểm tra user đã join room chưa
    const user = this.chatService.getUser(client.id);
    if (!user) {
      client.emit('error', { message: 'Bạn chưa join room' });
      return;
    }

    // Thêm message vào danh sách
    const chatMessage = this.chatService.addMessage(client.id, messageText);
    if (!chatMessage) {
      client.emit('error', { message: 'Không thể gửi message' });
      return;
    }

    // Broadcast message cho TẤT CẢ clients (bao gồm cả người gửi)
    this.server.emit(ChatEvents.NEW_MESSAGE, {
      id: chatMessage.id,
      userName: chatMessage.userName,
      message: chatMessage.message,
      timestamp: chatMessage.timestamp,
    });
  }
}

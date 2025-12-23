import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CounterService } from './counter.service';
import { SocketEvents } from './counter.types';

/**
 * WebSocket Gateway - Xử lý kết nối và ngắt kết nối của clients
 * Khi có client connect/disconnect, gateway sẽ cập nhật counter và broadcast cho tất cả clients
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class CounterGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly counterService: CounterService) {}

  /**
   * Xử lý khi có client mới kết nối
   * - Tăng counter lên 1
   * - Broadcast số lượng mới cho TẤT CẢ clients đang online (bao gồm cả client vừa connect)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(_client: Socket) {
    const newCount = this.counterService.incrementCount();
    // server.emit() sẽ gửi event cho tất cả clients, kể cả client vừa connect
    this.server.emit(SocketEvents.ONLINE_COUNT_UPDATE, {
      count: newCount,
    });
  }

  /**
   * Xử lý khi client ngắt kết nối
   * - Giảm counter xuống 1
   * - Broadcast số lượng mới cho TẤT CẢ clients còn lại
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: Socket) {
    const newCount = this.counterService.decrementCount();
    // Broadcast cho các clients còn lại biết số lượng đã thay đổi
    this.server.emit(SocketEvents.ONLINE_COUNT_UPDATE, {
      count: newCount,
    });
  }
}

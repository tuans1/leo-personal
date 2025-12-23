# Real-time Counter Exercise

## Mục tiêu

Hiển thị số lượng users đang online real-time sử dụng WebSocket (Socket.IO).

## Cách hoạt động

### Flow tổng quan

```
Client A connect → Backend tăng counter → Broadcast cho TẤT CẢ clients
Client B connect → Backend tăng counter → Broadcast cho TẤT CẢ clients
Client A disconnect → Backend giảm counter → Broadcast cho TẤT CẢ clients
```

### Backend (NestJS)

1. **CounterGateway** (`counter.gateway.ts)
   - Là WebSocket Gateway, xử lý kết nối/ngắt kết nối
   - Khi client connect: gọi `counterService.incrementCount()` → emit event cho tất cả clients
   - Khi client disconnect: gọi `counterService.decrementCount()` → emit event cho tất cả clients
   - Sử dụng `server.emit()` để broadcast (gửi cho tất cả clients)

2. **CounterService** (`counter.service.ts`)
   - Quản lý state: lưu số lượng clients đang online trong memory
   - Methods:
     - `incrementCount()`: Tăng counter khi có client mới
     - `decrementCount()`: Giảm counter khi client rời đi
     - `getCount()`: Lấy số lượng hiện tại

3. **SocketEvents** (`counter.types.ts`)
   - Enum định nghĩa tên các events để tránh hardcode string
   - `ONLINE_COUNT_UPDATE`: Event được emit khi số lượng thay đổi

### Frontend (Next.js)

1. **Socket Client** (`socket-client.ts`)
   - Singleton pattern: chỉ tạo 1 socket instance duy nhất
   - Tự động reconnect nếu mất kết nối
   - Config: websocket transport, reconnection settings

2. **Counter Page** (`page.tsx`)
   - Component React sử dụng hooks:
     - `useState`: Lưu `onlineCount` và `isConnected`
     - `useEffect`: Setup socket listeners khi mount, cleanup khi unmount
   - Listeners:
     - `connect`: Cập nhật trạng thái connected
     - `disconnect`: Cập nhật trạng thái disconnected
     - `ONLINE_COUNT_UPDATE`: Cập nhật số lượng khi nhận event từ server

## Socket Events

### `ONLINE_COUNT_UPDATE`

- **Emit từ**: Backend (server)
- **Nhận bởi**: Tất cả clients
- **Payload**: `{ count: number }`
- **Khi nào**: Mỗi khi có client connect hoặc disconnect

## Cấu trúc thư mục

```
backend/
  src/exercises/counter/
    ├── counter.gateway.ts    # WebSocket Gateway
    ├── counter.service.ts    # Business logic
    ├── counter.module.ts     # NestJS Module
    ├── counter.types.ts      # Types & Enums
    └── README.md            # Documentation này

frontend/
  app/exercises/counter/
    └── page.tsx             # Counter UI component
  app/lib/socket/
    ├── socket-client.ts     # Socket client singleton
    └── socket-events.ts     # Event constants
```

## Test

1. Start backend: `cd leo-ws-be && npm run start:dev`
2. Start frontend: `cd leo-ws-fe && npm run dev`
3. Mở nhiều browser tabs/windows tại `http://localhost:3001/exercises/counter`
4. Quan sát counter tăng/giảm real-time khi mở/đóng tabs

## Lưu ý

- Counter lưu trong memory → sẽ reset khi server restart
- Mỗi browser tab = 1 client connection
- `server.emit()` broadcast cho tất cả clients, kể cả client vừa trigger event

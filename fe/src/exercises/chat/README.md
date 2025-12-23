# Live Chat Exercise

## Mục tiêu
Tạo chat room đơn giản với các tính năng:
- User nhập tên khi vào
- Gửi và nhận messages realtime
- Hiển thị tên người gửi
- Thông báo khi có người join/leave

## Cách hoạt động

### Flow tổng quan

```
Client A connect → Chưa join room
  ↓
Client A emit USER_JOIN với userName
  ↓
Backend thêm user vào room → Emit USER_JOINED cho tất cả clients
  ↓
Backend gửi messages_history cho Client A
  ↓
Client A emit SEND_MESSAGE
  ↓
Backend lưu message → Emit NEW_MESSAGE cho tất cả clients
  ↓
Client A disconnect → Backend xóa user → Emit USER_LEFT cho các clients còn lại
```

### Backend Components

1. **ChatGateway** (`chat.gateway.ts`)
   - `handleConnection()`: Khi client connect, chưa join room ngay
   - Phải đợi client emit `USER_JOIN` với userName
   - `handleDisconnect()`: Xóa user và thông báo cho các clients còn lại
   - `handleJoinRoom()`: Xử lý khi client muốn join room
     - Validate userName
     - Thêm user vào room
     - Gửi lịch sử messages cho user mới
     - Broadcast `USER_JOINED` cho tất cả clients
   - `handleSendMessage()`: Xử lý khi client gửi message
     - Validate message và user
     - Lưu message vào service
     - Broadcast `NEW_MESSAGE` cho tất cả clients

2. **ChatService** (`chat.service.ts`)
   - Quản lý users: Map `socketId -> user info`
   - Quản lý messages: Array lưu tối đa 100 messages
   - Methods:
     - `addUser()`: Thêm user mới vào room
     - `removeUser()`: Xóa user khỏi room
     - `getUser()`: Lấy thông tin user
     - `addMessage()`: Thêm message mới (tự động giới hạn số lượng)
     - `getMessages()`: Lấy danh sách messages

3. **ChatTypes** (`chat.types.ts`)
   - Enums: `ChatEvents` định nghĩa tên các events
   - Interfaces: `ChatUser`, `ChatMessage`, `JoinRoomData`, `SendMessageData`

## Socket Events

### Client → Server

#### `USER_JOIN`
- **Payload**: `{ userName: string }`
- **Khi nào**: Client muốn join room
- **Response**: 
  - Server gửi `messages_history` cho client này
  - Server emit `USER_JOINED` cho tất cả clients

#### `SEND_MESSAGE`
- **Payload**: `{ message: string }`
- **Khi nào**: Client muốn gửi message
- **Response**: Server emit `NEW_MESSAGE` cho tất cả clients

### Server → Client

#### `NEW_MESSAGE`
- **Payload**: `{ id, userName, message, timestamp }`
- **Khi nào**: Có message mới được gửi
- **Nhận bởi**: Tất cả clients trong room

#### `USER_JOINED`
- **Payload**: `{ userName, timestamp }`
- **Khi nào**: Có user mới join room
- **Nhận bởi**: Tất cả clients (bao gồm cả user vừa join)

#### `USER_LEFT`
- **Payload**: `{ userName, timestamp }`
- **Khi nào**: Có user rời khỏi room
- **Nhận bởi**: Tất cả clients còn lại

#### `messages_history`
- **Payload**: `{ messages: ChatMessage[] }`
- **Khi nào**: User vừa join room
- **Nhận bởi**: Chỉ user vừa join

#### `error`
- **Payload**: `{ message: string }`
- **Khi nào**: Có lỗi xảy ra (validate failed, etc.)
- **Nhận bởi**: Client gây ra lỗi

## Cấu trúc thư mục

```
backend/
  src/exercises/chat/
    ├── chat.gateway.ts    # WebSocket Gateway
    ├── chat.service.ts    # Business logic
    ├── chat.module.ts     # NestJS Module
    ├── chat.types.ts      # Types & Enums
    └── README.md          # Documentation này
```

## Lưu ý

- Messages lưu trong memory → sẽ mất khi server restart
- Giới hạn 100 messages để tránh memory leak
- User phải emit `USER_JOIN` trước khi có thể gửi message
- Mỗi socket connection = 1 user trong room
- `server.emit()` broadcast cho tất cả clients, kể cả client trigger event

## Test

1. Start backend: `cd leo-ws-be && npm run start:dev`
2. Start frontend: `cd leo-ws-fe && npm run dev`
3. Mở nhiều browser tabs tại `http://localhost:3001/exercises/chat`
4. Nhập tên khác nhau ở mỗi tab
5. Gửi messages và quan sát real-time updates
6. Đóng tab để test thông báo user left


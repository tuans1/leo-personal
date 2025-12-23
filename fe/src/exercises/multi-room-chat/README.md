# Multi-Room Chat Exercise

## Mục tiêu
Tạo chat application với nhiều rooms (channels) giống Slack:
- 3 rooms: "general", "tech", "random"
- User chọn room để join
- Messages chỉ gửi trong room đó
- Hiển thị users trong mỗi room
- User có thể switch rooms

## Concepts học được

### Socket.IO Rooms
- **Rooms = Groups of sockets**: Một room là một nhóm các socket connections
- **`socket.join('room-name')`**: Thêm socket vào một room cụ thể
- **`io.to('room-name').emit()`**: Gửi event chỉ cho các sockets trong room đó
- **`socket.leave('room-name')`**: Xóa socket khỏi room

### So sánh với Single Room Chat

| Single Room | Multi-Room |
|------------|------------|
| `server.emit()` → Tất cả clients | `server.to(roomName).emit()` → Chỉ clients trong room |
| Không cần join room | Phải `socket.join(roomName)` |
| Tất cả users cùng 1 room | Nhiều rooms khác nhau |

## Cách hoạt động

### Flow tổng quan

```
Client A connect → Chưa join room
  ↓
Client A emit JOIN_ROOM với userName + roomName = "general"
  ↓
Backend: socket.join("general") → Thêm user vào room
  ↓
Backend: io.to("general").emit(USER_JOINED_ROOM) → Chỉ clients trong "general" nhận được
  ↓
Client A emit SEND_MESSAGE với roomName = "general"
  ↓
Backend: io.to("general").emit(NEW_MESSAGE) → Chỉ clients trong "general" nhận được
  ↓
Client A emit SWITCH_ROOM với newRoomName = "tech"
  ↓
Backend: socket.leave("general") → socket.join("tech")
  ↓
Backend: io.to("tech").emit(USER_JOINED_ROOM) → Chỉ clients trong "tech" nhận được
```

### Backend Components

1. **MultiRoomChatGateway** (`multi-room-chat.gateway.ts`)
   - `handleJoinRoom()`: 
     - Validate userName và roomName
     - `socket.join(roomName)` - Join Socket.IO room
     - Lưu user info vào service
     - `server.to(roomName).emit()` - Broadcast cho room đó
   - `handleSwitchRoom()`:
     - `socket.leave(previousRoom)` - Leave room cũ
     - `socket.join(newRoom)` - Join room mới
     - Update user info
     - Broadcast cho cả 2 rooms
   - `handleSendMessage()`:
     - Validate user đang ở đúng room
     - `server.to(roomName).emit()` - Chỉ gửi cho room đó
   - `broadcastRoomUsersUpdate()`: Helper để cập nhật danh sách users

2. **MultiRoomChatService** (`multi-room-chat.service.ts`)
   - Quản lý users: Map `socketId -> user info` (có currentRoom)
   - Quản lý messages: Map `roomName -> messages[]` (mỗi room có messages riêng)
   - Methods:
     - `addUserToRoom()`: Thêm user vào room
     - `switchUserRoom()`: Chuyển user sang room khác
     - `getUsersInRoom()`: Lấy danh sách users trong room
     - `addMessageToRoom()`: Thêm message vào room cụ thể
     - `getRoomMessages()`: Lấy messages của room

3. **MultiRoomChatTypes** (`multi-room-chat.types.ts`)
   - `AVAILABLE_ROOMS`: Const array định nghĩa 3 rooms
   - `RoomName`: Type cho tên room
   - Enums và DTOs cho các events

## Socket Events

### Client → Server

#### `JOIN_ROOM`
- **Payload**: `{ userName: string, roomName: RoomName }`
- **Khi nào**: Client muốn join một room
- **Response**: 
  - Server gửi `room_messages_history` cho client này
  - Server emit `USER_JOINED_ROOM` cho room đó
  - Server emit `ROOM_USERS_UPDATE` cho room đó

#### `SWITCH_ROOM`
- **Payload**: `{ newRoomName: RoomName }`
- **Khi nào**: Client muốn chuyển sang room khác
- **Response**: 
  - Server leave room cũ, join room mới
  - Broadcast cho cả 2 rooms

#### `SEND_MESSAGE`
- **Payload**: `{ message: string, roomName: RoomName }`
- **Khi nào**: Client muốn gửi message
- **Response**: Server emit `NEW_MESSAGE` cho room đó

### Server → Client

#### `NEW_MESSAGE`
- **Payload**: `{ id, roomName, userName, message, timestamp }`
- **Khi nào**: Có message mới trong room
- **Nhận bởi**: Chỉ clients trong room đó

#### `USER_JOINED_ROOM`
- **Payload**: `{ userName, roomName, timestamp }`
- **Khi nào**: Có user mới join room
- **Nhận bởi**: Chỉ clients trong room đó

#### `USER_LEFT_ROOM`
- **Payload**: `{ userName, roomName, timestamp }`
- **Khi nào**: Có user rời khỏi room
- **Nhận bởi**: Chỉ clients trong room đó

#### `ROOM_USERS_UPDATE`
- **Payload**: `{ roomName, users: [{ userName }] }`
- **Khi nào**: Danh sách users trong room thay đổi
- **Nhận bởi**: Chỉ clients trong room đó

#### `room_messages_history`
- **Payload**: `{ roomName, messages: RoomMessage[] }`
- **Khi nào**: User vừa join/switch room
- **Nhận bởi**: Chỉ user vừa join/switch

## Cấu trúc thư mục

```
backend/
  src/exercises/multi-room-chat/
    ├── multi-room-chat.gateway.ts    # WebSocket Gateway
    ├── multi-room-chat.service.ts    # Business logic
    ├── multi-room-chat.module.ts     # NestJS Module
    ├── multi-room-chat.types.ts      # Types & Enums
    └── README.md                     # Documentation này
```

## Key Differences với Single Room Chat

1. **Socket.IO Rooms**:
   - Single room: Không dùng rooms, dùng `server.emit()`
   - Multi-room: Dùng `socket.join()` và `server.to(roomName).emit()`

2. **Message Storage**:
   - Single room: 1 array messages cho tất cả
   - Multi-room: Map `roomName -> messages[]` (mỗi room riêng)

3. **User Management**:
   - Single room: User chỉ có userName
   - Multi-room: User có userName + currentRoom

4. **Broadcasting**:
   - Single room: `server.emit()` → Tất cả clients
   - Multi-room: `server.to(roomName).emit()` → Chỉ room đó

## Test

1. Start backend: `cd leo-ws-be && npm run start:dev`
2. Start frontend: `cd leo-ws-fe && npm run dev`
3. Mở nhiều browser tabs tại `http://localhost:3001/exercises/multi-room-chat`
4. Join các rooms khác nhau
5. Gửi messages và quan sát chỉ room đó nhận được
6. Switch rooms và quan sát messages khác nhau
7. Kiểm tra danh sách users trong mỗi room

## Lưu ý

- Messages lưu trong memory → sẽ mất khi server restart
- Mỗi room có giới hạn 100 messages
- User chỉ có thể ở 1 room tại một thời điểm
- `socket.join()` và `socket.leave()` là methods của Socket.IO, không phải custom logic
- `server.to(roomName)` chỉ gửi cho sockets đã join room đó


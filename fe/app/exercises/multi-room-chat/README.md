# Multi-Room Chat - Frontend

## Cách hoạt động

### Component Flow

```
Page mount → useEffect setup socket listeners
  ↓
User nhập tên + chọn room → Submit → Emit JOIN_ROOM
  ↓
Nhận room_messages_history → Hiển thị lịch sử messages của room
  ↓
Nhận USER_JOINED_ROOM → Hiển thị thông báo user joined
  ↓
Nhận ROOM_USERS_UPDATE → Cập nhật danh sách users
  ↓
User gửi message → Emit SEND_MESSAGE với roomName
  ↓
Nhận NEW_MESSAGE (chỉ trong room hiện tại) → Thêm vào danh sách
  ↓
User click switch room → Emit SWITCH_ROOM
  ↓
Nhận room_messages_history của room mới → Load messages mới
  ↓
Page unmount → Cleanup listeners
```

### State Management

- `userName`: Tên của user hiện tại
- `isJoined`: Trạng thái đã join room chưa
- `currentRoom`: Room hiện tại đang ở (null nếu chưa join)
- `message`: Nội dung message đang nhập
- `messages`: Danh sách messages của room hiện tại
- `roomUsers`: Map `roomName -> users[]` cho tất cả rooms
- `isConnected`: Trạng thái kết nối socket

### Socket Events Flow

1. **Join Room**:
   - User nhập tên và chọn room
   - Emit `JOIN_ROOM` với userName và roomName
   - Nhận `room_messages_history` → Load messages
   - Nhận `USER_JOINED_ROOM` → Hiển thị thông báo
   - Nhận `ROOM_USERS_UPDATE` → Cập nhật danh sách users

2. **Send Message**:
   - User nhập message và submit
   - Emit `SEND_MESSAGE` với message và roomName
   - Nhận `NEW_MESSAGE` (chỉ nếu roomName === currentRoom) → Thêm vào danh sách

3. **Switch Room**:
   - User click vào room khác trong sidebar
   - Emit `SWITCH_ROOM` với newRoomName
   - Clear messages hiện tại
   - Nhận `room_messages_history` của room mới → Load messages mới
   - Nhận `ROOM_USERS_UPDATE` → Cập nhật danh sách users

4. **User Join/Leave Notifications**:
   - Nhận `USER_JOINED_ROOM` → Hiển thị "X đã tham gia room"
   - Nhận `USER_LEFT_ROOM` → Hiển thị "X đã rời khỏi room"
   - Chỉ hiển thị nếu roomName === currentRoom

### UI Components

1. **Join Form**:
   - Input tên
   - 3 buttons để chọn room ban đầu
   - Submit để join

2. **Sidebar**:
   - **Room List**: Danh sách 3 rooms, highlight room hiện tại
   - **Users List**: Danh sách users trong room hiện tại với số lượng

3. **Main Chat Area**:
   - **Room Header**: Hiển thị tên room hiện tại
   - **Messages List**: 
     - Messages của room hiện tại
     - System notifications (join/leave)
     - Phân biệt message của mình và người khác
   - **Message Input**: Input để gửi message trong room hiện tại

### Key Features

- **Room Selection**: User chọn room khi join lần đầu
- **Room Switching**: Click vào room trong sidebar để switch
- **Room-specific Messages**: Chỉ hiển thị messages của room hiện tại
- **Room-specific Users**: Hiển thị users trong room hiện tại
- **Real-time Updates**: Tất cả updates real-time qua WebSocket

### Filtering Logic

- Messages chỉ hiển thị nếu `msg.roomName === currentRoom`
- System notifications chỉ hiển thị nếu `notification.roomName === currentRoom`
- Users list chỉ hiển thị users của `currentRoom`
- Khi switch room, clear messages và load lại từ server

### Cleanup

Khi component unmount:
- Xóa tất cả socket listeners
- Disconnect socket (nếu cần)
- Reset state

## Styling

- Sử dụng Tailwind CSS
- Responsive design với sidebar và main area
- Dark mode support
- Gradient background
- Smooth animations
- Room buttons với active state


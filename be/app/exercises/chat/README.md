# Live Chat - Frontend

## Cách hoạt động

### Component Flow

```
Page mount → useEffect setup socket listeners
  ↓
User nhập tên → Submit form → Emit USER_JOIN
  ↓
Nhận messages_history → Hiển thị lịch sử messages
  ↓
Nhận USER_JOINED → Hiển thị thông báo user joined
  ↓
User nhập message → Submit form → Emit SEND_MESSAGE
  ↓
Nhận NEW_MESSAGE → Thêm vào danh sách messages → UI update
  ↓
Nhận USER_LEFT → Hiển thị thông báo user left
  ↓
Page unmount → Cleanup listeners
```

### State Management

- `userName`: Tên của user hiện tại
- `isJoined`: Trạng thái đã join room chưa
- `message`: Nội dung message đang nhập
- `messages`: Danh sách messages và system notifications
- `isConnected`: Trạng thái kết nối socket

### Socket Events Flow

1. **Join Room**:
   - User nhập tên và submit
   - Emit `USER_JOIN` với userName
   - Nhận `messages_history` → Load lịch sử messages
   - Nhận `USER_JOINED` → Hiển thị thông báo

2. **Send Message**:
   - User nhập message và submit
   - Emit `SEND_MESSAGE` với message content
   - Nhận `NEW_MESSAGE` → Thêm vào danh sách

3. **User Join/Leave Notifications**:
   - Nhận `USER_JOINED` → Hiển thị "X đã tham gia"
   - Nhận `USER_LEFT` → Hiển thị "X đã rời khỏi"

### UI Features

- **Join Form**: Input tên trước khi vào chat
- **Messages List**: 
  - Hiển thị messages với tên người gửi
  - Phân biệt message của mình (màu tím) và của người khác (màu xám)
  - Hiển thị timestamp
  - System notifications (join/leave) ở giữa
- **Message Input**: Input để gửi message
- **Auto Scroll**: Tự động scroll xuống message mới nhất
- **Connection Status**: Indicator hiển thị trạng thái kết nối

### Message Types

1. **Regular Message**:
   ```typescript
   {
     id: string;
     userName: string;
     message: string;
     timestamp: Date;
   }
   ```

2. **System Notification**:
   ```typescript
   {
     userName: string;
     timestamp: Date;
     type: "join" | "leave";
   }
   ```

### Cleanup

Khi component unmount:
- Xóa tất cả socket listeners
- Disconnect socket (nếu cần)
- Reset state

## UI Components

- **Header**: Title và connection status
- **Join Form**: Form nhập tên (hiển thị khi chưa join)
- **Messages Area**: Scrollable area hiển thị messages
- **Input Area**: Form gửi message (hiển thị khi đã join)
- **Footer**: Link quay lại trang chủ

## Styling

- Sử dụng Tailwind CSS
- Responsive design
- Dark mode support
- Gradient background
- Smooth animations


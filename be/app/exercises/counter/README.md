# Real-time Counter - Frontend

## Cách hoạt động

### Component Flow

```
Page mount → useEffect chạy
  ↓
Lấy socket client (singleton)
  ↓
Đăng ký listeners:
  - connect: Cập nhật isConnected = true
  - disconnect: Cập nhật isConnected = false
  - ONLINE_COUNT_UPDATE: Cập nhật onlineCount
  ↓
Khi nhận event từ server → Update state → UI re-render
  ↓
Page unmount → Cleanup listeners → Disconnect socket
```

### Socket Client Singleton

- `getSocketClient()`: Trả về cùng 1 socket instance cho toàn bộ app
- Lợi ích: Tránh tạo nhiều connections không cần thiết
- Tự động reconnect nếu mất kết nối

### State Management

- `onlineCount`: Số lượng users đang online (từ server)
- `isConnected`: Trạng thái kết nối socket (true/false)

### Event Listeners

1. **connect**: Khi socket kết nối thành công
2. **disconnect**: Khi socket bị ngắt kết nối
3. **ONLINE_COUNT_UPDATE**: Khi server gửi số lượng mới

### Cleanup

Khi component unmount, cần:

- Xóa tất cả listeners (`socket.off()`)
- Disconnect socket để giải phóng resources

## UI Features

- Hiển thị số lượng với animation
- Status indicator (connected/disconnected)
- Responsive design với Tailwind CSS
- Dark mode support

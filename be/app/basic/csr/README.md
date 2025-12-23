# Client-Side Rendering (CSR) Example

## Tổng quan

Ví dụ này minh họa cách **Client-Side Rendering (CSR)** hoạt động trong Next.js App Router.

## CSR là gì?

**Client-Side Rendering (CSR)** là phương pháp render nội dung trang web hoàn toàn trên trình duyệt (client) bằng JavaScript, thay vì render trên server.

## Quy trình hoạt động

### 1. Initial Page Load

```
Browser Request
    ↓
Server Response (HTML skeleton)
    ↓
Browser tải JavaScript bundle
    ↓
React hydrates component
    ↓
Component render lần đầu (với state mặc định)
    ↓
useEffect chạy → Fetch data từ API
    ↓
State update → Re-render với data
```

### 2. File Loading Sequence

1. **HTML**: Server gửi HTML tối thiểu (chỉ có structure, không có data)
2. **JavaScript**: Browser tải JS bundle chứa:
   - React runtime
   - Component code
   - Logic xử lý
3. **CSS**: Load cùng với JS hoặc inline
4. **Data**: Fetch từ API sau khi JS đã execute

### 3. Render Process

#### Initial Render (First Paint)
- Component render với state mặc định
- UI hiển thị loading state hoặc empty state
- Chưa có data thực tế

#### After Data Fetch
- `useEffect` trigger data fetching
- State được update với data mới
- Component re-render với data
- UI hiển thị nội dung đầy đủ

#### User Interaction
- User tương tác (click, input, etc.)
- Event handler update state
- Component re-render
- UI update tương ứng

## Code Structure

### Component Directive

```typescript
"use client";
```

**Bắt buộc** trong Next.js App Router để đánh dấu component chạy trên client.

### State Management

```typescript
const [users, setUsers] = useState<User[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(true);
```

State quản lý data và UI state.

### Data Fetching

```typescript
useEffect(() => {
  const loadData = async () => {
    const usersData = await fetchUsers();
    setUsers(usersData);
  };
  loadData();
}, []);
```

Data fetching xảy ra trong `useEffect`, chạy sau khi component mount trên client.

## Ưu điểm của CSR

1. **Reduced Server Load**: Server chỉ cần gửi HTML skeleton
2. **Rich Interactivity**: Dễ dàng tạo interactive UI
3. **Fast Navigation**: Client-side routing nhanh (không cần reload)
4. **Caching**: JS bundle có thể cache ở CDN

## Nhược điểm của CSR

1. **Slower Initial Load**: Phải tải JS trước khi render
2. **SEO**: Search engines có thể không index được content (đã cải thiện với modern crawlers)
3. **Empty Initial HTML**: HTML ban đầu không có content
4. **JavaScript Required**: Không hoạt động nếu JS bị disable

## So sánh với SSR

| Aspect | CSR | SSR |
|--------|-----|-----|
| **Render Location** | Client (Browser) | Server |
| **Initial HTML** | Minimal/Empty | Full content |
| **Data Fetching** | Client-side | Server-side |
| **Time to Interactive** | Slower | Faster |
| **SEO** | Moderate | Excellent |
| **Server Load** | Low | High |
| **Interactivity** | High | Moderate |

## Khi nào dùng CSR?

✅ **Nên dùng CSR khi:**
- Dashboard, admin panels
- Apps cần nhiều interactivity
- Content không quan trọng cho SEO
- User authentication required

❌ **Không nên dùng CSR khi:**
- Content cần SEO tốt (blog, news)
- Initial load time quan trọng
- Content cần hiển thị ngay lập tức

## Testing CSR Behavior

1. **Disable JavaScript**: Xem HTML ban đầu (sẽ thấy empty/loading state)
2. **Network Tab**: Xem thứ tự load files (HTML → JS → API calls)
3. **React DevTools**: Xem component render và re-render
4. **Performance Tab**: Đo thời gian từ load đến interactive

## Best Practices

1. **Loading States**: Luôn hiển thị loading state khi fetch data
2. **Error Handling**: Handle errors khi API call fails
3. **Optimistic Updates**: Update UI ngay, sync với server sau
4. **Code Splitting**: Chia nhỏ bundle để load nhanh hơn
5. **Caching**: Cache data và API responses khi có thể

## Next Steps

- Xem thêm về **SSR (Server-Side Rendering)**
- Tìm hiểu về **SSG (Static Site Generation)**
- Học về **ISR (Incremental Static Regeneration)**
- So sánh với **RSC (React Server Components)**




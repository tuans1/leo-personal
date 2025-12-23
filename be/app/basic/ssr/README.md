# Server-Side Rendering (SSR) Example

## Tổng quan

Ví dụ này minh họa cách **Server-Side Rendering (SSR)** hoạt động trong Next.js App Router.

## SSR là gì?

**Server-Side Rendering (SSR)** là phương pháp render nội dung trang web trên server trước khi gửi HTML về browser. HTML đã chứa data sẵn, giúp SEO tốt và initial load nhanh hơn.

## Quy trình hoạt động

### 1. Initial Page Load

```
Browser Request
    ↓
Server nhận request
    ↓
Server fetch data từ API/database
    ↓
Server render HTML với data
    ↓
Server gửi HTML đầy đủ về browser
    ↓
Browser hiển thị HTML ngay lập tức
    ↓
React hydrates để thêm interactivity
```

### 2. File Loading Sequence

1. **HTML**: Server gửi HTML đầy đủ với data sẵn (SEO friendly)
2. **JavaScript**: Browser tải JS bundle (nhỏ hơn CSR vì không cần fetch logic)
3. **CSS**: Load cùng với HTML
4. **Data**: Đã có trong HTML, không cần fetch thêm

### 3. Render Process

#### Server Render
- Component là async function
- Data được fetch trên server trước khi render
- HTML được generate với data đầy đủ
- HTML được gửi về browser

#### Client Hydration
- React hydrates HTML đã có sẵn
- Thêm event handlers và interactivity
- Không cần re-render vì data đã có

## Code Structure

### Server Component

```typescript
// KHÔNG có "use client"
export default async function SSRPage() {
  // Fetch data trên server
  const users = await fetchUsers();
  
  // Render với data đã có
  return <div>{/* ... */}</div>;
}
```

**Đặc điểm:**
- Không có `"use client"` directive
- Component là `async function`
- Data fetching xảy ra trước khi render
- Không thể dùng hooks (`useState`, `useEffect`, etc.)

### Data Fetching

```typescript
async function fetchUsers(): Promise<User[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Fetch từ API thật
  return [...];
}

export default async function SSRPage() {
  // Fetch trên server
  const users = await fetchUsers();
  
  // Render với data
  return <div>{users.map(...)}</div>;
}
```

Data fetching xảy ra trên server, trước khi HTML được generate.

## Ưu điểm của SSR

1. **SEO Friendly**: Content có trong HTML, search engines dễ index
2. **Fast Initial Load**: HTML có data sẵn, hiển thị ngay
3. **Better Performance**: Không cần fetch data trên client
4. **Accessibility**: Hoạt động ngay cả khi JS bị disable

## Nhược điểm của SSR

1. **Server Load**: Mỗi request cần render trên server
2. **Slower TTFB**: Time to First Byte chậm hơn (phải đợi fetch data)
3. **Less Interactive**: Khó tạo interactive UI (cần Client Components)
4. **Caching**: Khó cache hơn CSR (mỗi user có thể có data khác)

## So sánh với CSR

| Aspect | SSR | CSR |
|--------|-----|-----|
| **Render Location** | Server | Client (Browser) |
| **Initial HTML** | Full content | Minimal/Empty |
| **Data Fetching** | Server-side | Client-side |
| **Time to First Byte** | Slower | Faster |
| **Time to Interactive** | Faster | Slower |
| **SEO** | Excellent | Moderate |
| **Server Load** | High | Low |
| **Interactivity** | Moderate | High |

## Khi nào dùng SSR?

✅ **Nên dùng SSR khi:**
- Content cần SEO tốt (blog, news, e-commerce)
- Initial load time quan trọng
- Content cần hiển thị ngay lập tức
- Public pages không cần authentication

❌ **Không nên dùng SSR khi:**
- Dashboard, admin panels (cần nhiều interactivity)
- User-specific content (cần authentication)
- Real-time data (WebSocket, etc.)
- High traffic với server load concerns

## Testing SSR Behavior

1. **View Page Source**: Xem HTML source, sẽ thấy data có sẵn trong HTML
2. **Disable JavaScript**: Page vẫn hiển thị content (khác với CSR)
3. **Network Tab**: Xem HTML response có data sẵn
4. **Server Logs**: Xem data fetching xảy ra trên server

## Best Practices

1. **Error Handling**: Luôn handle errors khi fetch data
2. **Loading States**: Không cần loading state (data đã có sẵn)
3. **Caching**: Sử dụng Next.js caching strategies
4. **Code Splitting**: Tách Client Components khi cần interactivity
5. **Performance**: Optimize data fetching để giảm TTFB

## Hybrid Approach

Trong Next.js App Router, bạn có thể kết hợp SSR và CSR:

```typescript
// Server Component (SSR)
export default async function Page() {
  const data = await fetchData(); // SSR
  
  return (
    <div>
      <ServerContent data={data} />
      <ClientInteractiveComponent /> {/* CSR */}
    </div>
  );
}
```

- Server Component: Fetch data, render static content
- Client Component: Handle interactivity, dynamic updates

## Next Steps

- Xem thêm về **CSR (Client-Side Rendering)**
- Tìm hiểu về **SSG (Static Site Generation)**
- Học về **ISR (Incremental Static Regeneration)**
- So sánh với **RSC (React Server Components)**








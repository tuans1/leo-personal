# Parallel Routes Example

## Tổng quan

Ví dụ này minh họa cách **Parallel Routes** hoạt động trong Next.js App Router. Parallel Routes cho phép bạn render nhiều pages cùng lúc trong cùng một layout, mỗi route có thể navigate độc lập.

## Parallel Routes là gì?

**Parallel Routes** là một tính năng của Next.js App Router cho phép bạn:

- Render nhiều routes song song trong cùng một layout
- Mỗi route có thể navigate độc lập mà không ảnh hưởng đến các routes khác
- Sử dụng `default.tsx` để handle unmatched routes
- Mỗi slot có loading state và error boundary riêng
- Hỗ trợ nested routes trong các slots

## Cấu trúc thư mục

```
app/basic/file/parallel-route/
├── layout.tsx                  # Layout nhận parallel route slots
├── page.tsx                    # Main page
├── @analytics/                 # Parallel route slot 1
│   ├── page.tsx               # Analytics dashboard
│   ├── default.tsx            # Fallback khi route không match
│   ├── loading.tsx            # Loading state
│   ├── error.tsx              # Error boundary
│   └── sales/
│       └── page.tsx           # Nested route
├── @notifications/            # Parallel route slot 2
│   ├── page.tsx
│   ├── default.tsx
│   ├── loading.tsx
│   └── error.tsx
├── @sidebar/                  # Parallel route slot 3
│   ├── page.tsx
│   ├── default.tsx
│   └── loading.tsx
└── README.md
```

## Quy tắc đặt tên

### Parallel Route Slots

- Tên folder phải bắt đầu bằng `@`
- Ví dụ: `@analytics`, `@notifications`, `@sidebar`
- Trong layout.tsx, props sẽ có tên tương ứng (bỏ `@`):
  - `@analytics` folder → `analytics` prop
  - `@notifications` folder → `notifications` prop
  - `@sidebar` folder → `sidebar` prop

### Special Files

- `page.tsx`: Route component chính của slot
- `default.tsx`: Render khi route không match
- `loading.tsx`: Loading state của slot
- `error.tsx`: Error boundary của slot

## Cách hoạt động

### 1. Layout Component

Layout component nhận các parallel route slots như props:

```typescript
interface ParallelRoutesLayoutProps {
  children: ReactNode;
  analytics: ReactNode;      // Từ @analytics folder
  notifications: ReactNode;   // Từ @notifications folder
  sidebar: ReactNode;         // Từ @sidebar folder
}

export default function ParallelRoutesLayout({
  children,
  analytics,
  notifications,
  sidebar,
}: ParallelRoutesLayoutProps) {
  return (
    <div>
      <aside>{sidebar}</aside>
      <main>{children}</main>
      <aside>
        {analytics}
        {notifications}
      </aside>
    </div>
  );
}
```

### 2. Route Matching

Khi user navigate đến một route:

1. Next.js tìm route match trong mỗi slot
2. Nếu tìm thấy `page.tsx` trong slot → render `page.tsx`
3. Nếu không tìm thấy → render `default.tsx` của slot đó
4. Các slots khác giữ nguyên content (không re-render)

**Ví dụ:**

- Route: `/basic/file/parallel-route/analytics`
  - `@analytics` slot → render `@analytics/page.tsx`
  - `@notifications` slot → render `@notifications/default.tsx`
  - `@sidebar` slot → render `@sidebar/page.tsx`

- Route: `/basic/file/parallel-route/analytics/sales`
  - `@analytics` slot → render `@analytics/sales/page.tsx`
  - `@notifications` slot → render `@notifications/default.tsx`
  - `@sidebar` slot → render `@sidebar/page.tsx`

### 3. Loading States

Mỗi slot có loading state riêng:

```typescript
// @analytics/loading.tsx
export default function AnalyticsLoading() {
  return <div>Loading analytics...</div>;
}
```

Khi slot đang loading:
- Chỉ slot đó hiển thị loading state
- Các slots khác vẫn hiển thị content bình thường

### 4. Error Boundaries

Mỗi slot có error boundary riêng:

```typescript
// @analytics/error.tsx
"use client";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

Khi một slot có error:
- Chỉ slot đó hiển thị error UI
- Các slots khác vẫn hoạt động bình thường
- Error không ảnh hưởng đến toàn bộ page

### 5. Default Routes

`default.tsx` được render khi route không match:

```typescript
// @analytics/default.tsx
export default function AnalyticsDefault() {
  return <div>Analytics slot - no route match</div>;
}
```

## Use Cases

### 1. Dashboard với Multiple Panels

```typescript
// layout.tsx
export default function DashboardLayout({
  children,
  sidebar,
  header,
  footer,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div>
      {header}
      <div className="flex">
        {sidebar}
        {children}
      </div>
      {footer}
    </div>
  );
}
```

### 2. Conditional Rendering

Bạn có thể conditionally render slots:

```typescript
export default function Layout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <div>
      {children}
      {/* Chỉ render modal khi có route match */}
      {modal}
    </div>
  );
}
```

### 3. Independent Navigation

Mỗi slot có thể navigate độc lập:

```typescript
// @sidebar/page.tsx
"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/analytics">Analytics</Link>
    </nav>
  );
}
```

## Best Practices

### 1. Đặt tên rõ ràng

- Sử dụng tên mô tả cho slots: `@analytics`, `@notifications`, `@sidebar`
- Tránh tên quá ngắn hoặc không rõ ràng: `@a`, `@n`, `@s`

### 2. Luôn có default.tsx

- Mỗi slot nên có `default.tsx` để handle unmatched routes
- `default.tsx` nên hiển thị fallback UI phù hợp

### 3. Loading States

- Mỗi slot nên có `loading.tsx` riêng
- Loading state nên match với content của slot

### 4. Error Boundaries

- Mỗi slot nên có `error.tsx` riêng
- Error UI nên có retry functionality

### 5. Type Safety

- Định nghĩa types cho layout props
- Sử dụng TypeScript để đảm bảo type safety

```typescript
interface LayoutProps {
  children: ReactNode;
  analytics: ReactNode;
  notifications: ReactNode;
  sidebar: ReactNode;
}
```

## So sánh với Traditional Routes

### Traditional Routes

```
/dashboard          → Render dashboard page
/analytics          → Render analytics page
/notifications      → Render notifications page
```

- Mỗi route render một page duy nhất
- Navigate → reload toàn bộ page
- Không thể render nhiều pages cùng lúc

### Parallel Routes

```
/dashboard
  ├── @analytics → Render analytics
  ├── @notifications → Render notifications
  └── @sidebar → Render sidebar

/analytics
  ├── @analytics → Render analytics (update)
  ├── @notifications → Render default (keep)
  └── @sidebar → Render sidebar (keep)
```

- Nhiều routes render cùng lúc
- Navigate → chỉ update slot tương ứng
- Các slots khác giữ nguyên

## Testing Parallel Routes

### 1. Test Route Matching

- Navigate đến các routes khác nhau
- Kiểm tra slot nào update, slot nào giữ nguyên
- Kiểm tra `default.tsx` được render khi route không match

### 2. Test Loading States

- Simulate slow data fetching
- Kiểm tra loading state của từng slot
- Đảm bảo các slots khác không bị ảnh hưởng

### 3. Test Error Boundaries

- Trigger error trong một slot
- Kiểm tra error UI chỉ hiển thị trong slot đó
- Đảm bảo các slots khác vẫn hoạt động

### 4. Test Nested Routes

- Navigate đến nested routes trong slots
- Kiểm tra chỉ slot tương ứng update
- Kiểm tra các slots khác giữ nguyên

## Common Pitfalls

### 1. Quên @ prefix

```typescript
// ❌ Sai
analytics/          // Không phải parallel route

// ✅ Đúng
@analytics/         // Parallel route slot
```

### 2. Props name không khớp

```typescript
// ❌ Sai
export default function Layout({
  analyticsSlot,  // Tên không khớp với @analytics
}: {
  analyticsSlot: ReactNode;
}) {}

// ✅ Đúng
export default function Layout({
  analytics,  // Khớp với @analytics (bỏ @)
}: {
  analytics: ReactNode;
}) {}
```

### 3. Không có default.tsx

- Nếu không có `default.tsx`, slot sẽ không render gì khi route không match
- Luôn tạo `default.tsx` cho mỗi slot

### 4. Error trong một slot ảnh hưởng toàn bộ page

- Sử dụng `error.tsx` riêng cho mỗi slot
- Error boundary sẽ isolate error trong slot đó

## Next Steps

- Xem thêm về **Intercepting Routes** (tương tự parallel routes nhưng intercept routes)
- Tìm hiểu về **Route Groups** để organize routes
- Học về **Conditional Routes** với parallel routes
- Explore **Dynamic Routes** với parallel routes

## Resources

- [Next.js Parallel Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)



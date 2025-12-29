# Apollo Client SSR Demo

## Tổng quan

Ví dụ này minh họa cách sử dụng **Apollo Client với Server-Side Rendering (SSR)** trong Next.js App Router.

## SSR với Apollo Client là gì?

**Server-Side Rendering (SSR)** với Apollo Client cho phép:
- Fetch data trên server trước khi render HTML
- Serialize cache từ server và restore trên client
- Tránh duplicate requests (client reuse cache từ server)
- Better SEO vì data có sẵn trong HTML

## Vấn đề Cache Conflicts

### Vấn đề:

1. **Separate Instances**: Server và Client có Apollo Client instances riêng biệt
2. **Separate Caches**: Mỗi instance có InMemoryCache riêng
3. **No Auto Sync**: Cache trên server không tự động sync với client
4. **Duplicate Requests**: Nếu không handle đúng → client sẽ fetch lại data đã fetch trên server

### Giải pháp:

1. **Server Client**: Tạo Apollo Client instance riêng cho mỗi request trên server
2. **Serialize Cache**: Convert server cache thành JSON
3. **Restore Cache**: Restore cache trên client từ serialized state
4. **Cache Hydration**: Client reuse cache từ server → no duplicate requests

## Cách hoạt động

### 1. Server-Side (Server Component)

```typescript
// app/exercises/apollo/ssr-demo/page.tsx
export default async function SSRDemoPage() {
  // Tạo Apollo Client instance cho server
  const serverClient = getServerClient();

  // Fetch data trên server
  const { data } = await serverClient.query({
    query: GET_TODOS,
    fetchPolicy: "network-only", // Fetch từ network
  });

  // Serialize cache
  const initialCache = serializeCache(serverClient);

  // Render HTML với data và pass cache xuống client
  return <ClientComponent initialCache={initialCache} />;
}
```

### 2. Client-Side (Client Component)

```typescript
// app/exercises/apollo/ssr-demo/client-wrapper.tsx
"use client";

export default function SSRClientWrapper({ initialCache }) {
  // Restore cache từ server
  const client = useMemo(() => {
    return makeClientClient(initialCache);
  }, [initialCache]);

  return (
    <ApolloProvider client={client}>
      <TodoListClient />
    </ApolloProvider>
  );
}

function TodoListClient() {
  // Query sẽ sử dụng cache đã restore
  // Không gửi network request!
  const { data } = useQuery(GET_TODOS, {
    fetchPolicy: "cache-first", // Sử dụng cache
  });

  return <div>{/* Render todos */}</div>;
}
```

## Key Concepts

### 1. Server Client Instance

```typescript
// Mỗi request có instance riêng
const serverClient = getServerClient();

// Fetch data
const { data } = await serverClient.query({ query: GET_TODOS });
```

### 2. Cache Serialization

```typescript
// Server: Serialize cache
const initialCache = serverClient.cache.extract();

// Cache được serialize thành JSON object
// Có thể truyền qua props hoặc embed trong HTML
```

### 3. Cache Restoration

```typescript
// Client: Restore cache
const client = makeClientClient(initialCache);

// Client cache giờ đã có data từ server
// useQuery sẽ sử dụng cache này thay vì fetch từ network
```

## Implementation Details

### File Structure

```
app/lib/apollo/
  - make-client.ts       # Factory function để tạo client instances
  - ssr-utils.ts         # SSR utilities (getServerClient, serializeCache, etc.)
  - apollo-client.ts     # Default client (CSR only, backward compatible)
  - apollo-provider.tsx  # Provider wrapper (supports SSR với initialCache prop)

app/exercises/apollo/ssr-demo/
  - page.tsx            # Server Component (fetch data, serialize cache)
  - client-wrapper.tsx  # Client Component (restore cache, use hooks)
```

### make-client.ts

Factory function để tạo Apollo Client instances:

- `makeServerClient()`: Tạo client cho server với `ssrMode: true`
- `makeClientClient(initialState)`: Tạo client cho client với optional cache restore
- `makeApolloClient(options)`: Generic factory function

### ssr-utils.ts

Utilities để handle SSR:

- `getServerClient()`: Get server client instance
- `serializeCache(client)`: Serialize cache thành JSON
- `restoreClientCache(initialState)`: Restore cache trên client

## Benefits

### ✅ Advantages

1. **SEO Friendly**: Data có sẵn trong HTML
2. **Performance**: Initial load nhanh hơn (no loading state)
3. **No Duplicate Requests**: Client reuse cache từ server
4. **Better UX**: Content visible ngay lập tức

### ⚠️ Considerations

1. **Cache Size**: Large cache → large HTML payload
2. **Server Memory**: Mỗi request có client instance riêng
3. **Complexity**: Setup phức tạp hơn CSR
4. **Hydration**: Đảm bảo cache structure giống nhau

## Best Practices

### 1. Separate Instances

```typescript
// ✅ ĐÚNG: Mỗi request có instance riêng
export default async function Page() {
  const serverClient = getServerClient(); // New instance per request
  // ...
}

// ❌ SAI: Share instance giữa requests
const sharedClient = getServerClient(); // Shared instance - DON'T DO THIS!
```

### 2. Cache Structure

```typescript
// Đảm bảo cache structure giống nhau giữa server và client
// Use same typePolicies, keyFields, etc.
const cache = new InMemoryCache({
  typePolicies: {
    Todo: {
      keyFields: ["id"], // Same on server and client
    },
  },
});
```

### 3. Error Handling

```typescript
try {
  const { data, error } = await serverClient.query({ query: GET_TODOS });
  if (error) {
    // Handle error
  }
  // Serialize cache
  const initialCache = serializeCache(serverClient);
} catch (error) {
  // Handle error
}
```

### 4. Memory Management

```typescript
// Server instances được garbage collected sau mỗi request
// Không cần cleanup manually
// Nhưng với nhiều concurrent requests, monitor memory usage
```

## SSR vs CSR với Apollo Client

| Aspect | SSR | CSR |
|--------|-----|-----|
| **Data Fetch** | Server | Client |
| **HTML Content** | Có data | Rỗng |
| **SEO** | ✅ Good | ❌ Poor |
| **Initial Load** | Fast | Slow (có loading state) |
| **Cache** | Serialize + Restore | Chỉ trên client |
| **Duplicate Requests** | ❌ No | ✅ Có thể có |
| **Complexity** | High | Low |
| **Interactivity** | Cần hydration | Immediate |

## Testing

1. **View Page Source**: Xem HTML source, data có sẵn trong HTML
2. **Network Tab**: Client query không gửi network request (sử dụng cache)
3. **Cache State**: Check Apollo DevTools, cache đã có data từ server
4. **Hydration**: No React hydration warnings

## Next Steps

- Xem [Apollo Cache Demo](/exercises/apollo) để so sánh với CSR
- Tìm hiểu về [Error Handling](/exercises/apollo/error-demo)
- Learn about Apollo Links trong [README.md](/app/lib/apollo/README.md)


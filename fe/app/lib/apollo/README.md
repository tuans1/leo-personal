# Apollo Client Configuration

## Cấu trúc

- `apollo-client.ts`: Cấu hình Apollo Client với InMemoryCache và mock link
- `apollo-provider.tsx`: ApolloProvider wrapper để sử dụng trong layout
- `queries.ts`: GraphQL queries định nghĩa
- `types.ts`: TypeScript types cho queries và data
- `mock-data.ts`: Mock data để demo cache functionality

## Cách sử dụng

### 1. Apollo Provider đã được setup trong `app/layout.tsx`

ApolloProvider đã được wrap toàn bộ app, bạn có thể sử dụng Apollo hooks trong bất kỳ client component nào.

### 2. Sử dụng queries

```typescript
import { useQuery } from "@apollo/client/react";
import { GET_TODOS } from "@/app/lib/apollo/queries";
import { TodosData } from "@/app/lib/apollo/types";

const MyComponent = () => {
  const { data, loading, error } = useQuery<TodosData>(GET_TODOS);

  // ...
};
```

### 3. Apollo DevTools

1. Cài đặt [Apollo Client DevTools extension](https://chrome.google.com/webstore/detail/apollo-client-devtools/jdkknkkbebbapilgoeccciglkfbmbnfm) cho Chrome
2. Mở Chrome DevTools (F12)
3. Vào tab "Apollo"
4. Xem cache và queries trong DevTools

## Mock Data

Hiện tại Apollo Client đang sử dụng mock link với mock data. Trong production, bạn sẽ thay thế mock link bằng HttpLink với GraphQL endpoint thật:

```typescript
import { HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "https://your-graphql-endpoint.com/graphql",
});

export const apolloClient = new ApolloClient({
  link: httpLink, // Thay thế createMockLink() bằng httpLink
  cache: new InMemoryCache({
    // ... cache config
  }),
});
```

## Cache Features

- **Normalized Cache**: Todo objects được normalize by id
- **Cache-first policy**: Mặc định, Apollo sẽ sử dụng cache nếu có
- **Automatic cache updates**: Cache tự động update khi fetch data mới
- **Query deduplication**: Cùng một query chỉ fetch một lần

## Apollo Links

Apollo Links là các middleware để xử lý requests/responses trong Apollo Client. Chúng được chain lại với nhau để tạo thành một pipeline xử lý.

### Links hiện đang sử dụng

#### 1. ErrorLink

ErrorLink được sử dụng để xử lý errors toàn cục. Nó catch tất cả GraphQL errors và Network errors trước khi chúng được propagate đến components.

**Đã implement trong `apollo-client.ts`:**

- Log GraphQL errors với message, locations, path
- Log Network errors
- Có thể mở rộng để retry, redirect, hoặc handle errors khác nhau

### Các Apollo Links phổ biến khác

#### 2. HttpLink

Link chính để gửi HTTP requests đến GraphQL server.

```typescript
import { HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "https://api.example.com/graphql",
  // Optional: custom fetch options
  fetchOptions: {
    credentials: "include", // Include cookies
  },
});
```

#### 3. RetryLink

Tự động retry failed requests với configurable retry logic.

```typescript
import { RetryLink } from "@apollo/client/link/retry";

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error,
  },
});
```

#### 4. Context Link (setContext)

Thêm headers hoặc context vào mỗi request (thường dùng cho authentication).

```typescript
import { setContext } from "@apollo/client/link/context";

const authLink = setContext((_, { headers }) => {
  // Get token from storage
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});
```

#### 5. BatchHttpLink

Batch multiple queries vào một HTTP request để tối ưu performance.

```typescript
import { BatchHttpLink } from "@apollo/client/link/batch-http";

const batchLink = new BatchHttpLink({
  uri: "https://api.example.com/graphql",
  batchMax: 5, // Max 5 operations per batch
  batchInterval: 20, // Wait 20ms before batching
});
```

#### 6. WebSocketLink

Cho GraphQL subscriptions qua WebSocket.

```typescript
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
  })
);
```

### Cách chain nhiều Links

Bạn có thể chain nhiều links lại với nhau bằng `ApolloLink.from()`:

```typescript
import { ApolloLink, HttpLink } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { RetryLink } from "@apollo/client/link/retry";

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: `Bearer ${getToken()}`,
  },
}));

const errorLink = new ErrorLink(({ error }) => {
  console.error("Apollo Error:", error);
});

const retryLink = new RetryLink();

const httpLink = new HttpLink({
  uri: "https://api.example.com/graphql",
});

// Chain các links theo thứ tự: errorLink → authLink → retryLink → httpLink
const linkChain = ApolloLink.from([
  errorLink, // Xử lý errors trước
  authLink, // Thêm auth headers
  retryLink, // Retry failed requests
  httpLink, // Gửi HTTP request
]);

export const apolloClient = new ApolloClient({
  link: linkChain,
  cache: new InMemoryCache(),
});
```

**Thứ tự của links quan trọng:**

- Links được xử lý từ trái sang phải
- ErrorLink nên đứng đầu để catch errors từ tất cả links phía sau
- AuthLink thường đứng trước HttpLink để thêm headers
- HttpLink thường đứng cuối cùng để gửi request thật

### Ví dụ Production Setup

```typescript
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { RetryLink } from "@apollo/client/link/retry";

// 1. ErrorLink - Xử lý errors
const errorLink = new ErrorLink(({ error }) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`GraphQL error: ${message}`, { locations, path })
    );
  }
  if (error.networkError) {
    console.error(`Network error: ${error.networkError}`);
  }
});

// 2. AuthLink - Thêm authentication headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// 3. RetryLink - Retry failed requests
const retryLink = new RetryLink({
  delay: { initial: 300, max: Infinity, jitter: true },
  attempts: { max: 5 },
});

// 4. HttpLink - Gửi HTTP requests
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "/graphql",
});

// Chain tất cả links
const link = ApolloLink.from([errorLink, authLink, retryLink, httpLink]);

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
```

## Demo Pages

- **Cache Demo**: `/exercises/apollo` - Demo cache functionality với mock data
- **ErrorLink Demo**: `/exercises/apollo/error-demo` - Demo ErrorLink với các error scenarios

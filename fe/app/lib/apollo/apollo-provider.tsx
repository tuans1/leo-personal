"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useMemo } from "react";
import { NormalizedCacheObject } from "@apollo/client";
import { makeClientClient } from "./make-client";
import { apolloClient } from "./apollo-client";

interface ApolloProviderWrapperProps {
  children: React.ReactNode;
  /**
   * Initial cache state từ server (SSR)
   * Nếu có, sẽ restore cache thay vì tạo cache mới
   */
  initialCache?: NormalizedCacheObject;
}

export function ApolloProviderWrapper({
  children,
  initialCache,
}: ApolloProviderWrapperProps) {
  // Tạo client với initial cache nếu có (SSR)
  // Hoặc dùng default client (CSR)
  const client = useMemo(() => {
    if (initialCache) {
      // SSR: Restore cache từ server
      return makeClientClient(initialCache);
    }
    // CSR: Dùng default client
    return apolloClient;
  }, [initialCache]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}


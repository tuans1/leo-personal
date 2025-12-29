"use client";

/**
 * Default Apollo Client instance cho client-side (CSR)
 * 
 * Để sử dụng SSR, hãy dùng makeClientClient() với initialState
 * hoặc sử dụng ApolloProviderWrapper với initialCache prop
 * 
 * @deprecated - Nên sử dụng makeClientClient() từ make-client.ts
 * Giữ lại để backward compatibility với code hiện tại
 */
import { makeClientClient } from "./make-client";

// Default client instance (CSR only)
export const apolloClient = makeClientClient();

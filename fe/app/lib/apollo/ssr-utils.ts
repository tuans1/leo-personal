import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { makeServerClient, makeClientClient } from "./make-client";

/**
 * Get Apollo Client instance cho server-side
 * Trong Next.js App Router, mỗi request nên có instance riêng
 * Để tránh cache conflicts giữa các requests
 */
export function getServerClient(): ApolloClient {
  return makeServerClient();
}

/**
 * Serialize Apollo Client cache thành JSON
 * Dùng để truyền cache từ server xuống client
 */
export function serializeCache(client: ApolloClient): NormalizedCacheObject {
  return client.cache.extract() as NormalizedCacheObject;
}

/**
 * Restore cache trên client từ serialized state
 * @param initialState - Serialized cache từ server
 * @returns Apollo Client instance với cache đã restore
 */
export function restoreClientCache(
  initialState?: NormalizedCacheObject
): ApolloClient {
  return makeClientClient(initialState);
}


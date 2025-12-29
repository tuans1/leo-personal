import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
  NormalizedCacheObject,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { print } from "graphql";
import { mockTodos, getTodoById } from "./mock-data";

// Custom mock link để demo với mock data và error scenarios
const createMockLink = (): ApolloLink => {
  return new ApolloLink((operation) => {
    return new Observable((observer) => {
      const { query, variables } = operation;
      const queryString = print(query);

      // Check if should trigger error (via variables)
      const errorType = variables?.__errorType as string | undefined;

      // Simulate network delay
      setTimeout(
        () => {
          try {
            // Handle Network Error
            if (errorType === "network") {
              const networkError = new Error("Network error: Failed to fetch");
              observer.error({
                name: "NetworkError",
                message: networkError.message,
                networkError,
              });
              return;
            }

            // Handle Timeout Error
            if (errorType === "timeout") {
              const timeoutError = new Error("Request timeout");
              observer.error({
                name: "TimeoutError",
                message: timeoutError.message,
                networkError: timeoutError,
              });
              return;
            }

            let data;

            // Handle GET_TODOS query
            if (
              queryString.includes("GetTodos") &&
              !queryString.includes("GetTodoById")
            ) {
              // Handle GraphQL Error for GET_TODOS
              if (errorType === "graphql") {
                observer.next({
                  data: null,
                  errors: [
                    {
                      message: "Failed to fetch todos",
                      extensions: {
                        code: "UNAUTHENTICATED",
                      },
                    },
                  ],
                });
                observer.complete();
                return;
              }

              data = {
                todos: mockTodos,
              };
            }
            // Handle GET_TODO_BY_ID query
            else if (queryString.includes("GetTodoById")) {
              const todoId = variables?.id as string;

              // Handle GraphQL Error for GET_TODO_BY_ID
              if (errorType === "graphql") {
                observer.next({
                  data: { todo: null },
                  errors: [
                    {
                      message: `Todo with id "${todoId}" not found`,
                      extensions: {
                        code: "NOT_FOUND",
                      },
                    },
                  ],
                });
                observer.complete();
                return;
              }

              const todo = getTodoById(todoId);
              data = {
                todo: todo || null,
              };
            } else {
              data = null;
            }

            observer.next({
              data,
            });
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        },
        errorType === "timeout" ? 5000 : 300
      ); // Longer delay for timeout
    });
  });
};

// ErrorLink để xử lý errors (Apollo Client v4 API)
const errorLink = new ErrorLink(({ error }) => {
  // Check if it's a GraphQL error
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach((gqlError) => {
      console.error(
        `[GraphQL error]: Message: ${gqlError.message}, Location: ${gqlError.locations}, Path: ${gqlError.path}`,
        gqlError.extensions
      );
    });
  } else {
    // Network error or other errors
    console.error(`[Network/Other error]: ${error.message || error}`, error);
  }
});

// Shared cache configuration
const createCache = () => {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          todos: {
            // Cache policy cho todos list - replace existing với incoming
            merge(_existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Todo: {
        // Normalize Todo objects by id
        keyFields: ["id"],
      },
    },
  });
};

// Shared link configuration
const createLink = () => {
  return ApolloLink.from([errorLink, createMockLink()]);
};

/**
 * Factory function để tạo Apollo Client instance
 * @param options - Options để tạo client
 * @param options.ssrMode - Enable SSR mode (cho server-side)
 * @param options.initialState - Initial cache state (để restore trên client)
 * @returns Apollo Client instance
 */
export function makeApolloClient(options?: {
  ssrMode?: boolean;
  initialState?: NormalizedCacheObject;
}) {
  const { ssrMode = false, initialState } = options || {};

  const cache = createCache();

  // Restore cache từ initialState nếu có (client-side hydration)
  if (initialState) {
    cache.restore(initialState);
  }

  const client = new ApolloClient({
    link: createLink(),
    cache,
    // ssrMode: true trên server để tránh polling và optimize cho SSR
    ssrMode,
    // Apollo DevTools tự động enabled trong development mode (chỉ trên client)
    // connectToDevTools: !ssrMode && typeof window !== "undefined",
  });

  return client;
}

/**
 * Tạo Apollo Client instance cho client-side
 * Restore cache từ initialState nếu có
 */
export function makeClientClient(initialState?: NormalizedCacheObject) {
  return makeApolloClient({
    ssrMode: false,
    initialState,
  });
}

/**
 * Tạo Apollo Client instance cho server-side
 * Mỗi request nên có instance riêng để tránh cache conflicts
 */
export function makeServerClient() {
  return makeApolloClient({
    ssrMode: true,
  });
}


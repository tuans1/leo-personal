/**
 * Force dynamic rendering for all Apollo demo pages.
 * These pages use Apollo Client with network requests that may fail during build
 * (GraphQL backend not available, etc.).
 */
export const dynamic = "force-dynamic";

export default function ApolloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

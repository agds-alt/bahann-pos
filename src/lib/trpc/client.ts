import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/routers/_app'
import superjson from 'superjson'

/**
 * Get base URL for tRPC requests
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return ''
  }

  // SSR should use full URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Development fallback
  return `http://localhost:${process.env.PORT ?? 3000}`
}

/**
 * React hooks for tRPC
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Vanilla tRPC client (for use outside React components)
 *
 * NOTE: Authentication is now handled via httpOnly cookies.
 * The browser automatically sends cookies with each request.
 * No need to manually set Authorization header.
 */
export const vanillaTrpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      // Cookies are sent automatically by the browser
      // credentials: 'include' is the default for same-origin requests
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include', // Ensure cookies are sent
        })
      },
    }),
  ],
})

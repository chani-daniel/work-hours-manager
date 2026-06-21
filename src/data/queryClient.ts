import { QueryClient } from '@tanstack/react-query'

// Single shared TanStack Query client. Reads are cached and reused across the
// app; writes invalidate the relevant queries to keep the UI in sync.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // treat data as fresh for 1 minute
      retry: 1,
    },
  },
})

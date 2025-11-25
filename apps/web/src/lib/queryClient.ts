import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance for TanStack Query
 * Configured with sensible defaults for this application
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Don't refetch on window focus (data doesn't change often)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
  },
});

/**
 * Query keys for consistent cache management
 */
export const queryKeys = {
  criteria: (filters: Record<string, unknown>) => ['criteria', filters] as const,
  criterion: (id: string) => ['criterion', id] as const,
  principles: () => ['principles'] as const,
  guidelines: () => ['guidelines'] as const,
  versions: () => ['versions'] as const,
  levels: () => ['levels'] as const,
  terms: () => ['terms'] as const,
  languages: () => ['languages'] as const,
} as const;

import { useQuery } from '@tanstack/react-query';
import { getCriteria } from '../../lib/api';
import type { QueryFilters, PaginatedResult, Criterion } from '../../lib/types';

interface UseCriteriaQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Query hook for fetching criteria with filters
 * Uses TanStack Query for caching and deduplication
 */
export function useCriteriaQuery(
  filters: QueryFilters,
  options: UseCriteriaQueryOptions = {}
) {
  const { enabled = true, staleTime } = options;

  return useQuery<PaginatedResult<Criterion>, Error>({
    queryKey: ['criteria', filters] as const,
    queryFn: () => getCriteria(filters),
    // Keep previous data while fetching new data (smoother UX)
    placeholderData: (previousData) => previousData,
    enabled,
    ...(staleTime !== undefined && { staleTime }),
  });
}

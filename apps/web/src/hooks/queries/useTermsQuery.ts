import { useQuery } from '@tanstack/react-query';
import { getTerms } from '../../lib/api';
import { queryKeys } from '../../lib/queryClient';
import type { Term } from '../../lib/types';

/**
 * Query hook for fetching terms (glossary)
 * Uses TanStack Query for caching and deduplication
 */
export function useTermsQuery() {
  return useQuery<Term[], Error>({
    queryKey: queryKeys.terms(),
    queryFn: getTerms,
    // Terms rarely change, so we can cache them longer
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

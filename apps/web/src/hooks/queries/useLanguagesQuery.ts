import { useQuery } from '@tanstack/react-query';
import { getLanguages } from '../../lib/api';
import { queryKeys } from '../../lib/queryClient';
import type { Language } from '../../lib/types';

/**
 * Query hook for fetching languages with translation credits
 * Uses TanStack Query for caching and deduplication
 */
export function useLanguagesQuery() {
  return useQuery<Language[], Error>({
    queryKey: queryKeys.languages(),
    queryFn: getLanguages,
    // Languages rarely change, so we can cache them longer
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

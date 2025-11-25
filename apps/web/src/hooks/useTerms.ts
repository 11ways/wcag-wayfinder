import { useTermsQuery } from './queries/useTermsQuery';

/**
 * Fetches WCAG terms for linking
 * Uses TanStack Query for caching and automatic deduplication
 */
export function useTerms() {
  const { data: terms = [], isLoading, error } = useTermsQuery();

  return {
    terms,
    isLoading,
    error: error?.message ?? null,
  };
}

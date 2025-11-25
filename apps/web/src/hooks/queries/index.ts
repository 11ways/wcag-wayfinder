/**
 * TanStack Query hooks for data fetching
 * These provide caching, deduplication, and automatic refetching
 */

export { useCriteriaQuery } from './useCriteriaQuery';
export { useTermsQuery } from './useTermsQuery';
export {
  usePrinciplesQuery,
  useGuidelinesQuery,
  useVersionsQuery,
  useLevelsQuery,
} from './useMetadataQueries';

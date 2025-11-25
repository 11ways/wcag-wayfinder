import { useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCriteriaQuery } from './queries/useCriteriaQuery';
import {
  createFuzzySearchIndex,
  getFuzzySuggestions,
  type FuzzySuggestion,
} from '../lib/fuzzySearch';
import { countCriteriaWithTags, generateResultsMessage } from '../lib/resultsUtils';
import { announce } from '../utils/announce';
import { getPageSize } from '../lib/accessibilitySettings';

import type { Criterion, QueryFilters, PaginatedResult } from '../lib/types';

interface UseResultsOptions {
  filters: QueryFilters;
  isFavoritesPage: boolean;
}

interface UseResultsReturn {
  results: PaginatedResult<Criterion>;
  isLoading: boolean;
  error: string | null;
  statusMessage: string;
  totalCriteriaCount: number;
  matchingCriteriaCount: number;
  suggestions: FuzzySuggestion[];
}

// Default empty result set
const createEmptyResults = (pageSize: number): PaginatedResult<Criterion> => ({
  items: [],
  total: 0,
  page: 1,
  pageSize,
  totalPages: 0,
});

/**
 * Custom hook for fetching and managing WCAG criteria results.
 * Uses TanStack Query for caching and deduplication.
 *
 * Handles:
 * - Normal filtered results fetching
 * - Favorites page (fetch all criteria)
 * - Tag-based filtering and counting
 * - Loading states and error handling
 * - Status messages and screen reader announcements
 *
 * @param options - Hook configuration with filters and favorites page flag
 * @returns Results data, loading state, and counts
 */
export function useResults({
  filters,
  isFavoritesPage,
}: UseResultsOptions): UseResultsReturn {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Get user's preferred page size
  const preferredPageSize = getPageSize();

  // === Check for empty filters ===
  const hasEmptyFilters = useMemo(() => {
    const hasEmptyVersions = filters.version !== undefined && filters.version.length === 0;
    const hasEmptyLevels = filters.level !== undefined && filters.level.length === 0;
    const hasEmptyPrinciples = filters.principle !== undefined && filters.principle.length === 0;
    return hasEmptyVersions || hasEmptyLevels || hasEmptyPrinciples;
  }, [filters.version, filters.level, filters.principle]);

  // === Inject current language into filters for translations ===
  const filtersWithLang = useMemo(() => ({
    ...filters,
    lang: currentLanguage !== 'en' ? currentLanguage : undefined,
  }), [filters, currentLanguage]);

  // === TanStack Query for main results ===
  const queryFilters = isFavoritesPage ? { pageSize: 1000, lang: filtersWithLang.lang } : filtersWithLang;
  const {
    data: queryResults,
    isLoading: isQueryLoading,
    error: queryError,
  } = useCriteriaQuery(queryFilters, {
    enabled: !hasEmptyFilters, // Don't fetch if filters are empty
  });

  // === TanStack Query for fuzzy search index (all criteria, cached forever) ===
  const fuseIndexRef = useRef<ReturnType<typeof createFuzzySearchIndex> | null>(null);
  const allCriteriaRef = useRef<Criterion[]>([]);

  const { data: allCriteriaData } = useCriteriaQuery(
    { pageSize: 1000 },
    {
      staleTime: Infinity, // Never refetch - criteria list doesn't change
      enabled: !fuseIndexRef.current, // Only fetch once until index is built
    }
  );

  // Build fuzzy search index when all criteria data is available
  useEffect(() => {
    if (allCriteriaData && !fuseIndexRef.current) {
      allCriteriaRef.current = allCriteriaData.items;
      fuseIndexRef.current = createFuzzySearchIndex(allCriteriaData.items);
    }
  }, [allCriteriaData]);

  // === TanStack Query for tag counting (when tags are selected) ===
  const filtersWithoutTags = useMemo(() => {
    if (!filters.tag_ids || filters.tag_ids.length === 0) return null;
    return {
      ...filtersWithLang,
      tag_ids: undefined,
      pageSize: 1000,
    };
  }, [filtersWithLang]);

  const { data: allDataForTags } = useCriteriaQuery(
    filtersWithoutTags ?? {},
    {
      enabled: !!filtersWithoutTags && !hasEmptyFilters && !isFavoritesPage,
    }
  );

  // === Compute results and counts ===
  const results = useMemo(() => {
    if (hasEmptyFilters) {
      return createEmptyResults(preferredPageSize);
    }
    return queryResults ?? createEmptyResults(preferredPageSize);
  }, [hasEmptyFilters, queryResults, preferredPageSize]);

  const { totalCriteriaCount, matchingCriteriaCount } = useMemo(() => {
    if (hasEmptyFilters) {
      return { totalCriteriaCount: 0, matchingCriteriaCount: 0 };
    }

    if (filters.tag_ids && filters.tag_ids.length > 0 && allDataForTags) {
      const matchingCount = countCriteriaWithTags(allDataForTags.items, filters.tag_ids);
      return { totalCriteriaCount: allDataForTags.total, matchingCriteriaCount: matchingCount };
    }

    const total = results.total;
    return { totalCriteriaCount: total, matchingCriteriaCount: total };
  }, [hasEmptyFilters, filters.tag_ids, allDataForTags, results.total]);

  // === Generate status message ===
  const statusMessage = useMemo(() => {
    if (hasEmptyFilters) {
      return 'No results - at least one filter is empty';
    }
    if (queryError) {
      return `Error: ${queryError.message}`;
    }
    if (isQueryLoading) {
      return 'Loading results...';
    }
    return generateResultsMessage(results.total, results.page, results.totalPages);
  }, [hasEmptyFilters, queryError, isQueryLoading, results.total, results.page, results.totalPages]);

  // === Track previous status for announcements ===
  const prevStatusRef = useRef<string>('');

  // Announce status changes to screen readers
  useEffect(() => {
    if (statusMessage !== prevStatusRef.current && !isQueryLoading) {
      prevStatusRef.current = statusMessage;

      if (hasEmptyFilters) {
        announce('No results found - please select at least one option in each filter group');
      } else if (queryError) {
        announce(`Error: ${queryError.message}`, 'assertive');
      } else {
        announce(statusMessage);
      }
    }
  }, [statusMessage, isQueryLoading, hasEmptyFilters, queryError]);

  // === Generate fuzzy suggestions when no results ===
  const suggestions = useMemo(() => {
    if (
      results.items.length === 0 &&
      filters.q &&
      filters.q.trim() !== '' &&
      fuseIndexRef.current &&
      !isQueryLoading
    ) {
      return getFuzzySuggestions(filters.q, fuseIndexRef.current, 3);
    }
    return [];
  }, [results.items.length, filters.q, isQueryLoading]);

  return {
    results,
    isLoading: isQueryLoading,
    error: queryError?.message ?? null,
    statusMessage,
    totalCriteriaCount,
    matchingCriteriaCount,
    suggestions,
  };
}

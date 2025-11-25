import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { loadFilters, saveFilters } from '../lib/filterState';
import { isValidLanguage } from '../lib/i18n/languages';
import { parseURL, buildURL, mergeWithDefaults } from '../lib/urlUtils';

import type { QueryFilters } from '../lib/types';

/**
 * Extract language prefix from pathname if valid
 * @returns Language code or undefined if not a valid language prefix
 */
function getLanguageFromPath(pathname: string): string | undefined {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isValidLanguage(firstSegment) ? firstSegment : undefined;
}

interface UseURLSyncOptions {
  filters: QueryFilters;
  setFilters: React.Dispatch<React.SetStateAction<QueryFilters>>;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Custom hook for bidirectional URL ↔ filters synchronization.
 * Handles:
 * - Parsing URL on mount and initializing filters
 * - Updating URL when filters change (with loop prevention)
 * - Browser back/forward navigation
 * - Loading saved filters from localStorage as fallback
 * - Preserving URL hash during updates
 * - Syncing search input with URL query parameter
 *
 * @param options - Hook configuration with filters and setters
 */
export function useURLSync({
  filters,
  setFilters,
  setSearchInput,
}: UseURLSyncOptions): void {
  const location = useLocation();
  // Track if we're updating from URL to prevent loops
  const isUpdatingFromURL = useRef(false);

  // Parse URL on mount and initialize filters
  useEffect(() => {
    isUpdatingFromURL.current = true;
    const urlFilters = parseURL(
      window.location.pathname,
      window.location.search
    );

    // If URL has no filters, try to load from localStorage
    // Check for empty path OR path with only language prefix (e.g., '/' or '/nl/')
    const hasUrlFilters = Object.keys(urlFilters).length > 0;
    const lang = getLanguageFromPath(window.location.pathname);
    const isEmptyPath =
      window.location.pathname === '/' ||
      window.location.pathname === `/${lang}/` ||
      window.location.pathname === `/${lang}`;

    let filtersToUse = urlFilters;

    if (!hasUrlFilters && isEmptyPath) {
      const savedFilters = loadFilters();
      if (savedFilters) {
        filtersToUse = savedFilters;
      }
    }

    const mergedFilters = mergeWithDefaults(filtersToUse);

    // Initialize search input if present in URL or saved filters
    if (mergedFilters.q) {
      setSearchInput(mergedFilters.q);
    }

    setFilters(mergedFilters);
    // Don't set isUpdatingFromURL to false here - let it happen after filters are applied
  }, [location.pathname, setFilters, setSearchInput]);

  // Update URL when filters change (but not when updating from URL)
  useEffect(() => {
    if (isUpdatingFromURL.current) {
      // Reset the flag after this effect runs
      isUpdatingFromURL.current = false;
      return;
    }

    // Save filters to localStorage (excluding pagination)
    const filtersToSave = { ...filters };
    delete filtersToSave.page;
    delete filtersToSave.pageSize;
    saveFilters(filtersToSave);

    // Preserve the hash and language prefix when updating the URL
    const currentHash = window.location.hash;
    const lang = getLanguageFromPath(window.location.pathname);
    const filterPath = buildURL(filters, currentHash);

    // Prepend language prefix if present
    const newURL = lang ? `/${lang}${filterPath}` : filterPath;
    window.history.pushState({}, '', newURL);
  }, [filters]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      isUpdatingFromURL.current = true;
      const urlFilters = parseURL(
        window.location.pathname,
        window.location.search
      );
      const mergedFilters = mergeWithDefaults(urlFilters);

      // Update search input if present in URL
      if (mergedFilters.q) {
        setSearchInput(mergedFilters.q);
      } else {
        setSearchInput('');
      }

      setFilters(mergedFilters);
      // Note: Hash is preserved automatically by the browser during popstate
      // Don't set isUpdatingFromURL to false here - let it happen in the filters effect
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setFilters, setSearchInput]);
}

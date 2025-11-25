import { useState, useCallback } from 'react';

import { debounce } from '../lib/debounce';
import { SEARCH_DEBOUNCE_MS } from '../lib/constants';

import type { QueryFilters } from '../lib/types';

interface UseSearchOptions {
  setFilters: React.Dispatch<React.SetStateAction<QueryFilters>>;
  debounceDelay?: number;
}

interface UseSearchReturn {
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook for managing search input with debouncing.
 * Updates filters after a delay to avoid excessive API calls while typing.
 *
 * @param options - Hook configuration with filters, setFilters, and optional debounce delay
 * @returns Search state and handlers
 */
export function useSearch({
  setFilters,
  debounceDelay = SEARCH_DEBOUNCE_MS,
}: UseSearchOptions): UseSearchReturn {
  const [searchInput, setSearchInput] = useState('');

  // Debounced search - updates filters after user stops typing
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setFilters((prev) => ({ ...prev, q: query || undefined, page: 1 }));
    }, debounceDelay),
    [setFilters, debounceDelay]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  return {
    searchInput,
    setSearchInput,
    handleSearchChange,
  };
}

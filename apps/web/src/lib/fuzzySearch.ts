import Fuse from 'fuse.js';

import type { Criterion } from './types';

export interface FuzzySearchOptions {
  threshold?: number; // 0.0 = exact match, 1.0 = match anything
  distance?: number; // Maximum distance to search
  minMatchCharLength?: number; // Minimum character length to match
}

const DEFAULT_OPTIONS: FuzzySearchOptions = {
  threshold: 0.4, // Allow ~40% character difference for typos
  distance: 100, // Look within 100 characters
  minMatchCharLength: 2, // Require at least 2 chars to match
};

/**
 * Creates a Fuse.js search index for fuzzy searching criteria
 * @param criteria - Array of WCAG criteria to index
 * @param options - Optional fuzzy search configuration
 * @returns Fuse instance for searching
 */
export function createFuzzySearchIndex(
  criteria: Criterion[],
  options: FuzzySearchOptions = {}
): Fuse<Criterion> {
  return new Fuse(criteria, {
    keys: [
      { name: 'title', weight: 2 }, // Title most important
      { name: 'num', weight: 1.5 }, // Criterion number
      { name: 'description', weight: 1 }, // Description
      { name: 'guideline_title', weight: 0.5 }, // Guideline context
    ],
    includeScore: true,
    includeMatches: true, // Include what matched for highlighting
    ...DEFAULT_OPTIONS,
    ...options,
  });
}

export interface FuzzySuggestion {
  criterion: Criterion;
  score: number; // Lower is better (0 = perfect match)
  matchPercentage: number; // Human-friendly percentage (100 = perfect)
}

/**
 * Gets fuzzy search suggestions when no exact matches are found
 * @param query - Search query with potential typos
 * @param index - Fuse.js search index
 * @param limit - Maximum number of suggestions to return
 * @returns Array of suggested criteria with match scores
 */
export function getFuzzySuggestions(
  query: string,
  index: Fuse<Criterion>,
  limit = 3
): FuzzySuggestion[] {
  const results = index.search(query);

  return results.slice(0, limit).map((result) => ({
    criterion: result.item,
    score: result.score || 0,
    matchPercentage: Math.round((1 - (result.score || 0)) * 100),
  }));
}

/**
 * Extract unique search terms from a query string
 * Filters out short words that don't help with fuzzy matching
 * @param query - Search query string
 * @returns Array of meaningful search terms
 */
export function extractSearchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2); // Ignore short words like "a", "an", "the"
}

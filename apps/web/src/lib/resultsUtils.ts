import type { Criterion } from './types';

/**
 * Counts how many criteria have at least one of the selected tags.
 *
 * @param criteria - Array of criteria to check
 * @param selectedTagIds - Array of tag IDs to match against
 * @returns Number of criteria that match at least one selected tag
 */
export function countCriteriaWithTags(
  criteria: Criterion[],
  selectedTagIds: number[]
): number {
  if (selectedTagIds.length === 0) return criteria.length;

  return criteria.filter((criterion) =>
    criterion.tags?.some((tag) => selectedTagIds.includes(tag.id))
  ).length;
}

/**
 * Generates a status message for search results.
 *
 * @param total - Total number of results
 * @param page - Current page number
 * @param totalPages - Total number of pages
 * @returns Formatted status message
 */
export function generateResultsMessage(
  total: number,
  page: number,
  totalPages: number
): string {
  const resultsText = `${total} ${total === 1 ? 'result' : 'results'} found`;
  const paginationText =
    totalPages > 1 ? `, page ${page} of ${totalPages}` : '';
  return `${resultsText}${paginationText}`;
}

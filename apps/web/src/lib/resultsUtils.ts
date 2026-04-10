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
 * Selection state for all metadata types used in visual filtering.
 */
export interface MetadataSelection {
  tagIds: number[];
  affectedUserIds: number[];
  assigneeIds: number[];
  technologyIds: number[];
}

/**
 * Counts how many criteria match ANY of the selected metadata items.
 * Uses OR logic: a criterion matches if it has any selected tag,
 * affected user, assignee, OR technology.
 *
 * @param criteria - Array of criteria to check
 * @param selection - Selection state for all metadata types
 * @returns Number of criteria that match at least one selected item
 */
export function countCriteriaWithMetadata(
  criteria: Criterion[],
  selection: MetadataSelection
): number {
  const { tagIds, affectedUserIds, assigneeIds, technologyIds } = selection;

  const hasAnyFilter =
    tagIds.length > 0 ||
    affectedUserIds.length > 0 ||
    assigneeIds.length > 0 ||
    technologyIds.length > 0;

  if (!hasAnyFilter) return criteria.length;

  return criteria.filter((criterion) => {
    // OR logic: match if criterion has ANY selected item from ANY type
    const matchesTags =
      tagIds.length > 0 &&
      criterion.tags?.some((tag) => tagIds.includes(tag.id));

    const matchesAffectedUsers =
      affectedUserIds.length > 0 &&
      criterion.affected_users?.some((user) => affectedUserIds.includes(user.id));

    const matchesAssignees =
      assigneeIds.length > 0 &&
      criterion.assignees?.some((assignee) => assigneeIds.includes(assignee.id));

    const matchesTechnologies =
      technologyIds.length > 0 &&
      criterion.technologies?.some((tech) => technologyIds.includes(tech.id));

    return matchesTags || matchesAffectedUsers || matchesAssignees || matchesTechnologies;
  }).length;
}

/**
 * Checks if a single criterion matches any of the selected metadata items.
 * Used by components to determine if a criterion should be blurred.
 *
 * @param criterion - The criterion to check
 * @param selection - Selection state for all metadata types
 * @returns True if criterion matches any selection OR if no selections exist
 */
export function criterionMatchesSelection(
  criterion: Criterion,
  selection: MetadataSelection
): boolean {
  const { tagIds, affectedUserIds, assigneeIds, technologyIds } = selection;

  const hasAnyFilter =
    tagIds.length > 0 ||
    affectedUserIds.length > 0 ||
    assigneeIds.length > 0 ||
    technologyIds.length > 0;

  // If no filters, everything matches
  if (!hasAnyFilter) return true;

  // OR logic: match if criterion has ANY selected item from ANY type
  const matchesTags =
    tagIds.length > 0 &&
    criterion.tags?.some((tag) => tagIds.includes(tag.id));

  const matchesAffectedUsers =
    affectedUserIds.length > 0 &&
    criterion.affected_users?.some((user) => affectedUserIds.includes(user.id));

  const matchesAssignees =
    assigneeIds.length > 0 &&
    criterion.assignees?.some((assignee) => assigneeIds.includes(assignee.id));

  const matchesTechnologies =
    technologyIds.length > 0 &&
    criterion.technologies?.some((tech) => technologyIds.includes(tech.id));

  return !!(matchesTags || matchesAffectedUsers || matchesAssignees || matchesTechnologies);
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

import type { Criterion, Tag } from './types';

/**
 * Extracts all unique tags from an array of criteria.
 * Returns a Map for efficient tag lookup by ID.
 *
 * @param criteria - Array of criteria to extract tags from
 * @returns Map of tag ID to Tag object
 */
export function getAllTags(criteria: Criterion[]): Map<number, Tag> {
  const tagMap = new Map<number, Tag>();
  criteria.forEach((criterion) => {
    criterion.tags?.forEach((tagWithScore) => {
      if (!tagMap.has(tagWithScore.id)) {
        tagMap.set(tagWithScore.id, {
          id: tagWithScore.id,
          name: tagWithScore.name,
          description: tagWithScore.description,
          slug: tagWithScore.slug,
          category: tagWithScore.category,
          icon: tagWithScore.icon,
        });
      }
    });
  });
  return tagMap;
}

/**
 * Gets the full Tag objects for selected tag IDs.
 * Filters out any IDs that don't have corresponding tags in the criteria.
 *
 * @param selectedTagIds - Array of selected tag IDs
 * @param criteria - Array of criteria to extract tags from
 * @returns Array of Tag objects
 */
export function getSelectedTags(
  selectedTagIds: number[],
  criteria: Criterion[]
): Tag[] {
  if (selectedTagIds.length === 0) return [];

  const allTags = getAllTags(criteria);
  return selectedTagIds
    .map((id) => allTags.get(id))
    .filter((tag): tag is Tag => tag !== undefined);
}

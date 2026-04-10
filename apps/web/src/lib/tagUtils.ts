import type {
  Criterion,
  Tag,
  AffectedUser,
  Assignee,
  Technology,
} from './types';

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

/**
 * Extracts all unique affected users from an array of criteria.
 * Returns a Map for efficient lookup by ID.
 */
export function getAllAffectedUsers(
  criteria: Criterion[]
): Map<number, AffectedUser> {
  const map = new Map<number, AffectedUser>();
  criteria.forEach((criterion) => {
    criterion.affected_users?.forEach((user) => {
      if (!map.has(user.id)) {
        map.set(user.id, {
          id: user.id,
          name: user.name,
          description: user.description,
          slug: user.slug,
          icon: user.icon,
        });
      }
    });
  });
  return map;
}

/**
 * Gets the full AffectedUser objects for selected IDs.
 */
export function getSelectedAffectedUsers(
  selectedIds: number[],
  criteria: Criterion[]
): AffectedUser[] {
  if (selectedIds.length === 0) return [];

  const allItems = getAllAffectedUsers(criteria);
  return selectedIds
    .map((id) => allItems.get(id))
    .filter((item): item is AffectedUser => item !== undefined);
}

/**
 * Extracts all unique assignees from an array of criteria.
 * Returns a Map for efficient lookup by ID.
 */
export function getAllAssignees(criteria: Criterion[]): Map<number, Assignee> {
  const map = new Map<number, Assignee>();
  criteria.forEach((criterion) => {
    criterion.assignees?.forEach((assignee) => {
      if (!map.has(assignee.id)) {
        map.set(assignee.id, {
          id: assignee.id,
          name: assignee.name,
          description: assignee.description,
          slug: assignee.slug,
          icon: assignee.icon,
        });
      }
    });
  });
  return map;
}

/**
 * Gets the full Assignee objects for selected IDs.
 */
export function getSelectedAssignees(
  selectedIds: number[],
  criteria: Criterion[]
): Assignee[] {
  if (selectedIds.length === 0) return [];

  const allItems = getAllAssignees(criteria);
  return selectedIds
    .map((id) => allItems.get(id))
    .filter((item): item is Assignee => item !== undefined);
}

/**
 * Extracts all unique technologies from an array of criteria.
 * Returns a Map for efficient lookup by ID.
 */
export function getAllTechnologies(
  criteria: Criterion[]
): Map<number, Technology> {
  const map = new Map<number, Technology>();
  criteria.forEach((criterion) => {
    criterion.technologies?.forEach((tech) => {
      if (!map.has(tech.id)) {
        map.set(tech.id, {
          id: tech.id,
          name: tech.name,
          description: tech.description,
          slug: tech.slug,
          icon: tech.icon,
        });
      }
    });
  });
  return map;
}

/**
 * Gets the full Technology objects for selected IDs.
 */
export function getSelectedTechnologies(
  selectedIds: number[],
  criteria: Criterion[]
): Technology[] {
  if (selectedIds.length === 0) return [];

  const allItems = getAllTechnologies(criteria);
  return selectedIds
    .map((id) => allItems.get(id))
    .filter((item): item is Technology => item !== undefined);
}

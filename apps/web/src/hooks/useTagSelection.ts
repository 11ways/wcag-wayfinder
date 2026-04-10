import { useState } from 'react';

import { announce } from '../utils/announce';
import { MAX_SELECTED_TAGS, MAX_TAGS_MESSAGE } from '../lib/constants';

import type { QueryFilters } from '../lib/types';

interface UseTagSelectionOptions {
  filters: QueryFilters;
  setFilters: React.Dispatch<React.SetStateAction<QueryFilters>>;
}

interface UseTagSelectionReturn {
  hideCollapsed: boolean;
  // Tags (existing)
  handleTagToggle: (tagId: number) => void;
  handleRemoveTag: (tagId: number) => void;
  // Affected Users (Affects)
  handleAffectedUserToggle: (id: number) => void;
  handleRemoveAffectedUser: (id: number) => void;
  // Assignees (Responsibility)
  handleAssigneeToggle: (id: number) => void;
  handleRemoveAssignee: (id: number) => void;
  // Technologies
  handleTechnologyToggle: (id: number) => void;
  handleRemoveTechnology: (id: number) => void;
  // Combined
  handleClearAllTags: () => void;
  handleToggleCollapse: () => void;
  // Helper to check if any metadata is selected
  hasAnySelection: boolean;
}

/**
 * Custom hook for managing tag and metadata selection state and interactions.
 * Handles:
 * - Adding/removing tags (max 3 per type)
 * - Adding/removing affected users (max 3)
 * - Adding/removing assignees (max 3)
 * - Adding/removing technologies (max 3)
 * - Clearing all selections
 * - Toggling visibility of non-matching criteria
 * - Screen reader announcements for all actions
 *
 * @param options - Hook configuration with filters and setFilters
 * @returns Tag/metadata selection handlers and state
 */
export function useTagSelection({
  filters,
  setFilters,
}: UseTagSelectionOptions): UseTagSelectionReturn {
  const [hideCollapsed, setHideCollapsed] = useState<boolean>(false);

  // Helper to create toggle handlers for each metadata type
  const createToggleHandler = (
    filterKey: 'tag_ids' | 'affected_user_ids' | 'assignee_ids' | 'technology_ids',
    typeName: string
  ) => {
    return (id: number) => {
      setFilters((prev) => {
        const currentIds = prev[filterKey] || [];

        if (currentIds.includes(id)) {
          // Remove
          const newIds = currentIds.filter((existingId) => existingId !== id);
          const count = newIds.length;
          announce(
            count === 0
              ? `${typeName} filter cleared`
              : `${count} ${typeName}${count === 1 ? '' : 's'} selected`
          );
          return {
            ...prev,
            [filterKey]: newIds.length > 0 ? newIds : undefined,
            page: 1,
          };
        } else {
          // Add (check max)
          if (currentIds.length >= MAX_SELECTED_TAGS) {
            announce(MAX_TAGS_MESSAGE);
            return prev;
          }
          const newIds = [...currentIds, id];
          announce(
            `${newIds.length} ${typeName}${newIds.length === 1 ? '' : 's'} selected`
          );
          return {
            ...prev,
            [filterKey]: newIds,
            page: 1,
          };
        }
      });
    };
  };

  // Helper to create remove handlers for each metadata type
  const createRemoveHandler = (
    filterKey: 'tag_ids' | 'affected_user_ids' | 'assignee_ids' | 'technology_ids',
    typeName: string
  ) => {
    return (id: number) => {
      setFilters((prev) => {
        const currentIds = prev[filterKey] || [];
        const newIds = currentIds.filter((existingId) => existingId !== id);
        const count = newIds.length;
        announce(
          count === 0
            ? `${typeName} filter cleared`
            : `${typeName} removed. ${count} ${typeName}${count === 1 ? '' : 's'} remaining`
        );
        return {
          ...prev,
          [filterKey]: newIds.length > 0 ? newIds : undefined,
          page: 1,
        };
      });
    };
  };

  // Tags handlers
  const handleTagToggle = createToggleHandler('tag_ids', 'tag');
  const handleRemoveTag = createRemoveHandler('tag_ids', 'tag');

  // Affected Users handlers
  const handleAffectedUserToggle = createToggleHandler('affected_user_ids', 'affects filter');
  const handleRemoveAffectedUser = createRemoveHandler('affected_user_ids', 'affects filter');

  // Assignees handlers
  const handleAssigneeToggle = createToggleHandler('assignee_ids', 'responsibility filter');
  const handleRemoveAssignee = createRemoveHandler('assignee_ids', 'responsibility filter');

  // Technologies handlers
  const handleTechnologyToggle = createToggleHandler('technology_ids', 'technology filter');
  const handleRemoveTechnology = createRemoveHandler('technology_ids', 'technology filter');

  const handleClearAllTags = () => {
    const tagCount = (filters.tag_ids || []).length;
    const affectCount = (filters.affected_user_ids || []).length;
    const assigneeCount = (filters.assignee_ids || []).length;
    const techCount = (filters.technology_ids || []).length;
    const totalCount = tagCount + affectCount + assigneeCount + techCount;

    setFilters((prev) => ({
      ...prev,
      tag_ids: undefined,
      affected_user_ids: undefined,
      assignee_ids: undefined,
      technology_ids: undefined,
      page: 1,
    }));
    announce(
      `All filters cleared. ${totalCount} ${totalCount === 1 ? 'filter' : 'filters'} removed`
    );
    setHideCollapsed(false); // Reset collapse state when clearing
  };

  const handleToggleCollapse = () => {
    setHideCollapsed((prev) => !prev);
    announce(
      hideCollapsed ? 'Hidden criteria expanded' : 'Hidden criteria collapsed'
    );
  };

  // Check if any metadata is selected
  const hasAnySelection =
    (filters.tag_ids?.length || 0) > 0 ||
    (filters.affected_user_ids?.length || 0) > 0 ||
    (filters.assignee_ids?.length || 0) > 0 ||
    (filters.technology_ids?.length || 0) > 0;

  return {
    hideCollapsed,
    handleTagToggle,
    handleRemoveTag,
    handleAffectedUserToggle,
    handleRemoveAffectedUser,
    handleAssigneeToggle,
    handleRemoveAssignee,
    handleTechnologyToggle,
    handleRemoveTechnology,
    handleClearAllTags,
    handleToggleCollapse,
    hasAnySelection,
  };
}

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
  handleTagToggle: (tagId: number) => void;
  handleRemoveTag: (tagId: number) => void;
  handleClearAllTags: () => void;
  handleToggleCollapse: () => void;
}

/**
 * Custom hook for managing tag selection state and interactions.
 * Handles:
 * - Adding/removing tags (max 3 tags)
 * - Clearing all tags
 * - Toggling visibility of non-matching criteria
 * - Screen reader announcements for all actions
 *
 * @param options - Hook configuration with filters and setFilters
 * @returns Tag selection handlers and state
 */
export function useTagSelection({
  filters,
  setFilters,
}: UseTagSelectionOptions): UseTagSelectionReturn {
  const [hideCollapsed, setHideCollapsed] = useState<boolean>(false);

  const handleTagToggle = (tagId: number) => {
    setFilters((prev) => {
      const currentTags = prev.tag_ids || [];

      // Check if tag is already selected
      if (currentTags.includes(tagId)) {
        // Remove tag
        const newTags = currentTags.filter((id) => id !== tagId);
        const count = newTags.length;
        announce(
          count === 0
            ? 'Tag filter cleared'
            : `${count} ${count === 1 ? 'tag' : 'tags'} selected`
        );
        return {
          ...prev,
          tag_ids: newTags.length > 0 ? newTags : undefined,
          page: 1, // Reset to first page
        };
      } else {
        // Add tag (max allowed)
        if (currentTags.length >= MAX_SELECTED_TAGS) {
          // Already at max, don't add
          announce(MAX_TAGS_MESSAGE);
          return prev;
        }
        const newTags = [...currentTags, tagId];
        announce(
          `${newTags.length} ${newTags.length === 1 ? 'tag' : 'tags'} selected`
        );
        return {
          ...prev,
          tag_ids: newTags,
          page: 1, // Reset to first page
        };
      }
    });
  };

  const handleRemoveTag = (tagId: number) => {
    setFilters((prev) => {
      const currentTags = prev.tag_ids || [];
      const newTags = currentTags.filter((id) => id !== tagId);
      const count = newTags.length;
      announce(
        count === 0
          ? 'Tag filter cleared'
          : `Tag removed. ${count} ${count === 1 ? 'tag' : 'tags'} remaining`
      );
      return {
        ...prev,
        tag_ids: newTags.length > 0 ? newTags : undefined,
        page: 1,
      };
    });
  };

  const handleClearAllTags = () => {
    const count = (filters.tag_ids || []).length;
    setFilters((prev) => ({
      ...prev,
      tag_ids: undefined,
      page: 1,
    }));
    announce(
      `All tags cleared. ${count} ${count === 1 ? 'tag' : 'tags'} removed`
    );
    setHideCollapsed(false); // Reset collapse state when clearing tags
  };

  const handleToggleCollapse = () => {
    setHideCollapsed((prev) => !prev);
    announce(
      hideCollapsed ? 'Hidden criteria expanded' : 'Hidden criteria collapsed'
    );
  };

  return {
    hideCollapsed,
    handleTagToggle,
    handleRemoveTag,
    handleClearAllTags,
    handleToggleCollapse,
  };
}

import type { QueryFilters } from './types';
import type { ViewMode } from '../components/ViewToggle';

const FILTERS_STORAGE_KEY = 'wcag-explorer-filters';
const VIEW_MODE_STORAGE_KEY = 'wcag-explorer-view-mode';
const SIDEBAR_VISIBLE_STORAGE_KEY = 'wcag-explorer-sidebar-visible';

export interface SavedFilterState {
  filters: QueryFilters;
  timestamp: number;
}

/**
 * Save filters to localStorage
 */
export function saveFilters(filters: QueryFilters): void {
  try {
    const state: SavedFilterState = {
      filters,
      timestamp: Date.now(),
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save filters to localStorage:', error);
  }
}

/**
 * Load filters from localStorage
 * Returns null if no saved filters exist or if they're invalid
 */
export function loadFilters(): QueryFilters | null {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!stored) return null;

    const state: SavedFilterState = JSON.parse(stored);

    // Validate that required filter arrays are not empty
    // If version, level, or principle arrays are empty, the state is invalid
    const hasEmptyVersions = state.filters.version !== undefined && state.filters.version.length === 0;
    const hasEmptyLevels = state.filters.level !== undefined && state.filters.level.length === 0;
    const hasEmptyPrinciples = state.filters.principle !== undefined && state.filters.principle.length === 0;

    if (hasEmptyVersions || hasEmptyLevels || hasEmptyPrinciples) {
      // Invalid state detected - clear it and return null to use defaults
      clearFilters();
      return null;
    }

    // Optional: Add expiration logic here if needed
    // For example, expire after 30 days:
    // const MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
    // if (Date.now() - state.timestamp > MAX_AGE) {
    //   clearFilters();
    //   return null;
    // }

    return state.filters;
  } catch (error) {
    console.error('Failed to load filters from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved filters from localStorage
 */
export function clearFilters(): void {
  try {
    localStorage.removeItem(FILTERS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear filters from localStorage:', error);
  }
}

/**
 * Save view mode to localStorage
 */
export function saveViewMode(viewMode: ViewMode): void {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  } catch (error) {
    console.error('Failed to save view mode to localStorage:', error);
  }
}

/**
 * Load view mode from localStorage
 * Returns 'card' as default if no saved view mode exists
 */
export function loadViewMode(): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored && isValidViewMode(stored)) {
      return stored as ViewMode;
    }
    return 'card'; // Default view mode
  } catch (error) {
    console.error('Failed to load view mode from localStorage:', error);
    return 'card';
  }
}

/**
 * Check if a string is a valid ViewMode
 */
function isValidViewMode(value: string): boolean {
  return ['card', 'list', 'grid'].includes(value);
}

/**
 * Clear view mode from localStorage
 */
export function clearViewMode(): void {
  try {
    localStorage.removeItem(VIEW_MODE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear view mode from localStorage:', error);
  }
}

/**
 * Clear all saved state (filters and view mode)
 */
export function clearAllSavedState(): void {
  clearFilters();
  clearViewMode();
}

/**
 * Save sidebar visibility to localStorage
 */
export function saveSidebarVisible(visible: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_VISIBLE_STORAGE_KEY, JSON.stringify(visible));
  } catch (error) {
    console.error('Failed to save sidebar visibility to localStorage:', error);
  }
}

/**
 * Load sidebar visibility from localStorage
 * Returns true as default (sidebar visible by default)
 */
export function loadSidebarVisible(): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_VISIBLE_STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
    return true; // Default: sidebar visible
  } catch (error) {
    console.error('Failed to load sidebar visibility from localStorage:', error);
    return true;
  }
}

/**
 * Application-wide constants
 * Centralized location for magic values used throughout the application
 */

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

/**
 * Debounce delay for search input (milliseconds)
 * Prevents excessive API calls while user is typing
 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Delay before showing loading indicator (milliseconds)
 * Prevents flashing for quick loads
 */
export const LOADING_INDICATOR_DELAY_MS = 500;

/**
 * Delay before scrolling to hash target (milliseconds)
 * Ensures content is rendered before scrolling
 */
export const HASH_NAV_SCROLL_DELAY_MS = 300;

// ============================================================================
// TAG SELECTION CONSTANTS
// ============================================================================

/**
 * Maximum number of tags that can be selected simultaneously
 * Limits complexity and maintains UI clarity
 */
export const MAX_SELECTED_TAGS = 3;

/**
 * Message shown when user tries to select more than the maximum number of tags
 */
export const MAX_TAGS_MESSAGE = 'Maximum 3 tags selected';

// ============================================================================
// PAGINATION CONSTANTS
// ============================================================================

/**
 * Default number of items per page
 */
export const DEFAULT_PAGE_SIZE = 25;

/**
 * Default starting page number
 */
export const DEFAULT_PAGE = 1;

// ============================================================================
// ACCESSIBILITY CONSTANTS
// ============================================================================

/**
 * Minimum touch target size (pixels) for WCAG 2.2 Level AA compliance
 * Success Criterion 2.5.8: Target Size (Minimum)
 * @see https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Tailwind classes for minimum touch target size
 * Used throughout the app for interactive elements
 */
export const MIN_TOUCH_TARGET_CLASSES = 'min-h-[44px] min-w-[44px]';

// ============================================================================
// CONTENT PATHS
// ============================================================================

/**
 * Paths to markdown content files relative to /content/{lang}/
 * Use with useLocalizedContent hook which handles language prefixing and fallback
 *
 * @example
 * const { content } = useLocalizedContent(CONTENT_PATHS.filters.version);
 * // Will load /content/en/filters/version.md or fallback
 */
export const CONTENT_PATHS = {
  filters: {
    version: 'filters/version.md',
    level: 'filters/level.md',
    principle: 'filters/principle.md',
  },
  warnings: {
    wcag22Only: 'warnings/wcag-22-only.md',
    emptyVersions: 'warnings/empty-versions.md',
    emptyLevels: 'warnings/empty-levels.md',
    emptyPrinciples: 'warnings/empty-principles.md',
  },
  help: {
    noResults: 'help/no-results.md',
  },
  walkthrough: {
    step1: 'walkthrough/step-1.md',
    step2: 'walkthrough/step-2.md',
    step3: 'walkthrough/step-3.md',
    step4: 'walkthrough/step-4.md',
  },
  levels: {
    levelA: 'levels/level-a.md',
    levelAA: 'levels/level-aa.md',
    levelAAA: 'levels/level-aaa.md',
  },
} as const;

// ============================================================================
// DEFAULT FILTERS
// ============================================================================

/**
 * Default WCAG versions to filter by
 */
export const DEFAULT_VERSIONS = ['2.0', '2.1', '2.2'] as const;

/**
 * Default conformance levels to filter by (A and AA, not AAA)
 */
export const DEFAULT_LEVELS = ['A', 'AA'] as const;

/**
 * All WCAG principles
 */
export const ALL_PRINCIPLES = [
  'Perceivable',
  'Operable',
  'Understandable',
  'Robust',
] as const;

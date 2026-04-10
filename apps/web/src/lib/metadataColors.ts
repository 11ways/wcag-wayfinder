/**
 * Color configuration for all filterable metadata types.
 * Centralizes styling for consistent visual filtering across the app.
 */

export type MetadataType = 'tags' | 'affects' | 'responsibility' | 'technology';

interface MetadataColorConfig {
  selected: string;
  unselected: string;
  disabled: string;
}

export const METADATA_COLORS: Record<MetadataType, MetadataColorConfig> = {
  tags: {
    selected:
      'border-yellow-500 bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
    unselected:
      'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    disabled:
      'cursor-not-allowed border-transparent bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
  },
  affects: {
    selected:
      'border-blue-500 bg-blue-200 text-blue-900 dark:border-blue-400 dark:bg-blue-800 dark:text-blue-100',
    unselected:
      'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
    disabled:
      'cursor-not-allowed border-transparent bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
  },
  responsibility: {
    selected:
      'border-purple-500 bg-purple-200 text-purple-900 dark:border-purple-400 dark:bg-purple-800 dark:text-purple-100',
    unselected:
      'border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800',
    disabled:
      'cursor-not-allowed border-transparent bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
  },
  technology: {
    selected:
      'border-green-500 bg-green-200 text-green-900 dark:border-green-400 dark:bg-green-800 dark:text-green-100',
    unselected:
      'border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800',
    disabled:
      'cursor-not-allowed border-transparent bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
  },
};

/**
 * Get the appropriate color classes for a metadata button based on its state.
 */
export function getMetadataButtonClasses(
  type: MetadataType,
  isSelected: boolean,
  isDisabled: boolean
): string {
  const colors = METADATA_COLORS[type];
  if (isSelected) return colors.selected;
  if (isDisabled) return colors.disabled;
  return colors.unselected;
}

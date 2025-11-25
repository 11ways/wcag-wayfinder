/**
 * WCAG Conformance Level utilities
 */

export type WcagLevel = 'A' | 'AA' | 'AAA';

/**
 * Get the CSS class for a WCAG conformance level badge
 * @param level - The WCAG conformance level
 * @returns The CSS class name for the badge
 */
export function getLevelClass(level: string): string {
  switch (level) {
    case 'A':
      return 'badge-a';
    case 'AA':
      return 'badge-aa';
    case 'AAA':
      return 'badge-aaa';
    default:
      return '';
  }
}

/**
 * Get the shape indicator for a WCAG conformance level
 * Used for color-blind accessibility - each level has a unique shape
 * @param level - The WCAG conformance level
 * @returns The Unicode shape character (● for A, ■ for AA, ▲ for AAA)
 */
export function getLevelShape(level: string): string {
  switch (level) {
    case 'A':
      return '●'; // Circle
    case 'AA':
      return '■'; // Square
    case 'AAA':
      return '▲'; // Triangle
    default:
      return '';
  }
}

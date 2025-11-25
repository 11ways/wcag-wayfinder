/**
 * WCAG Principle colors and utilities
 */

export type WcagPrinciple = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';

/**
 * Color mapping for WCAG principles
 * Used for visual distinction in the UI (page curls, filters, badges)
 */
export const PRINCIPLE_COLORS: Record<WcagPrinciple, string> = {
  Perceivable: '#f4b684',
  Operable: '#ded7fc',
  Understandable: '#96b0d4',
  Robust: '#ec8269',
} as const;

/**
 * Default fallback color for unknown principles
 */
const DEFAULT_COLOR = '#3b82f6';

/**
 * Get the color associated with a WCAG principle
 * @param principle - The WCAG principle name
 * @returns The hex color code for the principle
 */
export function getPrincipleColor(principle: string): string {
  if (principle in PRINCIPLE_COLORS) {
    return PRINCIPLE_COLORS[principle as WcagPrinciple];
  }
  return DEFAULT_COLOR;
}

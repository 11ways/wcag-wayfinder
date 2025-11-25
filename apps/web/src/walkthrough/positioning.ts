/**
 * Walkthrough Mode - Tooltip Positioning
 */

import type { Position } from './types';

const TOOLTIP_OFFSET = 16; // Gap between target and tooltip
const VIEWPORT_PADDING = 16; // Padding from viewport edges

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

/**
 * Gets the bounding rect with viewport coordinates
 */
function getRect(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom,
  };
}

/**
 * Checks if tooltip fits in viewport at given position
 */
function fitsInViewport(
  tooltipRect: { width: number; height: number },
  position: { top: number; left: number }
): boolean {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return (
    position.top >= VIEWPORT_PADDING &&
    position.left >= VIEWPORT_PADDING &&
    position.top + tooltipRect.height <= viewportHeight - VIEWPORT_PADDING &&
    position.left + tooltipRect.width <= viewportWidth - VIEWPORT_PADDING
  );
}

/**
 * Calculates tooltip position for a placement
 */
function calculatePosition(
  targetRect: Rect,
  tooltipRect: { width: number; height: number },
  placement: 'top' | 'right' | 'bottom' | 'left'
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = targetRect.top - tooltipRect.height - TOOLTIP_OFFSET;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      break;

    case 'right':
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.right + TOOLTIP_OFFSET;
      break;

    case 'bottom':
      top = targetRect.bottom + TOOLTIP_OFFSET;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      break;

    case 'left':
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.left - tooltipRect.width - TOOLTIP_OFFSET;
      break;
  }

  return { top, left };
}

/**
 * Finds the best placement with collision detection
 */
export function calculateTooltipPosition(
  target: HTMLElement,
  tooltip: HTMLElement
): Position {
  const targetRect = getRect(target);
  const tooltipRect = {
    width: tooltip.offsetWidth,
    height: tooltip.offsetHeight,
  };

  // Try placements in order of preference
  const placements: Array<'top' | 'right' | 'bottom' | 'left'> = [
    'right',
    'bottom',
    'left',
    'top',
  ];

  for (const placement of placements) {
    const position = calculatePosition(targetRect, tooltipRect, placement);

    if (fitsInViewport(tooltipRect, position)) {
      return {
        ...position,
        placement,
      };
    }
  }

  // Fallback: use bottom and clamp to viewport
  const fallbackPosition = calculatePosition(targetRect, tooltipRect, 'bottom');

  return {
    top: Math.max(
      VIEWPORT_PADDING,
      Math.min(
        fallbackPosition.top,
        window.innerHeight - tooltipRect.height - VIEWPORT_PADDING
      )
    ),
    left: Math.max(
      VIEWPORT_PADDING,
      Math.min(
        fallbackPosition.left,
        window.innerWidth - tooltipRect.width - VIEWPORT_PADDING
      )
    ),
    placement: 'bottom',
  };
}

/**
 * Scrolls target into view if needed
 */
export function scrollToTarget(target: HTMLElement): void {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  target.scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth',
    block: 'center',
    inline: 'nearest',
  });
}

/**
 * Gets the highlight outline dimensions for the target
 */
export function getHighlightRect(target: HTMLElement): DOMRect {
  return target.getBoundingClientRect();
}

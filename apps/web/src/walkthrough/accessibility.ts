/**
 * Walkthrough Mode - Accessibility Features
 */

import type { AriaLive } from './types';

/**
 * ARIA live region manager
 */
class LiveRegion {
  private element: HTMLElement | null = null;

  constructor(private ariaLive: AriaLive = 'polite') {}

  /**
   * Creates and mounts the live region
   */
  mount(): void {
    if (this.element) return;

    this.element = document.createElement('div');
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', this.ariaLive);
    this.element.setAttribute('aria-atomic', 'true');
    this.element.className = 'walkthrough-sr-only';
    document.body.appendChild(this.element);
  }

  /**
   * Announces a message to screen readers
   */
  announce(message: string): void {
    if (!this.element) {
      this.mount();
    }

    if (this.element) {
      // Clear first to ensure re-announcement
      this.element.textContent = '';

      // Announce after a brief delay
      setTimeout(() => {
        if (this.element) {
          this.element.textContent = message;
        }
      }, 100);
    }
  }

  /**
   * Removes the live region
   */
  unmount(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}

/**
 * Focus trap manager for the tooltip dialog
 */
export class FocusTrap {
  private previousFocus: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  /**
   * Activates focus trap on the container
   */
  activate(container: HTMLElement): void {
    // Store currently focused element
    this.previousFocus = document.activeElement as HTMLElement;

    // Find all focusable elements
    this.updateFocusableElements(container);

    // Focus first element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    // Add keyboard listener
    container.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Deactivates focus trap and restores previous focus
   */
  deactivate(container: HTMLElement): void {
    container.removeEventListener('keydown', this.handleKeyDown);

    // Restore previous focus
    if (this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }

  /**
   * Updates the list of focusable elements
   */
  private updateFocusableElements(container: HTMLElement): void {
    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    this.focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(selector)
    );
  }

  /**
   * Handles tab key to trap focus
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = this.focusableElements[0];
    const lastElement =
      this.focusableElements[this.focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift+Tab: wrap to last element
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: wrap to first element
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };
}

/**
 * Singleton live region instance
 */
let liveRegion: LiveRegion | null = null;

/**
 * Announces a message to screen readers
 */
export function announce(message: string, priority: AriaLive = 'polite'): void {
  if (!liveRegion || liveRegion['ariaLive'] !== priority) {
    if (liveRegion) {
      liveRegion.unmount();
    }
    liveRegion = new LiveRegion(priority);
    liveRegion.mount();
  }

  liveRegion.announce(message);
}

/**
 * Cleans up accessibility features
 */
export function cleanup(): void {
  if (liveRegion) {
    liveRegion.unmount();
    liveRegion = null;
  }
}

/**
 * Checks if reduced motion is preferred
 * Respects both system preference and user override via body data attribute
 */
export function prefersReducedMotion(): boolean {
  // Check for user override first
  const bodyDataAttr = document.body.getAttribute('data-reduce-motion');

  if (bodyDataAttr === 'true') {
    return true;
  }

  if (bodyDataAttr === 'false') {
    return false;
  }

  // Fall back to system preference
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Checks if RTL direction is active
 */
export function isRTL(): boolean {
  return (
    document.documentElement.dir === 'rtl' ||
    getComputedStyle(document.documentElement).direction === 'rtl'
  );
}

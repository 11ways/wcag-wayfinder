/**
 * Walkthrough Mode - Overlay and Highlight System
 */

import { getHighlightRect } from './positioning';
import { prefersReducedMotion } from './accessibility';

/**
 * Manages the page overlay and target highlighting
 */
export class Overlay {
  private scrimElement: HTMLElement | null = null;
  private highlightElement: HTMLElement | null = null;
  private currentTarget: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;

  /**
   * Creates and mounts the overlay elements
   */
  mount(): void {
    if (this.scrimElement) return;

    // Create scrim (semi-transparent backdrop)
    this.scrimElement = document.createElement('div');
    this.scrimElement.className = 'walkthrough-scrim';
    this.scrimElement.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.scrimElement);

    // Create highlight outline
    this.highlightElement = document.createElement('div');
    this.highlightElement.className = 'walkthrough-highlight';
    this.highlightElement.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.highlightElement);

    // Setup observers for repositioning
    this.setupObservers();
  }

  /**
   * Sets up resize and mutation observers
   */
  private setupObservers(): void {
    // Resize observer for window size changes
    this.resizeObserver = new ResizeObserver(() => {
      if (this.currentTarget) {
        this.updateHighlight(this.currentTarget);
      }
    });
    this.resizeObserver.observe(document.body);

    // Mutation observer for DOM changes
    this.mutationObserver = new MutationObserver(() => {
      if (this.currentTarget) {
        this.updateHighlight(this.currentTarget);
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
  }

  /**
   * Highlights a target element
   */
  highlightTarget(target: HTMLElement): void {
    this.currentTarget = target;
    this.updateHighlight(target);

    // Add transition class after mount
    if (this.highlightElement && !prefersReducedMotion()) {
      requestAnimationFrame(() => {
        this.highlightElement?.classList.add('walkthrough-highlight--animate');
      });
    }
  }

  /**
   * Updates highlight position and size
   */
  private updateHighlight(target: HTMLElement): void {
    if (!this.highlightElement) return;

    const rect = getHighlightRect(target);

    // Position the highlight
    this.highlightElement.style.top = `${rect.top}px`;
    this.highlightElement.style.left = `${rect.left}px`;
    this.highlightElement.style.width = `${rect.width}px`;
    this.highlightElement.style.height = `${rect.height}px`;
  }

  /**
   * Checks if current target is still visible
   */
  isTargetVisible(): boolean {
    if (!this.currentTarget) return false;

    const rect = this.currentTarget.getBoundingClientRect();
    const style = window.getComputedStyle(this.currentTarget);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  /**
   * Gets the current target element
   */
  getCurrentTarget(): HTMLElement | null {
    return this.currentTarget;
  }

  /**
   * Removes the overlay and cleans up
   */
  unmount(): void {
    // Remove scrim
    if (this.scrimElement && this.scrimElement.parentNode) {
      this.scrimElement.parentNode.removeChild(this.scrimElement);
      this.scrimElement = null;
    }

    // Remove highlight
    if (this.highlightElement && this.highlightElement.parentNode) {
      this.highlightElement.parentNode.removeChild(this.highlightElement);
      this.highlightElement = null;
    }

    // Clean up observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    this.currentTarget = null;
  }
}

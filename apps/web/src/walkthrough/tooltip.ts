/**
 * Walkthrough Mode - Tooltip Component
 */

import type { StepContent } from './types';
import { FocusTrap, announce } from './accessibility';
import { calculateTooltipPosition } from './positioning';

/**
 * Manages the walkthrough tooltip (coachmark) dialog
 */
export class Tooltip {
  private container: HTMLElement | null = null;
  private focusTrap: FocusTrap = new FocusTrap();
  private currentTarget: HTMLElement | null = null;

  // Callbacks
  private onNext: (() => void) | null = null;
  private onPrev: (() => void) | null = null;
  private onExit: (() => void) | null = null;

  /**
   * Creates and mounts the tooltip
   */
  mount(callbacks: {
    onNext: () => void;
    onPrev: () => void;
    onExit: () => void;
  }): void {
    if (this.container) return;

    this.onNext = callbacks.onNext;
    this.onPrev = callbacks.onPrev;
    this.onExit = callbacks.onExit;

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'walkthrough-tooltip';
    this.container.setAttribute('role', 'dialog');
    this.container.setAttribute('aria-modal', 'true');
    this.container.setAttribute('aria-labelledby', 'wt-title');
    this.container.setAttribute('aria-describedby', 'wt-body');

    // Build tooltip structure
    this.container.innerHTML = `
      <div class="walkthrough-tooltip__content">
        <div class="walkthrough-tooltip__header">
          <h2 id="wt-title" class="walkthrough-tooltip__title"></h2>
          <button
            id="wt-exit"
            class="walkthrough-tooltip__exit"
            aria-label="Exit walkthrough"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <div id="wt-body" class="walkthrough-tooltip__body"></div>
        <div class="walkthrough-tooltip__footer">
          <div class="walkthrough-tooltip__progress" aria-live="polite" aria-atomic="true"></div>
          <div class="walkthrough-tooltip__controls">
            <button
              id="wt-prev"
              class="walkthrough-tooltip__button walkthrough-tooltip__button--secondary"
              type="button"
            >
              Previous
            </button>
            <button
              id="wt-next"
              class="walkthrough-tooltip__button walkthrough-tooltip__button--primary"
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Attach event listeners
    this.attachEventListeners();

    // Activate focus trap
    this.focusTrap.activate(this.container);
  }

  /**
   * Attaches event listeners to buttons
   */
  private attachEventListeners(): void {
    if (!this.container) return;

    const exitBtn = this.container.querySelector('#wt-exit');
    const prevBtn = this.container.querySelector('#wt-prev');
    const nextBtn = this.container.querySelector('#wt-next');

    if (exitBtn) {
      exitBtn.addEventListener('click', () => this.onExit?.());
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.onPrev?.());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.onNext?.());
    }

    // Keyboard shortcuts
    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Handles keyboard events
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.onExit?.();
        break;

      case 'Enter':
      case ' ':
        // Only if not already on a button
        if (
          event.target instanceof HTMLElement &&
          event.target.tagName !== 'BUTTON'
        ) {
          event.preventDefault();
          if (event.shiftKey) {
            this.onPrev?.();
          } else {
            this.onNext?.();
          }
        }
        break;
    }
  };

  /**
   * Updates tooltip content
   */
  updateContent(content: StepContent, current: number, total: number): void {
    if (!this.container) return;

    const titleEl = this.container.querySelector('#wt-title');
    const bodyEl = this.container.querySelector('#wt-body');
    const progressEl = this.container.querySelector(
      '.walkthrough-tooltip__progress'
    );
    const prevBtn = this.container.querySelector(
      '#wt-prev'
    ) as HTMLButtonElement;
    const nextBtn = this.container.querySelector(
      '#wt-next'
    ) as HTMLButtonElement;

    // Update title
    if (titleEl) {
      titleEl.textContent = content.title;
    }

    // Update body
    if (bodyEl) {
      bodyEl.innerHTML = content.body;
    }

    // Update progress
    if (progressEl) {
      progressEl.textContent = `Step ${current} of ${total}`;
    }

    // Update button states
    if (prevBtn) {
      prevBtn.disabled = current === 1;
    }

    if (nextBtn) {
      nextBtn.textContent = current === total ? 'Finish' : 'Next';
    }

    // Announce to screen readers
    announce(`Step ${current} of ${total}: ${content.title}`);
  }

  /**
   * Positions the tooltip relative to target
   */
  position(target: HTMLElement): void {
    if (!this.container) return;

    this.currentTarget = target;

    // Ensure tooltip is visible for measurement
    this.container.style.visibility = 'hidden';
    this.container.style.display = 'block';

    // Calculate position
    const position = calculateTooltipPosition(target, this.container);

    // Apply position
    this.container.style.top = `${position.top}px`;
    this.container.style.left = `${position.left}px`;
    this.container.style.visibility = 'visible';

    // Add placement class for arrow positioning
    this.container.setAttribute('data-placement', position.placement);
  }

  /**
   * Repositions tooltip (e.g., after scroll/resize)
   */
  reposition(): void {
    if (this.currentTarget) {
      this.position(this.currentTarget);
    }
  }

  /**
   * Removes the tooltip and cleans up
   */
  unmount(): void {
    if (this.container) {
      this.container.removeEventListener('keydown', this.handleKeyDown);
      this.focusTrap.deactivate(this.container);

      if (this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }

      this.container = null;
    }

    this.currentTarget = null;
    this.onNext = null;
    this.onPrev = null;
    this.onExit = null;
  }
}

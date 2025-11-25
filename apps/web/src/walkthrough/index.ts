/**
 * Walkthrough Mode - Main Entry Point
 * A framework-agnostic onboarding tour system
 */

import type { WalkthroughOptions, WalkthroughState } from './types';
import { Overlay } from './overlay';
import { Tooltip } from './tooltip';
import { loadStepContent } from './markdown';
import { scrollToTarget } from './positioning';
import { announce, cleanup as cleanupAccessibility } from './accessibility';

// Session storage key
const STORAGE_KEY = 'walkthrough-progress';

/**
 * Main Walkthrough class
 */
class WalkthroughManager {
  private state: WalkthroughState = {
    current: 1,
    total: 0,
    isActive: false,
    targets: [],
    completed: false,
  };

  private options: Required<WalkthroughOptions> = {
    selectorPrefix: 'walkthrough-',
    startAt: 1,
    onStart: () => {},
    onStepChange: () => {},
    onExit: () => {},
    markdownPath: (n: number) => `/content/walkthrough/step-${n}.md`,
  };

  private overlay = new Overlay();
  private tooltip = new Tooltip();

  /**
   * Starts the walkthrough
   */
  async start(opts: WalkthroughOptions = {}): Promise<void> {
    if (this.state.isActive) {
      console.warn('Walkthrough is already active');
      return;
    }

    // Merge options
    this.options = {
      ...this.options,
      ...opts,
    };

    // Find all target elements
    this.discoverTargets();

    if (this.state.total === 0) {
      announce('No walkthrough steps available', 'assertive');
      console.warn(
        `No elements found with class pattern: ${this.options.selectorPrefix}*`
      );
      return;
    }

    // Check for saved progress
    const savedProgress = this.loadProgress();
    const startingStep =
      savedProgress && savedProgress <= this.state.total
        ? savedProgress
        : this.options.startAt;

    // Initialize state
    this.state.current = Math.max(1, Math.min(startingStep, this.state.total));
    this.state.isActive = true;
    this.state.completed = false;

    // Mount UI
    this.overlay.mount();
    this.tooltip.mount({
      onNext: () => this.next(),
      onPrev: () => this.prev(),
      onExit: () => this.exit(),
    });

    // Show first step
    await this.showStep(this.state.current);

    // Notify
    this.options.onStart(this.state.total);
    announce(`Walkthrough started. ${this.state.total} steps.`);
  }

  /**
   * Discovers all target elements in the DOM
   */
  private discoverTargets(): void {
    const prefix = this.options.selectorPrefix;
    const allElements = document.querySelectorAll(`[class*="${prefix}"]`);

    const stepMap = new Map<number, HTMLElement>();

    allElements.forEach((element) => {
      const classList = Array.from(element.classList);
      const stepClass = classList.find((cls) => cls.startsWith(prefix));

      if (stepClass) {
        const stepNum = parseInt(stepClass.replace(prefix, ''), 10);

        if (!isNaN(stepNum) && stepNum > 0) {
          // Take first visible element for each step number
          if (!stepMap.has(stepNum)) {
            stepMap.set(stepNum, element as HTMLElement);
          }
        }
      }
    });

    // Sort by step number
    const sortedSteps = Array.from(stepMap.keys()).sort((a, b) => a - b);
    this.state.targets = sortedSteps.map((num) => stepMap.get(num)!);
    this.state.total = this.state.targets.length;
  }

  /**
   * Shows a specific step
   */
  private async showStep(stepNumber: number): Promise<void> {
    const index = stepNumber - 1;
    const target = this.state.targets[index];

    if (!target) {
      console.error(`Step ${stepNumber} has no target element`);
      return;
    }

    // Check if target is still visible
    const isVisible = this.isElementVisible(target);

    if (!isVisible) {
      console.warn(`Step ${stepNumber} target is hidden. Skipping.`);
      // Auto-advance if hidden
      if (stepNumber < this.state.total) {
        this.next();
      } else {
        this.exit();
      }
      return;
    }

    // Scroll to target
    scrollToTarget(target);

    // Wait for scroll to complete
    await this.waitForScroll();

    // Highlight target
    this.overlay.highlightTarget(target);

    // Load and show content
    const content = await loadStepContent(stepNumber, this.options.markdownPath);

    this.tooltip.updateContent(content, stepNumber, this.state.total);
    this.tooltip.position(target);

    // Update state
    this.state.current = stepNumber;
    this.saveProgress(stepNumber);

    // Notify
    this.options.onStepChange(stepNumber, this.state.total);
  }

  /**
   * Checks if an element is visible
   */
  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  /**
   * Waits for scroll animation to complete
   */
  private waitForScroll(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
  }

  /**
   * Advances to next step
   */
  next(): void {
    if (!this.state.isActive) return;

    if (this.state.current < this.state.total) {
      this.showStep(this.state.current + 1);
    } else {
      // Completed
      this.state.completed = true;
      this.exit();
    }
  }

  /**
   * Goes to previous step
   */
  prev(): void {
    if (!this.state.isActive) return;

    if (this.state.current > 1) {
      this.showStep(this.state.current - 1);
    }
  }

  /**
   * Goes to a specific step
   */
  goTo(stepNumber: number): void {
    if (!this.state.isActive) return;

    if (stepNumber >= 1 && stepNumber <= this.state.total) {
      this.showStep(stepNumber);
    } else {
      console.warn(`Step ${stepNumber} is out of range (1-${this.state.total})`);
    }
  }

  /**
   * Exits the walkthrough
   */
  exit(): void {
    if (!this.state.isActive) return;

    const completed = this.state.completed;

    // Clean up UI
    this.tooltip.unmount();
    this.overlay.unmount();
    cleanupAccessibility();

    // Clear progress if completed
    if (completed) {
      this.clearProgress();
    }

    // Reset state
    const wasActive = this.state.isActive;
    this.state.isActive = false;

    // Notify
    if (wasActive) {
      this.options.onExit(completed);
      announce(
        completed
          ? 'Walkthrough completed!'
          : 'Walkthrough exited.',
        'polite'
      );
    }
  }

  /**
   * Checks if walkthrough is currently active
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Gets current state
   */
  getState(): { current: number; total: number } {
    return {
      current: this.state.current,
      total: this.state.total,
    };
  }

  /**
   * Saves progress to session storage
   */
  private saveProgress(step: number): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, step.toString());
    } catch (error) {
      console.warn('Failed to save walkthrough progress:', error);
    }
  }

  /**
   * Loads progress from session storage
   */
  private loadProgress(): number | null {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : null;
    } catch (error) {
      console.warn('Failed to load walkthrough progress:', error);
      return null;
    }
  }

  /**
   * Clears saved progress
   */
  private clearProgress(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear walkthrough progress:', error);
    }
  }
}

// Export singleton instance
export const walkthrough = new WalkthroughManager();

// Export types
export type { WalkthroughOptions };

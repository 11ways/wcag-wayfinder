/**
 * Walkthrough Mode - Type Definitions
 */

export interface WalkthroughOptions {
  /** CSS class prefix for step targets (default: 'walkthrough-') */
  selectorPrefix?: string;
  /** Starting step number (1-based; default: 1) */
  startAt?: number;
  /** Callback when walkthrough starts */
  onStart?: (totalSteps: number) => void;
  /** Callback when step changes */
  onStepChange?: (current: number, total: number) => void;
  /** Callback when walkthrough exits */
  onExit?: (completed: boolean) => void;
  /** Function to generate markdown file path for step N */
  markdownPath?: (n: number) => string;
}

export interface WalkthroughState {
  current: number;
  total: number;
  isActive: boolean;
  targets: HTMLElement[];
  completed: boolean;
}

export interface Position {
  top: number;
  left: number;
  placement: 'top' | 'right' | 'bottom' | 'left';
}

export interface StepContent {
  title: string;
  body: string;
}

export type AriaLive = 'polite' | 'assertive';

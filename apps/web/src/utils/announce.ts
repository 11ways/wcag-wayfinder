/**
 * Screen reader announcement utility
 * Based on WordPress wp.a11y.speak() pattern
 *
 * Uses ARIA live regions to announce messages to screen reader users
 * without moving focus or interrupting their current task.
 */

type Priority = 'polite' | 'assertive';

// Event to trigger announcements
const ANNOUNCE_EVENT = 'aria-announce';

// Storage key for announcements preference
const ANNOUNCEMENTS_STORAGE_KEY = 'wcag-explorer-announcements';

/**
 * Check if announcements are enabled
 */
function getAnnouncementsEnabled(): boolean {
  const stored = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
  return stored !== 'false'; // Default to enabled
}

/**
 * Announce a message to screen readers via ARIA live regions
 *
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive' for urgent messages
 *
 * @example
 * announce('Dialog closed');
 * announce('Error: Please fill in all required fields', 'assertive');
 */
export function announce(message: string, priority: Priority = 'polite'): void {
  if (!message || typeof message !== 'string') {
    return;
  }

  // Check if announcements are enabled
  if (!getAnnouncementsEnabled()) {
    console.log(`🔇 Screen Reader announcement skipped (disabled):`, message);
    return;
  }

  // Log to console for debugging
  const priorityLabel = priority === 'assertive' ? '[ASSERTIVE]' : '[POLITE]';
  console.log(`🔊 Screen Reader ${priorityLabel}:`, message);

  // Dispatch custom event that LiveRegion component will listen to
  const event = new CustomEvent(ANNOUNCE_EVENT, {
    detail: { message, priority },
  });

  window.dispatchEvent(event);
}

export { ANNOUNCE_EVENT };
export type { Priority };

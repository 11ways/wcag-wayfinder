import { useEffect } from 'react';

import { HASH_NAV_SCROLL_DELAY_MS } from '../lib/constants';

/**
 * Handles hash navigation to scroll to and highlight specific elements.
 * Looks for hash IDs starting with #sc- (success criterion IDs).
 * Scrolls smoothly to the element and applies a temporary highlight animation.
 *
 * @param dependency - A dependency value that triggers the effect (e.g., results data)
 */
export function useHashNavigation(dependency: any): void {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#sc-')) {
      // Wait for the results to load
      const timeout = setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight animation
          element.classList.add('highlight-fade');
          // Remove animation class after it completes
          setTimeout(() => {
            element.classList.remove('highlight-fade');
          }, 2000);
        }
      }, HASH_NAV_SCROLL_DELAY_MS);

      return () => clearTimeout(timeout);
    }
  }, [dependency]);
}

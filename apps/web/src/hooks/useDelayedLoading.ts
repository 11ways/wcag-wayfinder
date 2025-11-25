import { useState, useEffect } from 'react';

/**
 * Delays showing a loading indicator to prevent flashing for quick loads.
 * Only shows the loading indicator if loading takes longer than the specified delay.
 *
 * @param isLoading - Whether the component is currently loading
 * @param delay - Delay in milliseconds before showing the indicator (default: 500ms)
 * @returns Whether to show the loading indicator
 */
export function useDelayedLoading(
  isLoading: boolean,
  delay: number = 500
): boolean {
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (isLoading) {
      // Only show loading indicator if loading takes longer than delay
      timeoutId = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, delay);
    } else {
      // Immediately hide when loading completes
      setShowLoadingIndicator(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, delay]);

  return showLoadingIndicator;
}

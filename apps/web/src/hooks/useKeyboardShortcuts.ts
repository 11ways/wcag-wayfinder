import { useEffect, RefObject } from 'react';

interface KeyboardShortcutHandlers {
  searchInputRef: RefObject<HTMLInputElement>;
  filtersRef: RefObject<HTMLElement>;
}

/**
 * Sets up keyboard shortcuts for navigation:
 * - `/` focuses the search input
 * - `f` or `F` scrolls to and focuses the filters
 *
 * @param handlers - Object containing refs for search input and filters
 */
export function useKeyboardShortcuts({
  searchInputRef,
  filtersRef,
}: KeyboardShortcutHandlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          filtersRef.current?.focus();
          filtersRef.current?.scrollIntoView({ behavior: 'smooth' });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchInputRef, filtersRef]);
}

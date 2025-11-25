/**
 * Favorites management using localStorage
 */

const FAVORITES_KEY = 'wcag-explorer-favorites';

export function getFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (error) {
    console.error('Error loading favorites:', error);
    return new Set();
  }
}

export function saveFavorites(favorites: Set<string>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
}

export function toggleFavorite(id: string): Set<string> {
  const favorites = getFavorites();

  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }

  saveFavorites(favorites);
  return favorites;
}

export function isFavorite(id: string): boolean {
  return getFavorites().has(id);
}

export function clearAllFavorites(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Error clearing favorites:', error);
  }
}

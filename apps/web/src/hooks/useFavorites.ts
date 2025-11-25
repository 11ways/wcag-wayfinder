import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getFavorites,
  toggleFavorite,
  clearAllFavorites,
} from '../lib/favorites';
import { announce } from '../utils/announce';

interface UseFavoritesOptions {
  isFavoritesPage: boolean;
}

interface UseFavoritesReturn {
  favorites: Set<string>;
  handleToggleFavorite: (id: string) => void;
  handleClearAllFavorites: () => void;
  // Confirmation modal state
  isConfirmModalOpen: boolean;
  confirmClearAll: () => void;
  cancelClearAll: () => void;
}

/**
 * Custom hook for managing favorites state and operations.
 * Handles:
 * - Loading favorites from localStorage on mount
 * - Toggling favorites on/off with announcements
 * - Clearing all favorites with accessible confirmation modal
 * - Navigating away from favorites page when clearing
 *
 * @param options - Hook configuration with isFavoritesPage flag
 * @returns Favorites state, handlers, and confirmation modal state
 */
export function useFavorites({
  isFavoritesPage,
}: UseFavoritesOptions): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();

  // Load favorites from localStorage on mount
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleToggleFavorite = (id: string) => {
    const wasFavorite = favorites.has(id);
    const newFavorites = toggleFavorite(id);
    setFavorites(new Set(newFavorites));

    if (wasFavorite) {
      announce('Removed from favorites');
    } else {
      announce('Added to favorites');
    }
  };

  // Opens the confirmation modal instead of using window.confirm
  const handleClearAllFavorites = () => {
    setIsConfirmModalOpen(true);
  };

  // Called when user confirms clearing all favorites
  const confirmClearAll = () => {
    const count = favorites.size;
    clearAllFavorites();
    setFavorites(new Set());
    setIsConfirmModalOpen(false);
    announce(
      `All favorites cleared. ${count} ${count === 1 ? 'item' : 'items'} removed`
    );
    if (isFavoritesPage) {
      navigate('/');
    }
  };

  // Called when user cancels the confirmation
  const cancelClearAll = () => {
    setIsConfirmModalOpen(false);
  };

  return {
    favorites,
    handleToggleFavorite,
    handleClearAllFavorites,
    isConfirmModalOpen,
    confirmClearAll,
    cancelClearAll,
  };
}

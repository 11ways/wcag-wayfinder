import {
  faTrash,
  faBars,
  faFilterCircleXmark,
  faCircleQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { walkthrough } from '../walkthrough';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AppHeaderProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchInput: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isFavoritesPage: boolean;
  favoritesCount: number;
  onNavigateToFavorites: () => void;
  onClearAllFavorites: () => void;
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
  onSearchEnter?: () => void;
}

/**
 * Compact application header with search and favorites.
 * Single-line layout:
 * - Small logo
 * - Centered search bar
 * - Favorites button
 * - Clear favorites icon
 */
export default function AppHeader({
  searchInputRef,
  searchInput,
  handleSearchChange,
  isFavoritesPage,
  favoritesCount,
  onNavigateToFavorites,
  onClearAllFavorites,
  sidebarVisible,
  onToggleSidebar,
  onSearchEnter,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchEnter) {
      onSearchEnter();
    }
  };

  const handleStartTour = () => {
    walkthrough.start({
      onStepChange: (current, total) => {
        console.log(`Walkthrough: Step ${current} of ${total}`);
      },
      onExit: (completed) => {
        console.log(`Walkthrough ${completed ? 'completed' : 'exited'}`);
      },
    });
  };

  return (
    <header className="header-sticky">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Sidebar toggle button */}
          <button
            onClick={onToggleSidebar}
            className="btn btn-secondary px-3"
            aria-label={sidebarVisible ? t('common:header.hideFilters') : t('common:header.showFilters')}
            aria-expanded={sidebarVisible}
            title={sidebarVisible ? t('common:header.hideFilters') : t('common:header.showFilters')}
            data-easy-mode-hide="sidebar-toggle"
          >
            <FontAwesomeIcon
              icon={sidebarVisible ? faFilterCircleXmark : faBars}
              className="h-4 w-4"
            />
          </button>

          {/* Logo */}
          <h1 className="text-lg font-bold sm:text-xl">
            <Link
              to={`/${lang || 'en'}/`}
              className="text-primary hover:underline whitespace-nowrap"
            >
              {t('common:app.title')}
            </Link>
          </h1>

          {/* Search bar - centered and prominent */}
          <div className="flex-1 max-w-2xl">
            <label htmlFor="search" className="sr-only">
              {t('common:header.searchLabel')}
            </label>
            <input
              ref={searchInputRef}
              type="search"
              id="search"
              className="form-input w-full"
              placeholder={t('common:header.searchPlaceholder')}
              value={searchInput}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              aria-describedby="search-help"
              disabled={isFavoritesPage}
            />
            <p id="search-help" className="sr-only">
              {t('common:header.searchHelp')}
            </p>
          </div>

          {/* Actions section - compact */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Tour button */}
            <button
              onClick={handleStartTour}
              className="btn btn-secondary px-3"
              aria-label={t('common:header.startTour')}
              title={t('common:header.startTour')}
            >
              <FontAwesomeIcon icon={faCircleQuestion} className="h-4 w-4" />
            </button>

            {/* Favorites button */}
            <button
              onClick={onNavigateToFavorites}
              className="btn btn-primary whitespace-nowrap"
            >
              {t('common:header.favorites', { count: favoritesCount })}
            </button>
            {favoritesCount > 0 && (
              <button
                onClick={onClearAllFavorites}
                className="btn btn-danger px-3"
                aria-label={t('common:header.clearFavorites')}
                title={t('common:header.clearFavorites')}
              >
                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

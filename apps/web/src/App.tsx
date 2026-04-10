import { useState, useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, Link } from 'react-router-dom';

import AppHeader from './components/AppHeader';
import ConfirmationModal from './components/ConfirmationModal';
import Filters from './components/Filters';
import LiveRegion from './components/LiveRegion';
import LoadingIndicator from './components/LoadingIndicator';
import Pagination from './components/Pagination';
import ResultList from './components/ResultList';
import SelectedTagsPane from './components/SelectedTagsPane';
import ThemeSelector from './components/ThemeSelector';
import TranslationCreditsModal from './components/TranslationCreditsModal';
import ViewToggle, { type ViewMode } from './components/ViewToggle';
import { useDelayedLoading } from './hooks/useDelayedLoading';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useFavorites } from './hooks/useFavorites';
import { useHashNavigation } from './hooks/useHashNavigation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useResults } from './hooks/useResults';
import { useSearch } from './hooks/useSearch';
import { useTagSelection } from './hooks/useTagSelection';
import { useTerms } from './hooks/useTerms';
import { useURLSync } from './hooks/useURLSync';
import {
  saveViewMode,
  loadViewMode,
  saveSidebarVisible,
  loadSidebarVisible,
} from './lib/filterState';
import {
  getSelectedTags,
  getSelectedAffectedUsers,
  getSelectedAssignees,
  getSelectedTechnologies,
} from './lib/tagUtils';
import { applyEasyMode, getEasyModeEnabled } from './lib/accessibilitySettings';

import { announce } from './utils/announce';

import type { QueryFilters } from './lib/types';

// Import walkthrough styles
import './walkthrough/styles.css';

export default function App() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<QueryFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>(() => loadViewMode());
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(() =>
    loadSidebarVisible()
  );
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const isFavoritesPage = location.pathname === '/favorites';

  // Refs for keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLElement>(null);

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  // Save sidebar visibility to localStorage whenever it changes
  useEffect(() => {
    saveSidebarVisible(sidebarVisible);
  }, [sidebarVisible]);

  // Apply Easy Mode on mount
  useEffect(() => {
    const easyModeEnabled = getEasyModeEnabled();
    applyEasyMode(easyModeEnabled);
  }, []); // Run once on mount

  // Search hook
  const { searchInput, setSearchInput, handleSearchChange } = useSearch({
    setFilters,
  });

  // Favorites hook
  const {
    favorites,
    handleToggleFavorite,
    handleClearAllFavorites,
    isConfirmModalOpen,
    confirmClearAll,
    cancelClearAll,
  } = useFavorites({ isFavoritesPage });

  // Tag selection hook (handles all 4 metadata types)
  const {
    hideCollapsed,
    handleTagToggle,
    handleRemoveTag,
    handleAffectedUserToggle,
    handleRemoveAffectedUser,
    handleAssigneeToggle,
    handleRemoveAssignee,
    handleTechnologyToggle,
    handleRemoveTechnology,
    handleClearAllTags,
    handleToggleCollapse,
  } = useTagSelection({ filters, setFilters });

  // Results hook - must come before hooks that depend on results/isLoading
  const {
    results,
    isLoading,
    error,
    statusMessage,
    totalCriteriaCount,
    matchingCriteriaCount,
    suggestions,
  } = useResults({ filters, isFavoritesPage });

  // Terms hook - fetch all terms for linking
  const { terms } = useTerms();

  // Custom hooks for UI behavior that depend on results/isLoading
  const showLoadingIndicator = useDelayedLoading(isLoading, 500);
  useKeyboardShortcuts({ searchInputRef, filtersRef });
  useHashNavigation(results);
  useDocumentTitle(filters, isFavoritesPage);

  // URL synchronization hook
  useURLSync({ filters, setFilters, setSearchInput });

  // Filter results to show only favorites on favorites page
  let displayResults = isFavoritesPage
    ? {
        ...results,
        items: results.items.filter((c) => favorites.has(c.id)),
        total: favorites.size,
      }
    : results;

  // If hideCollapsed is true and any metadata is selected, filter out non-matching criteria (OR logic)
  const hasAnyMetadataSelected =
    (filters.tag_ids && filters.tag_ids.length > 0) ||
    (filters.affected_user_ids && filters.affected_user_ids.length > 0) ||
    (filters.assignee_ids && filters.assignee_ids.length > 0) ||
    (filters.technology_ids && filters.technology_ids.length > 0);

  if (hideCollapsed && hasAnyMetadataSelected) {
    const filteredItems = displayResults.items.filter((criterion) => {
      const matchesTags =
        filters.tag_ids?.length &&
        criterion.tags?.some((tag) => filters.tag_ids!.includes(tag.id));
      const matchesAffected =
        filters.affected_user_ids?.length &&
        criterion.affected_users?.some((u) => filters.affected_user_ids!.includes(u.id));
      const matchesAssignees =
        filters.assignee_ids?.length &&
        criterion.assignees?.some((a) => filters.assignee_ids!.includes(a.id));
      const matchesTech =
        filters.technology_ids?.length &&
        criterion.technologies?.some((t) => filters.technology_ids!.includes(t.id));
      return matchesTags || matchesAffected || matchesAssignees || matchesTech;
    });
    displayResults = {
      ...displayResults,
      items: filteredItems,
      total: matchingCriteriaCount,
      totalPages: Math.ceil(matchingCriteriaCount / displayResults.pageSize),
    };
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    // Announce page change
    setTimeout(() => {
      const totalPages = results.totalPages;
      announce(`Page ${page} of ${totalPages} loaded`);
    }, 500); // Wait for results to load
    // Scroll to top of results
    const main = document.querySelector('main');
    if (main) {
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setFilters({});
    setSearchInput('');
  };

  const handleToggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
    announce(sidebarVisible ? 'Filters hidden' : 'Filters shown');
  };

  const hasActiveFilters = Boolean(
    filters.q ||
      filters.principle?.length ||
      filters.level?.length ||
      filters.version?.length ||
      filters.guideline_id
  );

  const handleSearchEnter = () => {
    // Focus the first result heading (H2) in the main content area
    const firstHeading = document.querySelector(
      '#main-content h2[tabindex="-1"]'
    ) as HTMLElement;
    if (firstHeading) {
      firstHeading.focus();
      announce('Jumped to first result');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* BETA ribbon */}
      <div className="beta-ribbon" aria-hidden="true">
        Beta
      </div>

      {/* Live region for screen reader announcements */}
      <LiveRegion />

      {/* Skip links */}
      <div className="skip-links">
        <a href="#search" className="skip-link">
          Skip to search
        </a>
        <a href="#filters" className="skip-link">
          Skip to filters
        </a>
        <a href="#main-content" className="skip-link">
          Skip to results
        </a>
      </div>

      {/* Loading indicator */}
      <LoadingIndicator show={showLoadingIndicator} />

      {/* Confirmation modal for clearing favorites */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={cancelClearAll}
        onConfirm={confirmClearAll}
        title="Clear All Favorites"
        message="Are you sure you want to remove all favorites? This action cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        variant="danger"
      />

      {/* Header */}
      <div className="walkthrough-1">
        <AppHeader
          searchInputRef={searchInputRef}
          searchInput={searchInput}
          handleSearchChange={handleSearchChange}
          isFavoritesPage={isFavoritesPage}
          favoritesCount={favorites.size}
          onNavigateToFavorites={() => navigate('/favorites')}
          onClearAllFavorites={handleClearAllFavorites}
          sidebarVisible={sidebarVisible}
          onToggleSidebar={handleToggleSidebar}
          onSearchEnter={handleSearchEnter}
        />
      </div>

      {/* Main content */}
      <div className="bg-secondary flex-1 pt-32 pb-32">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters sidebar */}
            {sidebarVisible && (
              <nav
                ref={filtersRef}
                id="filters"
                aria-label="Filters"
                tabIndex={-1}
                className={`walkthrough-2 sidebar-slide-in lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:self-start lg:overflow-y-auto ${
                  isFavoritesPage ? 'pointer-events-none opacity-50' : ''
                }`}
                aria-disabled={isFavoritesPage}
                data-easy-mode-hide="filters"
              >
                <Filters
                  filters={filters}
                  onFiltersChange={setFilters}
                  statusMessage={statusMessage}
                  hasActiveFilters={hasActiveFilters}
                  onReset={handleReset}
                  isFavoritesPage={isFavoritesPage}
                  favoritesCount={favorites.size}
                  onNavigateHome={() => navigate('/')}
                  onSearchEnter={handleSearchEnter}
                />
              </nav>
            )}

            {/* Results */}
            <main id="main-content" className="min-w-0 flex-1">
              {/* View toggle and top pagination */}
              {!isLoading && !error && displayResults.items.length > 0 && (
                <div className="walkthrough-3 mb-4 flex items-center justify-between">
                  <ViewToggle
                    currentView={viewMode}
                    onViewChange={setViewMode}
                  />
                  {!isFavoritesPage && displayResults.totalPages > 1 && (
                    <Pagination
                      currentPage={displayResults.page}
                      totalPages={displayResults.totalPages}
                      onPageChange={handlePageChange}
                      ariaLabel="Pagination (top)"
                    />
                  )}
                </div>
              )}

              {/* Selected tags pane (all 4 metadata types) */}
              <div className="walkthrough-4">
                <SelectedTagsPane
                  selectedTags={getSelectedTags(
                    filters.tag_ids || [],
                    displayResults.items
                  )}
                  onRemoveTag={handleRemoveTag}
                  selectedAffectedUsers={getSelectedAffectedUsers(
                    filters.affected_user_ids || [],
                    displayResults.items
                  )}
                  onRemoveAffectedUser={handleRemoveAffectedUser}
                  selectedAssignees={getSelectedAssignees(
                    filters.assignee_ids || [],
                    displayResults.items
                  )}
                  onRemoveAssignee={handleRemoveAssignee}
                  selectedTechnologies={getSelectedTechnologies(
                    filters.technology_ids || [],
                    displayResults.items
                  )}
                  onRemoveTechnology={handleRemoveTechnology}
                  onClearAll={handleClearAllTags}
                  totalResults={totalCriteriaCount}
                  matchingResults={matchingCriteriaCount}
                  hideCollapsed={hideCollapsed}
                  onToggleCollapse={handleToggleCollapse}
                />
              </div>

              <ResultList
                criteria={displayResults.items}
                total={displayResults.total}
                isLoading={isLoading}
                error={error}
                viewMode={viewMode}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                isFavoritesPage={isFavoritesPage}
                selectedTags={filters.tag_ids || []}
                onTagToggle={handleTagToggle}
                selectedAffectedUsers={filters.affected_user_ids || []}
                onAffectedUserToggle={handleAffectedUserToggle}
                selectedAssignees={filters.assignee_ids || []}
                onAssigneeToggle={handleAssigneeToggle}
                selectedTechnologies={filters.technology_ids || []}
                onTechnologyToggle={handleTechnologyToggle}
                versionFilters={filters.version}
                levelFilters={filters.level}
                principleFilters={filters.principle}
                terms={terms}
                suggestions={suggestions}
                searchQuery={filters.q}
                onSuggestionClick={(suggestion) => {
                  setSearchInput(suggestion);
                  setFilters((prev) => ({ ...prev, q: suggestion, page: 1 }));
                }}
              />

              {/* Bottom pagination */}
              {!isLoading &&
                !error &&
                displayResults.items.length > 0 &&
                !isFavoritesPage && (
                  <Pagination
                    currentPage={displayResults.page}
                    totalPages={displayResults.totalPages}
                    onPageChange={handlePageChange}
                    ariaLabel="Pagination (bottom)"
                  />
                )}
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer-sticky">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-secondary text-sm">
              {t('footer.copyright', { year: new Date().getFullYear() })}
              {' · '}
              {t('footer.madeWith')}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsCreditsModalOpen(true)}
                className="text-accent min-h-[44px] text-sm font-medium hover:underline"
              >
                {t('footer.translationCredits')}
              </button>
              <Link
                to="/settings"
                className="text-accent text-sm font-medium hover:underline"
              >
                Accessibility Settings
              </Link>
              <ThemeSelector />
            </div>
          </div>
        </div>
      </footer>

      {/* Translation Credits Modal */}
      <TranslationCreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
      />
    </div>
  );
}

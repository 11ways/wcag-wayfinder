import { useEffect, useState } from 'react';

import { marked } from 'marked';
import { useTranslation } from 'react-i18next';

import CriterionCard from './CriterionCard';
import CriterionGrid from './CriterionGrid';
import CriterionList from './CriterionList';
import { sanitizeProseHtml } from '../lib/sanitize';

import type { ViewMode } from './ViewToggle';
import type { Criterion, Term } from '../lib/types';
import type { FuzzySuggestion } from '../lib/fuzzySearch';

interface ResultListProps {
  criteria: Criterion[];
  total: number;
  isLoading: boolean;
  error: string | null;
  viewMode: ViewMode;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  isFavoritesPage?: boolean;
  // Tags selection
  selectedTags: number[];
  onTagToggle: (tagId: number) => void;
  // Affected Users selection
  selectedAffectedUsers: number[];
  onAffectedUserToggle: (id: number) => void;
  // Assignees selection
  selectedAssignees: number[];
  onAssigneeToggle: (id: number) => void;
  // Technologies selection
  selectedTechnologies: number[];
  onTechnologyToggle: (id: number) => void;
  versionFilters?: string[];
  levelFilters?: string[];
  principleFilters?: string[];
  terms?: Term[];
  suggestions?: FuzzySuggestion[];
  searchQuery?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export default function ResultList({
  criteria,
  total: _total,
  isLoading: _isLoading,
  error,
  viewMode,
  favorites,
  onToggleFavorite,
  isFavoritesPage = false,
  selectedTags,
  onTagToggle,
  selectedAffectedUsers,
  onAffectedUserToggle,
  selectedAssignees,
  onAssigneeToggle,
  selectedTechnologies,
  onTechnologyToggle,
  versionFilters = [],
  levelFilters = [],
  principleFilters = [],
  terms = [],
  suggestions = [],
  searchQuery,
  onSuggestionClick,
}: ResultListProps) {
  const { t, i18n } = useTranslation('results');
  const [warningContent, setWarningContent] = useState<string>('');
  const [emptyVersionsContent, setEmptyVersionsContent] = useState<string>('');
  const [emptyLevelsContent, setEmptyLevelsContent] = useState<string>('');
  const [emptyPrinciplesContent, setEmptyPrinciplesContent] = useState<string>('');
  const [noResultsTipsContent, setNoResultsTipsContent] = useState<string>('');

  // Helper to load localized content with fallback
  const loadLocalizedContent = async (path: string, fallbackLang = 'en'): Promise<string | null> => {
    const lang = i18n.language;
    let response = await fetch(`/content/${lang}/${path}`);
    if (!response.ok && lang !== fallbackLang) {
      response = await fetch(`/content/${fallbackLang}/${path}`);
    }
    if (!response.ok) return null;
    return response.text();
  };

  // Check if only WCAG 2.2 is selected
  const showWcag22Warning =
    versionFilters.length === 1 && versionFilters[0] === '2.2';

  // Check for empty filter warnings (must be declared before useEffect hooks use them)
  const hasEmptyVersions = versionFilters.length === 0;
  const hasEmptyLevels = levelFilters.length === 0;
  const hasEmptyPrinciples = principleFilters.length === 0;
  const hasEmptyFilters = hasEmptyVersions || hasEmptyLevels || hasEmptyPrinciples;

  // Load warning content when needed (with sanitization)
  useEffect(() => {
    if (showWcag22Warning && !warningContent) {
      loadLocalizedContent('warnings/wcag-22-only.md')
        .then((markdown) => markdown ? marked(markdown) : '')
        .then((html) => sanitizeProseHtml(html))
        .then((sanitized) => setWarningContent(sanitized))
        .catch((err) => console.error('Failed to load warning:', err));
    }
  }, [showWcag22Warning, warningContent, i18n.language]);

  // Load empty filter warnings (with sanitization)
  useEffect(() => {
    if (hasEmptyVersions && !emptyVersionsContent) {
      loadLocalizedContent('warnings/empty-versions.md')
        .then((markdown) => markdown ? marked(markdown) : '')
        .then((html) => sanitizeProseHtml(html))
        .then((sanitized) => setEmptyVersionsContent(sanitized))
        .catch((err) => console.error('Failed to load empty versions warning:', err));
    }
  }, [hasEmptyVersions, emptyVersionsContent, i18n.language]);

  useEffect(() => {
    if (hasEmptyLevels && !emptyLevelsContent) {
      loadLocalizedContent('warnings/empty-levels.md')
        .then((markdown) => markdown ? marked(markdown) : '')
        .then((html) => sanitizeProseHtml(html))
        .then((sanitized) => setEmptyLevelsContent(sanitized))
        .catch((err) => console.error('Failed to load empty levels warning:', err));
    }
  }, [hasEmptyLevels, emptyLevelsContent, i18n.language]);

  useEffect(() => {
    if (hasEmptyPrinciples && !emptyPrinciplesContent) {
      loadLocalizedContent('warnings/empty-principles.md')
        .then((markdown) => markdown ? marked(markdown) : '')
        .then((html) => sanitizeProseHtml(html))
        .then((sanitized) => setEmptyPrinciplesContent(sanitized))
        .catch((err) => console.error('Failed to load empty principles warning:', err));
    }
  }, [hasEmptyPrinciples, emptyPrinciplesContent, i18n.language]);

  // Load no results tips (with sanitization)
  useEffect(() => {
    if (criteria.length === 0 && !noResultsTipsContent) {
      loadLocalizedContent('help/no-results.md')
        .then((markdown) => markdown ? marked(markdown) : '')
        .then((html) => sanitizeProseHtml(html))
        .then((sanitized) => setNoResultsTipsContent(sanitized))
        .catch((err) => console.error('Failed to load no results tips:', err));
    }
  }, [criteria.length, noResultsTipsContent, i18n.language]);

  // Loading state is now handled by the global loading indicator in App.tsx
  // Don't show a separate loading message here as it flashes too quickly

  if (error) {
    return (
      <div
        className="card border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
        role="alert"
      >
        <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
          {t('error.title')}
        </h2>
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (criteria.length === 0) {
    return (
      <div className="card py-8">
        {/* Main heading with search query */}
        <h2 className="mb-4 text-xl font-semibold">
          {searchQuery
            ? t('empty.searchTitle', { query: searchQuery })
            : t('empty.noResults')}
        </h2>

        {/* Fuzzy suggestions */}
        {suggestions.length > 0 && onSuggestionClick && (
          <div className="mb-6">
            <p className="mb-3 text-gray-700 dark:text-gray-300">
              {t('empty.suggestions')}
            </p>
            <ul className="space-y-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion.criterion.id}>
                  <button
                    onClick={() => onSuggestionClick(suggestion.criterion.title)}
                    className="text-left text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    aria-label={`${suggestion.criterion.num} ${suggestion.criterion.title}`}
                  >
                    <span className="font-medium" aria-hidden="true">
                      {suggestion.criterion.num}
                    </span>
                    <span aria-hidden="true">{` ${suggestion.criterion.title}`}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Help text and tips */}
        {!suggestions.length && (
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {t('empty.adjustFilters')}
          </p>
        )}

        {noResultsTipsContent && (
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: noResultsTipsContent }}
          />
        )}
      </div>
    );
  }

  // Warning banner components
  const EmptyFilterWarnings = () => {
    if (!hasEmptyFilters) return null;

    return (
      <>
        {hasEmptyVersions && emptyVersionsContent && (
          <div
            className="card mb-4 border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
            role="alert"
          >
            <div
              className="prose prose-sm max-w-none text-orange-900 dark:prose-invert dark:text-orange-100"
              dangerouslySetInnerHTML={{ __html: emptyVersionsContent }}
            />
          </div>
        )}

        {hasEmptyLevels && emptyLevelsContent && (
          <div
            className="card mb-4 border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
            role="alert"
          >
            <div
              className="prose prose-sm max-w-none text-orange-900 dark:prose-invert dark:text-orange-100"
              dangerouslySetInnerHTML={{ __html: emptyLevelsContent }}
            />
          </div>
        )}

        {hasEmptyPrinciples && emptyPrinciplesContent && (
          <div
            className="card mb-4 border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
            role="alert"
          >
            <div
              className="prose prose-sm max-w-none text-orange-900 dark:prose-invert dark:text-orange-100"
              dangerouslySetInnerHTML={{ __html: emptyPrinciplesContent }}
            />
          </div>
        )}
      </>
    );
  };

  const WarningBanner = () => {
    if (!showWcag22Warning || !warningContent) return null;

    return (
      <div
        className="card mb-6 border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
        role="alert"
      >
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: warningContent }}
        />
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <>
        <EmptyFilterWarnings />
        <WarningBanner />
        <CriterionList
          criteria={criteria}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          showTrash={isFavoritesPage}
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
          selectedAffectedUsers={selectedAffectedUsers}
          onAffectedUserToggle={onAffectedUserToggle}
          selectedAssignees={selectedAssignees}
          onAssigneeToggle={onAssigneeToggle}
          selectedTechnologies={selectedTechnologies}
          onTechnologyToggle={onTechnologyToggle}
        />
      </>
    );
  }

  if (viewMode === 'grid') {
    return (
      <>
        <EmptyFilterWarnings />
        <WarningBanner />
        <CriterionGrid
          criteria={criteria}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          showTrash={isFavoritesPage}
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
          selectedAffectedUsers={selectedAffectedUsers}
          onAffectedUserToggle={onAffectedUserToggle}
          selectedAssignees={selectedAssignees}
          onAssigneeToggle={onAssigneeToggle}
          selectedTechnologies={selectedTechnologies}
          onTechnologyToggle={onTechnologyToggle}
          terms={terms}
        />
      </>
    );
  }

  // Default card view
  return (
    <>
      <EmptyFilterWarnings />
      <WarningBanner />
      <div className="space-y-4">
        {criteria.map((criterion) => (
          <CriterionCard
            key={criterion.id}
            criterion={criterion}
            isFavorite={favorites.has(criterion.id)}
            onToggleFavorite={() => onToggleFavorite(criterion.id)}
            showTrash={isFavoritesPage}
            selectedTags={selectedTags}
            onTagToggle={onTagToggle}
            selectedAffectedUsers={selectedAffectedUsers}
            onAffectedUserToggle={onAffectedUserToggle}
            selectedAssignees={selectedAssignees}
            onAssigneeToggle={onAssigneeToggle}
            selectedTechnologies={selectedTechnologies}
            onTechnologyToggle={onTechnologyToggle}
            terms={terms}
          />
        ))}
      </div>
    </>
  );
}

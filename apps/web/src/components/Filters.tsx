import { useState } from 'react';

import { marked } from 'marked';
import { useTranslation } from 'react-i18next';

import HelpModal from './HelpModal';
import {
  usePrinciplesQuery,
  useGuidelinesQuery,
  useVersionsQuery,
  useLevelsQuery,
} from '../hooks/queries';
import { getPrincipleColor } from '../lib/principleUtils';

import type { Guideline, QueryFilters, TranslatedPrinciple } from '../lib/types';

interface FiltersProps {
  filters: QueryFilters;
  onFiltersChange: (filters: QueryFilters) => void;
  statusMessage: string;
  hasActiveFilters: boolean;
  onReset: () => void;
  isFavoritesPage: boolean;
  favoritesCount: number;
  onNavigateHome: () => void;
  onSearchEnter?: () => void;
}

export default function Filters({
  filters,
  onFiltersChange,
  statusMessage,
  hasActiveFilters,
  onReset,
  isFavoritesPage,
  favoritesCount,
  onNavigateHome,
  onSearchEnter,
}: FiltersProps) {
  const { t, i18n } = useTranslation('filters');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchEnter) {
      onSearchEnter();
    }
  };

  // Load filter options via TanStack Query (cached, deduplicated)
  const { data: principlesData = [] } = usePrinciplesQuery();
  const { data: guidelines = [] } = useGuidelinesQuery();
  const { data: versions = [] } = useVersionsQuery();
  const { data: levels = [] } = useLevelsQuery();

  // Helper to check if principles data is translated format
  const isTranslatedPrinciples = (data: string[] | TranslatedPrinciple[]): data is TranslatedPrinciple[] => {
    return data.length > 0 && typeof data[0] === 'object' && 'name' in data[0];
  };

  // Normalize principles to a consistent format: { name: string, displayName: string }
  const principles = isTranslatedPrinciples(principlesData)
    ? principlesData.map(p => ({ name: p.name, displayName: p.translated_name }))
    : principlesData.map(p => ({ name: p, displayName: p }));

  // Helper to get translated guideline title
  const getGuidelineDisplayTitle = (g: Guideline): string => {
    return g.translated_title || g.guideline_title;
  };

  // Helper to get translated principle name for guidelines grouping header
  const getPrincipleDisplayName = (englishName: string): string => {
    const found = principles.find(p => p.name === englishName);
    return found?.displayName || englishName;
  };

  const [guidelineSearch, setGuidelineSearch] = useState('');
  const [expandedPrinciples, setExpandedPrinciples] = useState<Set<string>>(
    new Set()
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const handlePrincipleChange = (principle: string, checked: boolean) => {
    // Start with current selection (empty array if undefined)
    const current = filters.principle || [];
    const updated = checked
      ? [...current, principle]
      : current.filter((p) => p !== principle);

    // When checking/unchecking a principle, also check/uncheck all its guidelines
    const principleGuidelines = guidelinesByPrinciple[principle] || [];
    const allGuidelineIds = guidelines.map((g) => g.guideline_id);
    const currentGuidelines = filters.guideline_ids || allGuidelineIds;
    const principleGuidelineIds = principleGuidelines.map((g) => g.guideline_id);

    let updatedGuidelines: string[];
    if (checked) {
      // Add all guidelines for this principle
      updatedGuidelines = [...new Set([...currentGuidelines, ...principleGuidelineIds])];
    } else {
      // Remove all guidelines for this principle
      updatedGuidelines = currentGuidelines.filter((id) => !principleGuidelineIds.includes(id));
    }

    // Keep the array (even if empty) - don't set to undefined
    const finalGuidelines = updatedGuidelines.length === allGuidelineIds.length ? undefined : updatedGuidelines;

    onFiltersChange({
      ...filters,
      principle: updated, // Keep the updated array
      guideline_ids: finalGuidelines,
      guideline_id: undefined, // Clear single guideline filter
      page: 1,
    });
  };

  const handleToggleGuidelines = (principle: string) => {
    const newExpanded = new Set(expandedPrinciples);
    if (newExpanded.has(principle)) {
      newExpanded.delete(principle);
    } else {
      newExpanded.add(principle);
    }
    setExpandedPrinciples(newExpanded);
  };

  const handleGuidelineChange = (guidelineId: string, checked: boolean) => {
    // If guideline_ids is undefined, treat it as "all selected"
    const allGuidelineIds = guidelines.map((g) => g.guideline_id);
    const current = filters.guideline_ids || allGuidelineIds;

    const updated = checked
      ? [...current, guidelineId]
      : current.filter((g) => g !== guidelineId);

    // Find which principle this guideline belongs to
    const guideline = guidelines.find((g) => g.guideline_id === guidelineId);
    if (guideline) {
      const principle = guideline.principle;
      const principleGuidelines = guidelinesByPrinciple[principle] || [];
      const principleGuidelineIds = principleGuidelines.map((g) => g.guideline_id);

      // Count how many guidelines of this principle are checked
      const checkedCount = updated.filter((id) => principleGuidelineIds.includes(id)).length;

      // Auto-check/uncheck the principle based on guidelines
      const currentPrinciples = filters.principle || [];
      let updatedPrinciples: string[];

      if (checkedCount > 0 && !currentPrinciples.includes(principle)) {
        // At least one guideline checked -> check principle
        updatedPrinciples = [...currentPrinciples, principle];
      } else if (checkedCount === 0 && currentPrinciples.includes(principle)) {
        // No guidelines checked -> uncheck principle
        updatedPrinciples = currentPrinciples.filter((p) => p !== principle);
      } else {
        updatedPrinciples = currentPrinciples;
      }

      // If all guidelines are selected, set to undefined (means "all")
      const finalGuidelines = updated.length === allGuidelineIds.length ? undefined : updated;

      onFiltersChange({
        ...filters,
        principle: updatedPrinciples,
        guideline_ids: finalGuidelines,
        guideline_id: undefined, // Clear single guideline filter
        page: 1,
      });
    } else {
      // Fallback if guideline not found
      const finalGuidelines = updated.length === allGuidelineIds.length ? undefined : updated;
      onFiltersChange({
        ...filters,
        guideline_ids: finalGuidelines,
        guideline_id: undefined,
        page: 1,
      });
    }
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    const current = filters.level || [];
    const updated = checked
      ? [...current, level]
      : current.filter((l) => l !== level);

    onFiltersChange({
      ...filters,
      level: updated, // Keep empty array instead of undefined
      page: 1,
    });
  };

  const handleVersionChange = (version: string, checked: boolean) => {
    const current = filters.version || [];
    const updated = checked
      ? [...current, version]
      : current.filter((v) => v !== version);

    onFiltersChange({
      ...filters,
      version: updated, // Keep empty array instead of undefined
      page: 1,
    });
  };

  const loadLocalizedContent = async (path: string, fallbackLang = 'en'): Promise<string | null> => {
    const lang = i18n.language;
    // Try current language first, then fallback to English
    let response = await fetch(`/content/${lang}/${path}`);
    if (!response.ok && lang !== fallbackLang) {
      response = await fetch(`/content/${fallbackLang}/${path}`);
    }
    if (!response.ok) return null;
    return response.text();
  };

  const handleVersionHelp = async () => {
    try {
      const markdown = await loadLocalizedContent('filters/version.md');
      if (!markdown) throw new Error('Failed to fetch content');

      const html = await marked(markdown);

      if (html && html.trim()) {
        setModalTitle(t('version.modalTitle'));
        setModalContent(html);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to load help content:', error);
    }
  };

  const handleLevelFilterHelp = async () => {
    try {
      const markdown = await loadLocalizedContent('filters/level.md');
      if (!markdown) throw new Error('Failed to fetch content');

      const html = await marked(markdown);

      if (html && html.trim()) {
        setModalTitle(t('level.modalTitle'));
        setModalContent(html);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to load help content:', error);
    }
  };

  const handlePrincipleHelp = async () => {
    try {
      const markdown = await loadLocalizedContent('filters/principle.md');
      if (!markdown) throw new Error('Failed to fetch content');

      const html = await marked(markdown);

      if (html && html.trim()) {
        setModalTitle(t('principle.modalTitle'));
        setModalContent(html);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to load help content:', error);
    }
  };

  const handleReset = () => {
    setGuidelineSearch('');
    setExpandedPrinciples(new Set());

    // Set all principles and all guidelines as checked
    const allPrincipleNames = principles.map(p => p.name);
    const allGuidelines = guidelines.map((g) => g.guideline_id);

    onFiltersChange({
      version: ['2.2'],
      level: ['A', 'AA'],
      principle: allPrincipleNames.length > 0 ? allPrincipleNames : undefined,
      guideline_ids: allGuidelines.length > 0 ? allGuidelines : undefined,
      guideline_id: undefined,
    });
  };

  const filteredGuidelines = guidelines.filter(
    (g) =>
      guidelineSearch === '' ||
      g.guideline_title.toLowerCase().includes(guidelineSearch.toLowerCase()) ||
      (g.translated_title && g.translated_title.toLowerCase().includes(guidelineSearch.toLowerCase())) ||
      g.guideline_id.includes(guidelineSearch)
  );

  // Group guidelines by principle
  const guidelinesByPrinciple = filteredGuidelines.reduce(
    (acc, g) => {
      if (!acc[g.principle]) acc[g.principle] = [];
      acc[g.principle].push(g);
      return acc;
    },
    {} as Record<string, Guideline[]>
  );

  return (
    <aside className="w-full flex-shrink-0 space-y-6 lg:w-64">
      {/* Results count and status */}
      <div className="space-y-2">
        <p
          className="text-secondary text-sm"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isFavoritesPage
            ? t('showingFavorites', { count: favoritesCount })
            : statusMessage}
        </p>
        {hasActiveFilters && !isFavoritesPage && (
          <button
            onClick={onReset}
            className="text-accent min-h-[44px] min-w-[44px] text-sm"
            aria-label={t('clearAllLabel')}
          >
            {t('clearAll')}
          </button>
        )}
        {isFavoritesPage && (
          <button
            onClick={onNavigateHome}
            className="text-accent min-h-[44px] min-w-[44px] text-sm"
          >
            {t('backToAll')}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <button
          onClick={handleReset}
          className="text-accent min-h-[44px] min-w-[44px] px-2 text-sm"
          aria-label={t('resetLabel')}
        >
          {t('reset')}
        </button>
      </div>

      {/* Version */}
      <fieldset className="space-y-2">
        <div className="flex items-center justify-between">
          <legend className="form-label">{t('version.label')}</legend>
          <button
            onClick={handleVersionHelp}
            className="text-accent flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
            aria-label={t('version.help')}
            title={t('version.help')}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
        <div className="flex gap-4">
          {versions.map((version) => (
            <label
              key={version}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                className="form-checkbox"
                checked={filters.version?.includes(version) || false}
                onChange={(e) => handleVersionChange(version, e.target.checked)}
              />
              <span className="text-sm">{`WCAG ${version}`}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Level */}
      <fieldset className="space-y-2">
        <div className="flex items-center justify-between">
          <legend className="form-label">{t('level.label')}</legend>
          <button
            onClick={handleLevelFilterHelp}
            className="text-accent flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
            aria-label={t('level.help')}
            title={t('level.help')}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
        <div className="flex gap-4">
          {levels.map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                className="form-checkbox"
                checked={filters.level?.includes(level) || false}
                onChange={(e) => handleLevelChange(level, e.target.checked)}
              />
              <span className="text-sm">{level}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Principles with nested Guidelines */}
      <fieldset className="space-y-2">
        <div className="flex items-center justify-between">
          <legend className="form-label">{t('principle.label')}</legend>
          <button
            onClick={handlePrincipleHelp}
            className="text-accent flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
            aria-label={t('principle.help')}
            title={t('principle.help')}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
        <ul className="space-y-2">
          {principles.map((principle) => {
            const principleName = principle.name;
            const principleDisplayName = principle.displayName;
            const isExpanded = expandedPrinciples.has(principleName);
            const principleGuidelines = guidelinesByPrinciple[principleName] || [];

            // Calculate checked guidelines for this principle
            const principleGuidelineIds = principleGuidelines.map((g) => g.guideline_id);

            // If guideline_ids is undefined, treat all as checked
            const allGuidelineIds = guidelines.map((g) => g.guideline_id);
            const effectiveGuidelineIds = filters.guideline_ids || allGuidelineIds;
            const checkedGuidelinesCount = effectiveGuidelineIds.filter((id) =>
              principleGuidelineIds.includes(id)
            ).length;
            const totalGuidelinesCount = principleGuidelines.length;

            // Check if principle is in the current selection
            const isPrincipleChecked = filters.principle?.includes(principleName) || false;

            return (
              <li key={principleName}>
                <div className="flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={isPrincipleChecked}
                      onChange={(e) =>
                        handlePrincipleChange(principleName, e.target.checked)
                      }
                      style={{ accentColor: getPrincipleColor(principleName) }}
                    />
                    <span className="text-sm font-medium">
                      <span className="sr-only">
                        {totalGuidelinesCount > 0
                          ? t('principle.selectedCount', { principle: principleDisplayName, checked: checkedGuidelinesCount, total: totalGuidelinesCount })
                          : principleDisplayName}
                      </span>
                      <span aria-hidden="true">
                        {totalGuidelinesCount > 0
                          ? `${principleDisplayName} (${t('guideline.count', { checked: checkedGuidelinesCount, total: totalGuidelinesCount })})`
                          : principleDisplayName}
                      </span>
                    </span>
                  </label>
                  <button
                    onClick={() => handleToggleGuidelines(principleName)}
                    className="text-accent min-h-[44px] min-w-[44px] px-2 text-xs"
                    aria-expanded={isExpanded}
                    aria-controls={`guidelines-${principleName.toLowerCase()}`}
                    aria-label={t('principle.customizeLabel', { principle: principleDisplayName })}
                  >
                    {t('customize')}
                  </button>
                </div>

                {isExpanded && (
                  <ul
                    id={`guidelines-${principleName.toLowerCase()}`}
                    className="ml-6 mt-2 space-y-1 border-l-2 border-gray-200 pl-3 dark:border-gray-700"
                    role="group"
                    aria-label={t('principle.guidelinesLabel', { principle: principleDisplayName })}
                  >
                    {principleGuidelines.map((g) => {
                      // If guideline_ids is undefined, treat all as checked
                      const isGuidelineChecked = effectiveGuidelineIds.includes(g.guideline_id);

                      return (
                        <li key={g.guideline_id}>
                          <label className="flex cursor-pointer items-start gap-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={isGuidelineChecked}
                              onChange={(e) =>
                                handleGuidelineChange(g.guideline_id, e.target.checked)
                              }
                            />
                            <span className="text-sm">
                              {`${g.guideline_id} — ${getGuidelineDisplayTitle(g)}`}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/* Guideline Search */}
      <div className="space-y-2">
        <label htmlFor="guideline-search" className="form-label">
          {t('guideline.search')}
        </label>
        <input
          type="search"
          id="guideline-search"
          className="form-input text-sm"
          placeholder={t('guideline.searchPlaceholder')}
          value={guidelineSearch}
          onChange={(e) => setGuidelineSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {guidelineSearch && (
          <>
            <div
              className="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {Object.keys(guidelinesByPrinciple).length === 0
                ? t('guideline.notFound')
                : t('guideline.found', { count: filteredGuidelines.length })}
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto rounded border border-gray-200 p-2 dark:border-gray-700">
              {Object.keys(guidelinesByPrinciple).length === 0 && (
                <p className="p-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('guideline.notFound')}
                </p>
              )}
              {Object.entries(guidelinesByPrinciple).map(
                ([principle, guidelineList]) => (
                  <div key={principle}>
                    <p className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {getPrincipleDisplayName(principle)}
                    </p>
                    {guidelineList.map((g) => (
                      <label
                        key={g.guideline_id}
                        className="flex cursor-pointer items-start gap-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 min-h-[20px] min-w-[20px]"
                          checked={filters.guideline_ids?.includes(g.guideline_id) || filters.guideline_id === g.guideline_id}
                          onChange={(e) =>
                            handleGuidelineChange(g.guideline_id, e.target.checked)
                          }
                        />
                        <span className="text-sm">
                          {`${g.guideline_id} — ${getGuidelineDisplayTitle(g)}`}
                        </span>
                      </label>
                    ))}
                  </div>
                )
              )}
            </div>
          </>
        )}

        {((filters.guideline_ids && filters.guideline_ids.length > 0) || filters.guideline_id) && !guidelineSearch && (
          <button
            onClick={() =>
              onFiltersChange({ ...filters, guideline_id: undefined, guideline_ids: undefined, page: 1 })
            }
            className="text-accent min-h-[44px] min-w-[44px] py-2 text-sm"
            aria-label={t('guideline.clear')}
          >
            {t('guideline.clear')}
          </button>
        )}
      </div>

      <HelpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        content={modalContent}
      />
    </aside>
  );
}

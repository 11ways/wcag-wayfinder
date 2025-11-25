import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { QueryFilters } from '../lib/types';

/**
 * Updates the document title based on active filters.
 * Builds a title from search query, level, principle, guideline, and version filters.
 * Uses i18n translations for localized page titles.
 *
 * @param filters - The current query filters
 * @param isFavoritesPage - Whether viewing favorites page
 * @param criterionTitle - Optional criterion title for single-criterion view
 */
export function useDocumentTitle(
  filters: QueryFilters,
  isFavoritesPage = false,
  criterionTitle?: { num: string; title: string }
): void {
  const { t } = useTranslation();

  useEffect(() => {
    const parts: string[] = [t('app.title')];

    // Single criterion view
    if (criterionTitle) {
      parts.push(t('pageTitles.criterion', criterionTitle));
      document.title = parts.join(' | ');
      return;
    }

    // Favorites page
    if (isFavoritesPage) {
      parts.push(t('pageTitles.favorites'));
      document.title = parts.join(' | ');
      return;
    }

    // Home/search page with filters
    if (filters.q) {
      parts.push(`${t('header.searchLabel')}: "${filters.q}"`);
    }

    if (filters.level && filters.level.length > 0 && filters.level.length < 3) {
      parts.push(`${t('results.criterion.level')} ${filters.level.join(', ')}`);
    }

    if (
      filters.principle &&
      filters.principle.length > 0 &&
      filters.principle.length < 4
    ) {
      parts.push(filters.principle.join(', '));
    }

    if (filters.guideline_id) {
      parts.push(`${t('results.criterion.guideline')} ${filters.guideline_id}`);
    }

    if (
      filters.version &&
      filters.version.length > 0 &&
      filters.version[0] !== '2.2'
    ) {
      parts.push(`WCAG ${filters.version.join(', ')}`);
    }

    document.title = parts.join(' | ');
  }, [filters, isFavoritesPage, criterionTitle, t]);
}

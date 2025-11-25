import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ShareButton from './ShareButton';
import StarButton from './StarButton';
import { TranslationFallbackIcon } from './TranslationFallbackBadge';
import { getIconForEmoji } from '../lib/iconMapper';
import { generateCriterionId } from '../lib/textUtils';

import type { Criterion } from '../lib/types';

interface CriterionListProps {
  criteria: Criterion[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  showTrash?: boolean;
  selectedTags: number[];
  onTagToggle: (tagId: number) => void;
}

/**
 * Table view for displaying criteria
 * Wrapped in React.memo to prevent unnecessary re-renders
 */
function CriterionList({
  criteria,
  favorites,
  onToggleFavorite,
  showTrash = false,
  selectedTags,
  onTagToggle,
}: CriterionListProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Helper function to check if criterion has any selected tags
  const hasSelectedTag = (criterion: Criterion): boolean => {
    if (selectedTags.length === 0) return true;
    if (!criterion.tags || criterion.tags.length === 0) return false;
    return criterion.tags.some((tag) => selectedTags.includes(tag.id));
  };

  // Helper function to get display title (translated or fallback)
  const getDisplayTitle = (criterion: Criterion): string => {
    return criterion.translated_title || criterion.title;
  };

  // Helper function to check if criterion has translation
  const getHasTranslation = (criterion: Criterion): boolean => {
    return criterion.has_translation ?? true;
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="w-12 px-2 py-3">
              <span className="sr-only">Share</span>
            </th>
            <th scope="col" className="w-12 px-2 py-3">
              <span className="sr-only">Favorite</span>
            </th>
            <th
              scope="col"
              className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Number
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Title
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Tags
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {criteria.map((criterion) => {
            const hasMatch = hasSelectedTag(criterion);
            const rowClasses = hasMatch
              ? 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-500'
              : 'opacity-50 blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-500';

            return (
              <tr
                key={criterion.id}
                className={rowClasses}
                id={generateCriterionId(criterion.num)}
                {...(!hasMatch && { inert: '' as any })}
              >
                <td className="whitespace-nowrap px-2 py-3">
                  <ShareButton
                    criterionNum={criterion.num}
                    criterionTitle={criterion.title}
                  />
                </td>
                <td className="whitespace-nowrap px-2 py-3">
                  <StarButton
                    isFavorite={favorites.has(criterion.id)}
                    onToggle={() => onToggleFavorite(criterion.id)}
                    criterionNum={criterion.num}
                    showTrash={showTrash}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {criterion.num}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    <span>{getDisplayTitle(criterion)}</span>
                    <TranslationFallbackIcon
                      hasTranslation={getHasTranslation(criterion)}
                      currentLanguage={currentLanguage}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {criterion.tags && criterion.tags.length > 0 ? (
                      criterion.tags.map((tag) => {
                        const icon = getIconForEmoji(tag.icon);
                        const isSelected = selectedTags.includes(tag.id);
                        const isAtMax = !isSelected && selectedTags.length >= 3;

                        return (
                          <button
                            key={tag.id}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isAtMax) {
                                onTagToggle(tag.id);
                              }
                            }}
                            disabled={isAtMax}
                            className={`inline-flex items-center rounded border-2 px-2 py-0.5 text-xs font-medium transition-colors ${
                              isSelected
                                ? 'border-yellow-500 bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100'
                                : isAtMax
                                  ? 'cursor-not-allowed border-transparent bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                  : 'cursor-pointer border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title={
                              isAtMax
                                ? 'Maximum 3 tags selected'
                                : tag.description || tag.name
                            }
                            aria-pressed={isSelected}
                          >
                            {icon && (
                              <FontAwesomeIcon
                                icon={icon}
                                className="mr-1"
                                aria-hidden="true"
                              />
                            )}
                            {tag.name}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        No tags
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default memo(CriterionList);

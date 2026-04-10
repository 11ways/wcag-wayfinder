import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ShareButton from './ShareButton';
import StarButton from './StarButton';
import { TranslationFallbackIcon } from './TranslationFallbackBadge';
import { getIconForEmoji } from '../lib/iconMapper';
import { generateCriterionId } from '../lib/textUtils';
import { getMetadataButtonClasses } from '../lib/metadataColors';
import { MAX_SELECTED_TAGS } from '../lib/constants';

import type { Criterion } from '../lib/types';

interface CriterionListProps {
  criteria: Criterion[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  showTrash?: boolean;
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
  selectedAffectedUsers,
  onAffectedUserToggle,
  selectedAssignees,
  onAssigneeToggle,
  selectedTechnologies,
  onTechnologyToggle,
}: CriterionListProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Check if any filters are active
  const hasAnyFilter =
    selectedTags.length > 0 ||
    selectedAffectedUsers.length > 0 ||
    selectedAssignees.length > 0 ||
    selectedTechnologies.length > 0;

  // Helper function to check if criterion matches any selected metadata (OR logic)
  const hasSelectedTag = (criterion: Criterion): boolean => {
    if (!hasAnyFilter) return true;

    const matchesTags =
      selectedTags.length > 0 &&
      criterion.tags?.some((tag) => selectedTags.includes(tag.id));
    const matchesAffectedUsers =
      selectedAffectedUsers.length > 0 &&
      criterion.affected_users?.some((user) => selectedAffectedUsers.includes(user.id));
    const matchesAssignees =
      selectedAssignees.length > 0 &&
      criterion.assignees?.some((assignee) => selectedAssignees.includes(assignee.id));
    const matchesTechnologies =
      selectedTechnologies.length > 0 &&
      criterion.technologies?.some((tech) => selectedTechnologies.includes(tech.id));

    return !!(matchesTags || matchesAffectedUsers || matchesAssignees || matchesTechnologies);
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
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Affects
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Responsibility
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Technologies
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
                {/* Tags */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {criterion.tags && criterion.tags.length > 0 ? (
                      criterion.tags.map((tag) => {
                        const icon = getIconForEmoji(tag.icon);
                        const isSelected = selectedTags.includes(tag.id);
                        const isAtMax = !isSelected && selectedTags.length >= MAX_SELECTED_TAGS;

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
                              getMetadataButtonClasses('tags', isSelected, isAtMax)
                            } ${!isAtMax && !isSelected ? 'cursor-pointer' : ''}`}
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
                        —
                      </span>
                    )}
                  </div>
                </td>
                {/* Affects */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {criterion.affected_users && criterion.affected_users.length > 0 ? (
                      criterion.affected_users.map((user) => {
                        const icon = getIconForEmoji(user.icon);
                        const isSelected = selectedAffectedUsers.includes(user.id);
                        const isAtMax = !isSelected && selectedAffectedUsers.length >= MAX_SELECTED_TAGS;

                        return (
                          <button
                            key={user.id}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isAtMax) {
                                onAffectedUserToggle(user.id);
                              }
                            }}
                            disabled={isAtMax}
                            className={`inline-flex items-center rounded border-2 px-2 py-0.5 text-xs font-medium transition-colors ${
                              getMetadataButtonClasses('affects', isSelected, isAtMax)
                            } ${!isAtMax && !isSelected ? 'cursor-pointer' : ''}`}
                            title={
                              isAtMax
                                ? 'Maximum 3 affects filters selected'
                                : user.description || user.name
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
                            {user.name}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        —
                      </span>
                    )}
                  </div>
                </td>
                {/* Responsibility */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {criterion.assignees && criterion.assignees.length > 0 ? (
                      criterion.assignees.map((assignee) => {
                        const icon = getIconForEmoji(assignee.icon);
                        const isSelected = selectedAssignees.includes(assignee.id);
                        const isAtMax = !isSelected && selectedAssignees.length >= MAX_SELECTED_TAGS;

                        return (
                          <button
                            key={assignee.id}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isAtMax) {
                                onAssigneeToggle(assignee.id);
                              }
                            }}
                            disabled={isAtMax}
                            className={`inline-flex items-center rounded border-2 px-2 py-0.5 text-xs font-medium transition-colors ${
                              getMetadataButtonClasses('responsibility', isSelected, isAtMax)
                            } ${!isAtMax && !isSelected ? 'cursor-pointer' : ''}`}
                            title={
                              isAtMax
                                ? 'Maximum 3 responsibility filters selected'
                                : assignee.description || assignee.name
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
                            {assignee.name}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        —
                      </span>
                    )}
                  </div>
                </td>
                {/* Technologies */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {criterion.technologies && criterion.technologies.length > 0 ? (
                      criterion.technologies.map((tech) => {
                        const icon = getIconForEmoji(tech.icon);
                        const isSelected = selectedTechnologies.includes(tech.id);
                        const isAtMax = !isSelected && selectedTechnologies.length >= MAX_SELECTED_TAGS;

                        return (
                          <button
                            key={tech.id}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isAtMax) {
                                onTechnologyToggle(tech.id);
                              }
                            }}
                            disabled={isAtMax}
                            className={`inline-flex items-center rounded border-2 px-2 py-0.5 text-xs font-medium transition-colors ${
                              getMetadataButtonClasses('technology', isSelected, isAtMax)
                            } ${!isAtMax && !isSelected ? 'cursor-pointer' : ''}`}
                            title={
                              isAtMax
                                ? 'Maximum 3 technology filters selected'
                                : tech.description || tech.name
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
                            {tech.name}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        —
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

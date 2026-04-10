import { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CriterionDetails from './CriterionDetails';
import Modal from './Modal';
import ShareButton from './ShareButton';
import StarButton from './StarButton';
import { TranslationFallbackIcon } from './TranslationFallbackBadge';
import { getIconForEmoji, faWandMagicSparkles } from '../lib/iconMapper';
import { truncateOnWordBoundary, generateCriterionId } from '../lib/textUtils';
import { getPrincipleColor } from '../lib/principleUtils';
import { getLevelClass, getLevelShape } from '../lib/levelUtils';
import { getMetadataButtonClasses } from '../lib/metadataColors';
import { MAX_SELECTED_TAGS } from '../lib/constants';

import type { Criterion, Term } from '../lib/types';

interface CriterionCardProps {
  criterion: Criterion;
  isFavorite: boolean;
  onToggleFavorite: () => void;
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
  terms?: Term[];
}

/**
 * Card view for displaying a single criterion
 * Wrapped in React.memo to prevent unnecessary re-renders
 */
function CriterionCard({
  criterion,
  isFavorite,
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
  terms = [],
}: CriterionCardProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Check if any filters are active
  const hasAnyFilter =
    selectedTags.length > 0 ||
    selectedAffectedUsers.length > 0 ||
    selectedAssignees.length > 0 ||
    selectedTechnologies.length > 0;

  // Check if criterion matches any selected metadata (OR logic)
  const hasSelectedTag =
    !hasAnyFilter ||
    (selectedTags.length > 0 &&
      criterion.tags?.some((tag) => selectedTags.includes(tag.id))) ||
    (selectedAffectedUsers.length > 0 &&
      criterion.affected_users?.some((user) => selectedAffectedUsers.includes(user.id))) ||
    (selectedAssignees.length > 0 &&
      criterion.assignees?.some((assignee) => selectedAssignees.includes(assignee.id))) ||
    (selectedTechnologies.length > 0 &&
      criterion.technologies?.some((tech) => selectedTechnologies.includes(tech.id)));
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWandModalOpen, setIsWandModalOpen] = useState(false);

  // Use translated content when available, fall back to English
  const displayTitle = criterion.translated_title || criterion.title;
  const displayGuidelineTitle = criterion.translated_guideline_handle || criterion.guideline_title;
  const displayPrinciple = criterion.translated_principle_handle || criterion.principle;
  const hasTranslation = criterion.has_translation ?? true; // Default to true for English

  // Level badge class and shape for accessibility
  const levelClass = getLevelClass(criterion.level);
  const levelShape = getLevelShape(criterion.level);

  // Truncate guideline title for breadcrumb (use translated content when available)
  const guidelineText = `${criterion.guideline_id} ${displayGuidelineTitle}`;
  const { truncated, wasTruncated, remaining } = truncateOnWordBoundary(
    guidelineText,
    40
  );

  // Principle colors for page curl (use original principle for color mapping)
  const principleColor = getPrincipleColor(criterion.principle);

  return (
    <article
      className={`card relative transition-all duration-500 ${!hasSelectedTag ? 'opacity-50 blur-sm' : ''}`}
      aria-label={`${criterion.num} ${criterion.title}, Level ${criterion.level}, WCAG ${criterion.version}`}
      id={generateCriterionId(criterion.num)}
      {...(!hasSelectedTag && { inert: '' as any })}
    >
      <div className="absolute right-4 top-4 flex gap-2">
        <ShareButton
          criterionNum={criterion.num}
          criterionTitle={criterion.title}
        />
        <StarButton
          isFavorite={isFavorite}
          onToggle={onToggleFavorite}
          criterionNum={criterion.num}
          showTrash={showTrash}
        />
      </div>
      <div className="mb-2 flex items-start justify-between gap-4 pr-20">
        <h2
          className="flex-1 text-lg font-semibold"
          tabIndex={-1}
          aria-label={`${criterion.num} — ${displayTitle}, Level ${criterion.level}, WCAG ${criterion.version}`}
        >
          <span className="text-blue-600 dark:text-blue-400" aria-hidden="true">
            {criterion.num}
          </span>
          <span aria-hidden="true">{` — ${displayTitle}`}</span>
          <TranslationFallbackIcon
            hasTranslation={hasTranslation}
            currentLanguage={currentLanguage}
            className="ml-2 inline-block align-middle"
          />
        </h2>
        <div className="flex flex-shrink-0 gap-2" aria-hidden="true">
          {criterion.level && (
            <span className={levelClass}>
              <span className="mr-1">{levelShape}</span>
              {criterion.level}
            </span>
          )}
          <span className="badge border border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {criterion.version}
          </span>
        </div>
      </div>

      <nav
        aria-label="You are here"
        className="mb-3 text-sm text-gray-600 dark:text-gray-400"
      >
        <ol className="inline-flex items-center">
          <li className="font-medium">{displayPrinciple}</li>
          <li aria-hidden="true" className="mx-1">
            ›
          </li>
          <li>
            {truncated}
            {wasTruncated && (
              <>
                <span className="sr-only">{` ${remaining}`}</span>
                <span aria-hidden="true"> (…)</span>
              </>
            )}
          </li>
        </ol>
      </nav>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`details-${criterion.id}`}
        className="btn btn-secondary flex w-full items-center justify-between"
      >
        <span>{isExpanded ? 'Hide' : 'Show'} Details</span>
        <span aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div id={`details-${criterion.id}`} className="mt-4 space-y-4">
          <CriterionDetails detailsJson={criterion.translated_details_json || criterion.details_json} terms={terms} />

          <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-2 dark:border-gray-700">
            {(criterion.localized_how_to_meet_url || criterion.how_to_meet) && (
              <a
                href={criterion.localized_how_to_meet_url || criterion.how_to_meet!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                How to Meet {criterion.num}
                <span className="sr-only">
                  {' '}
                  - {criterion.title} (opens in new window)
                </span>
              </a>
            )}
            {(criterion.localized_understanding_url || criterion.understanding) && (
              <a
                href={criterion.localized_understanding_url || criterion.understanding!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Understanding {criterion.num}
                <span className="sr-only">
                  {' '}
                  - {criterion.title} (opens in new window)
                </span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Metadata Section */}
      {(criterion.tags && criterion.tags.length > 0) ||
      (criterion.affected_users && criterion.affected_users.length > 0) ||
      (criterion.assignees && criterion.assignees.length > 0) ||
      (criterion.technologies && criterion.technologies.length > 0) ? (
        <div
          className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700"
          data-easy-mode-hide="metadata"
        >
          {/* Tags */}
          {criterion.tags && criterion.tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {criterion.tags.map((tag) => {
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
                      className={`inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        getMetadataButtonClasses('tags', isSelected, isAtMax)
                      } ${!isAtMax && !isSelected ? 'cursor-pointer' : ''}`}
                      title={
                        isAtMax
                          ? 'Maximum 3 tags selected'
                          : tag.description || tag.name
                      }
                      aria-pressed={isSelected}
                      data-easy-mode-hide="tag"
                    >
                      {icon && (
                        <FontAwesomeIcon
                          icon={icon}
                          className="mr-1.5"
                          aria-hidden="true"
                        />
                      )}
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Affected Users */}
          {criterion.affected_users && criterion.affected_users.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Affects
              </h3>
              <div className="flex flex-wrap gap-2">
                {criterion.affected_users.map((user) => {
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
                      className={`inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-medium transition-colors ${
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
                          className="mr-1.5"
                          aria-hidden="true"
                        />
                      )}
                      {user.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assignees */}
          {criterion.assignees && criterion.assignees.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Responsibility
              </h3>
              <div className="flex flex-wrap gap-2">
                {criterion.assignees.map((assignee) => {
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
                      className={`inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-medium transition-colors ${
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
                          className="mr-1.5"
                          aria-hidden="true"
                        />
                      )}
                      {assignee.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Technologies */}
          {criterion.technologies && criterion.technologies.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {criterion.technologies.map((tech) => {
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
                      className={`inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-medium transition-colors ${
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
                          className="mr-1.5"
                          aria-hidden="true"
                        />
                      )}
                      {tech.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Page Curl with Magic Wand */}
      <button
        onClick={() => setIsWandModalOpen(true)}
        className="absolute bottom-0 right-0 h-16 w-16 overflow-hidden transition-all duration-200 hover:h-20 hover:w-20"
        aria-label="Open AI assistant for this criterion"
        title="Open AI assistant"
        data-easy-mode-hide="wand"
      >
        <div
          className="absolute bottom-0 right-0 h-0 w-0"
          style={{
            borderBottom: `64px solid ${principleColor}`,
            borderLeft: '64px solid transparent',
          }}
        ></div>
        <FontAwesomeIcon
          icon={faWandMagicSparkles}
          className="absolute bottom-2 right-2 text-white transition-all duration-200"
          size="lg"
          aria-hidden="true"
        />
      </button>

      {/* Modal for Magic Wand feature */}
      <Modal
        isOpen={isWandModalOpen}
        onClose={() => setIsWandModalOpen(false)}
        title="AI Assistant"
      >
        <p className="text-gray-700 dark:text-gray-300">
          This feature is coming soon! It will provide AI-powered assistance for
          understanding and implementing this success criterion.
        </p>
      </Modal>
    </article>
  );
}

export default memo(CriterionCard);

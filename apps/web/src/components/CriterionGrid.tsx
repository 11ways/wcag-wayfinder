import { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CriterionDetails from './CriterionDetails';
import Modal from './Modal';
import ShareButton from './ShareButton';
import StarButton from './StarButton';
import { TranslationFallbackIcon } from './TranslationFallbackBadge';
import { getIconForEmoji, faWandMagicSparkles } from '../lib/iconMapper';
import { generateCriterionId } from '../lib/textUtils';
import { getPrincipleColor } from '../lib/principleUtils';
import { getLevelClass, getLevelShape } from '../lib/levelUtils';

import type { Criterion, Term } from '../lib/types';

interface CriterionGridProps {
  criteria: Criterion[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  showTrash?: boolean;
  selectedTags: number[];
  onTagToggle: (tagId: number) => void;
  terms?: Term[];
}

function CriterionGridCard({
  criterion,
  isFavorite,
  onToggleFavorite,
  showTrash = false,
  selectedTags,
  onTagToggle,
  terms = [],
}: {
  criterion: Criterion;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  showTrash?: boolean;
  selectedTags: number[];
  onTagToggle: (tagId: number) => void;
  terms?: Term[];
}) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Check if criterion has any selected tags
  const hasSelectedTag =
    selectedTags.length === 0 ||
    (criterion.tags &&
      criterion.tags.some((tag) => selectedTags.includes(tag.id)));
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWandModalOpen, setIsWandModalOpen] = useState(false);

  // Use translated content when available, fall back to English
  const displayTitle = criterion.translated_title || criterion.title;
  const hasTranslation = criterion.has_translation ?? true;

  // Level badge class and shape for accessibility
  const levelClass = getLevelClass(criterion.level);
  const levelShape = getLevelShape(criterion.level);

  // Principle colors for page curl (use original principle for color mapping)
  const principleColor = getPrincipleColor(criterion.principle);

  return (
    <article
      className={`card relative flex h-full flex-col transition-all duration-500 ${!hasSelectedTag ? 'opacity-50 blur-sm' : ''}`}
      aria-label={`${criterion.num} ${displayTitle}, Level ${criterion.level}`}
      id={generateCriterionId(criterion.num)}
      {...(!hasSelectedTag && { inert: '' as any })}
    >
      <div className="absolute right-4 top-4 flex gap-2">
        <ShareButton
          criterionNum={criterion.num}
          criterionTitle={displayTitle}
        />
        <StarButton
          isFavorite={isFavorite}
          onToggle={onToggleFavorite}
          criterionNum={criterion.num}
          showTrash={showTrash}
        />
      </div>
      <div className="mb-2 flex items-start justify-between gap-2 pr-20">
        <h2
          className="flex-1 text-base font-semibold"
          tabIndex={-1}
          aria-label={`${criterion.num} — ${displayTitle}, Level ${criterion.level}`}
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
        <div className="flex flex-shrink-0 gap-1" aria-hidden="true">
          {criterion.level && (
            <span className={`${levelClass} text-xs`}>
              <span className="mr-0.5">{levelShape}</span>
              {criterion.level}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`details-${criterion.id}`}
        className="btn btn-secondary mb-3 flex w-full items-center justify-between text-sm"
      >
        <span>{isExpanded ? 'Hide' : 'Show'} Details</span>
        <span aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div id={`details-${criterion.id}`} className="mb-3 space-y-2">
          <CriterionDetails
            detailsJson={criterion.translated_details_json || criterion.details_json}
            className="text-xs"
            terms={terms}
          />

          <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
            {(criterion.localized_how_to_meet_url || criterion.how_to_meet) && (
              <a
                href={criterion.localized_how_to_meet_url || criterion.how_to_meet!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                How to Meet
              </a>
            )}
            {(criterion.localized_understanding_url || criterion.understanding) && (
              <a
                href={criterion.localized_understanding_url || criterion.understanding!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Understanding
              </a>
            )}
          </div>
        </div>
      )}

      {/* Metadata Section - Compact */}
      <div
        className="mt-auto space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700"
        data-easy-mode-hide="metadata"
      >
        {criterion.tags && criterion.tags.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1">
              {criterion.tags.map((tag) => {
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
                    className={`inline-flex items-center rounded border-2 px-1.5 py-0.5 text-xs font-medium transition-colors ${
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
                    data-easy-mode-hide="tag"
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
              })}
            </div>
          </div>
        )}

        {criterion.affected_users && criterion.affected_users.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Affects
            </h3>
            <div className="flex flex-wrap gap-1">
              {criterion.affected_users.map((user) => {
                const icon = getIconForEmoji(user.icon);
                return (
                  <span
                    key={user.id}
                    className="inline-flex items-center rounded border border-blue-300 bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    title={user.description || user.name}
                  >
                    {icon && (
                      <FontAwesomeIcon
                        icon={icon}
                        className="mr-1"
                        aria-hidden="true"
                      />
                    )}
                    {user.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {criterion.assignees && criterion.assignees.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Responsibility
            </h3>
            <div className="flex flex-wrap gap-1">
              {criterion.assignees.map((assignee) => {
                const icon = getIconForEmoji(assignee.icon);
                return (
                  <span
                    key={assignee.id}
                    className="inline-flex items-center rounded border border-purple-300 bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-800 dark:border-purple-700 dark:bg-purple-900 dark:text-purple-200"
                    title={assignee.description || assignee.name}
                  >
                    {icon && (
                      <FontAwesomeIcon
                        icon={icon}
                        className="mr-1"
                        aria-hidden="true"
                      />
                    )}
                    {assignee.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {criterion.technologies && criterion.technologies.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-1">
              {criterion.technologies.map((tech) => {
                const icon = getIconForEmoji(tech.icon);
                return (
                  <span
                    key={tech.id}
                    className="inline-flex items-center rounded border border-green-300 bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-200"
                    title={tech.description || tech.name}
                  >
                    {icon && (
                      <FontAwesomeIcon
                        icon={icon}
                        className="mr-1"
                        aria-hidden="true"
                      />
                    )}
                    {tech.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

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

// Memoize the internal card component
const MemoizedCriterionGridCard = memo(CriterionGridCard);

/**
 * Grid view for displaying criteria
 * Wrapped in React.memo to prevent unnecessary re-renders
 */
function CriterionGrid({
  criteria,
  favorites,
  onToggleFavorite,
  showTrash = false,
  selectedTags,
  onTagToggle,
  terms = [],
}: CriterionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {criteria.map((criterion) => (
        <MemoizedCriterionGridCard
          key={criterion.id}
          criterion={criterion}
          isFavorite={favorites.has(criterion.id)}
          onToggleFavorite={() => onToggleFavorite(criterion.id)}
          showTrash={showTrash}
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
          terms={terms}
        />
      ))}
    </div>
  );
}

export default memo(CriterionGrid);

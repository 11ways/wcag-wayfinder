import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { getIconForEmoji } from '../lib/iconMapper';
import { getMetadataButtonClasses } from '../lib/metadataColors';

import type { Tag, AffectedUser, Assignee, Technology } from '../lib/types';

interface SelectedTagsPaneProps {
  // Tags
  selectedTags: Tag[];
  onRemoveTag: (tagId: number) => void;
  // Affected Users
  selectedAffectedUsers: AffectedUser[];
  onRemoveAffectedUser: (id: number) => void;
  // Assignees
  selectedAssignees: Assignee[];
  onRemoveAssignee: (id: number) => void;
  // Technologies
  selectedTechnologies: Technology[];
  onRemoveTechnology: (id: number) => void;
  // Combined
  onClearAll: () => void;
  totalResults: number;
  matchingResults: number;
  hideCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function SelectedTagsPane({
  selectedTags,
  onRemoveTag,
  selectedAffectedUsers,
  onRemoveAffectedUser,
  selectedAssignees,
  onRemoveAssignee,
  selectedTechnologies,
  onRemoveTechnology,
  onClearAll,
  totalResults,
  matchingResults,
  hideCollapsed,
  onToggleCollapse,
}: SelectedTagsPaneProps) {
  const { t } = useTranslation('filters');

  // Calculate total count across all metadata types
  const totalCount =
    selectedTags.length +
    selectedAffectedUsers.length +
    selectedAssignees.length +
    selectedTechnologies.length;

  if (totalCount === 0) {
    return null;
  }

  const hiddenResults = totalResults - matchingResults;

  return (
    <aside
      className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
      aria-label={t('tags.active', { count: totalCount })}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-primary text-sm font-semibold">
          {t('tags.active', { count: totalCount })} ({t('tags.shown', { count: matchingResults })}; {t('tags.hidden', { count: hiddenResults })})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onToggleCollapse}
            className="text-xs font-medium uppercase tracking-wider text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label={
              hideCollapsed
                ? t('tags.expandHidden')
                : t('tags.collapseHidden')
            }
          >
            {hideCollapsed ? t('tags.expandHiddenShort') : t('tags.collapseHiddenShort')}
          </button>
          <button
            onClick={onClearAll}
            className="text-xs font-medium uppercase tracking-wider text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label={t('tags.clearAll')}
          >
            {t('tags.clearAll')}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Tags Section */}
        {selectedTags.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => {
                const icon = getIconForEmoji(tag.icon);

                return (
                  <button
                    key={tag.id}
                    onClick={() => onRemoveTag(tag.id)}
                    className={`inline-flex items-center gap-1.5 rounded border-2 px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80 ${
                      getMetadataButtonClasses('tags', true, false)
                    }`}
                    aria-label={t('tags.remove', { tag: tag.name })}
                    title={tag.description || tag.name}
                  >
                    {icon && <FontAwesomeIcon icon={icon} aria-hidden="true" />}
                    <span>{tag.name}</span>
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="h-3 w-3"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Affects Section */}
        {selectedAffectedUsers.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              Affects
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedAffectedUsers.map((user) => {
                const icon = getIconForEmoji(user.icon);

                return (
                  <button
                    key={user.id}
                    onClick={() => onRemoveAffectedUser(user.id)}
                    className={`inline-flex items-center gap-1.5 rounded border-2 px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80 ${
                      getMetadataButtonClasses('affects', true, false)
                    }`}
                    aria-label={t('tags.remove', { tag: user.name })}
                    title={user.description || user.name}
                  >
                    {icon && <FontAwesomeIcon icon={icon} aria-hidden="true" />}
                    <span>{user.name}</span>
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="h-3 w-3"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Responsibility Section */}
        {selectedAssignees.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              Responsibility
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedAssignees.map((assignee) => {
                const icon = getIconForEmoji(assignee.icon);

                return (
                  <button
                    key={assignee.id}
                    onClick={() => onRemoveAssignee(assignee.id)}
                    className={`inline-flex items-center gap-1.5 rounded border-2 px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80 ${
                      getMetadataButtonClasses('responsibility', true, false)
                    }`}
                    aria-label={t('tags.remove', { tag: assignee.name })}
                    title={assignee.description || assignee.name}
                  >
                    {icon && <FontAwesomeIcon icon={icon} aria-hidden="true" />}
                    <span>{assignee.name}</span>
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="h-3 w-3"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Technologies Section */}
        {selectedTechnologies.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedTechnologies.map((tech) => {
                const icon = getIconForEmoji(tech.icon);

                return (
                  <button
                    key={tech.id}
                    onClick={() => onRemoveTechnology(tech.id)}
                    className={`inline-flex items-center gap-1.5 rounded border-2 px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80 ${
                      getMetadataButtonClasses('technology', true, false)
                    }`}
                    aria-label={t('tags.remove', { tag: tech.name })}
                    title={tech.description || tech.name}
                  >
                    {icon && <FontAwesomeIcon icon={icon} aria-hidden="true" />}
                    <span>{tech.name}</span>
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="h-3 w-3"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

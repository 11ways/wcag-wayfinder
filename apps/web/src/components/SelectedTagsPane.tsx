import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { getIconForEmoji } from '../lib/iconMapper';

import type { Tag } from '../lib/types';

interface SelectedTagsPaneProps {
  selectedTags: Tag[];
  onRemoveTag: (tagId: number) => void;
  onClearAll: () => void;
  totalResults: number;
  matchingResults: number;
  hideCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function SelectedTagsPane({
  selectedTags,
  onRemoveTag,
  onClearAll,
  totalResults,
  matchingResults,
  hideCollapsed,
  onToggleCollapse,
}: SelectedTagsPaneProps) {
  const { t } = useTranslation('filters');

  if (selectedTags.length === 0) {
    return null;
  }

  const tagCount = selectedTags.length;
  const hiddenResults = totalResults - matchingResults;

  return (
    <aside
      className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
      aria-label={t('tags.active', { count: tagCount })}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-primary text-sm font-semibold">
          {t('tags.active', { count: tagCount })} ({t('tags.shown', { count: matchingResults })}; {t('tags.hidden', { count: hiddenResults })})
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
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => {
          const icon = getIconForEmoji(tag.icon);

          return (
            <button
              key={tag.id}
              onClick={() => onRemoveTag(tag.id)}
              className="inline-flex items-center gap-1.5 rounded border-2 border-yellow-500 bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-900 transition-colors hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:hover:bg-yellow-800"
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
    </aside>
  );
}

import {
  faList,
  faTableCells,
  faGrip,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

export type ViewMode = 'list' | 'card' | 'grid';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({
  currentView,
  onViewChange,
}: ViewToggleProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex gap-0 overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
      role="group"
      aria-label={t('common:views.list')}
      data-easy-mode-hide="view-toggle"
    >
      <button
        onClick={() => onViewChange('list')}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          currentView === 'list'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        aria-label={t('common:views.list')}
        aria-pressed={currentView === 'list'}
        title={t('common:views.list')}
      >
        <FontAwesomeIcon icon={faList} className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange('card')}
        className={`border-x border-gray-300 px-4 py-2 text-sm font-medium transition-colors dark:border-gray-600 ${
          currentView === 'card'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        aria-label={t('common:views.card')}
        aria-pressed={currentView === 'card'}
        title={t('common:views.card')}
      >
        <FontAwesomeIcon icon={faTableCells} className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange('grid')}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          currentView === 'grid'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        aria-label={t('common:views.grid')}
        aria-pressed={currentView === 'grid'}
        title={t('common:views.grid')}
      >
        <FontAwesomeIcon icon={faGrip} className="h-4 w-4" />
      </button>
    </div>
  );
}

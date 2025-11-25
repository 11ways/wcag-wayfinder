import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faStar as faStarSolid,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

interface StarButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  criterionNum?: string;
  className?: string;
  showTrash?: boolean;
}

export default function StarButton({
  isFavorite,
  onToggle,
  criterionNum,
  className = '',
  showTrash = false,
}: StarButtonProps) {
  const { t } = useTranslation();

  // On favorites page, show trash icon for favorited items
  const icon =
    showTrash && isFavorite
      ? faTrash
      : isFavorite
        ? faStarSolid
        : faStarRegular;
  const colorClass =
    showTrash && isFavorite
      ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500'
      : 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-500';

  const ariaLabel = isFavorite
    ? criterionNum
      ? t('common:favorites.remove', { criterion: criterionNum })
      : t('common:favorites.removeShort')
    : criterionNum
      ? t('common:favorites.add', { criterion: criterionNum })
      : t('common:favorites.addShort');

  const title = isFavorite
    ? t('common:favorites.removeShort')
    : t('common:favorites.addShort');

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`${colorClass} transition-colors ${className}`}
      aria-label={ariaLabel}
      title={title}
      data-easy-mode-hide="favorite"
    >
      <FontAwesomeIcon icon={icon} className="h-5 w-5" />
    </button>
  );
}

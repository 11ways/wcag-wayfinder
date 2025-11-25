import { useTranslation } from 'react-i18next';

interface LoadingIndicatorProps {
  show: boolean;
}

/**
 * A fixed-position loading indicator that appears in the top-left corner.
 * Features a spinning animation and smooth fade transitions.
 * Includes proper ARIA attributes for screen reader announcements.
 *
 * @param show - Whether to show the loading indicator
 */
export default function LoadingIndicator({ show }: LoadingIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`fixed left-4 top-4 z-50 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-lg transition-opacity duration-[250ms] dark:bg-blue-500 ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="flex items-center gap-2">
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {t('common:status.loading')}
      </span>
    </div>
  );
}

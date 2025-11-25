import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLanguage } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface TranslationFallbackBadgeProps {
  /** Whether the content has a translation in the current language */
  hasTranslation: boolean;
  /** Current display language code */
  currentLanguage: string;
  /** The language actually being displayed (usually 'en' for fallback) */
  displayLanguage?: string;
  /** Whether to show as inline badge or block element */
  variant?: 'badge' | 'banner';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays an indicator when content is shown in English due to missing translation.
 * Used for WCAG content that doesn't have a translation in the selected language.
 *
 * Shows:
 * - Nothing when hasTranslation is true or currentLanguage is 'en'
 * - A visual indicator when showing English fallback for non-English language
 */
export default function TranslationFallbackBadge({
  hasTranslation,
  currentLanguage,
  displayLanguage = 'en',
  variant = 'badge',
  className = '',
}: TranslationFallbackBadgeProps) {
  const { t } = useTranslation();

  // Don't show indicator if:
  // - Content has translation
  // - User is viewing in English (no fallback needed)
  // - Display language matches current language
  if (hasTranslation || currentLanguage === 'en' || displayLanguage === currentLanguage) {
    return null;
  }

  if (variant === 'banner') {
    return (
      <div
        className={`flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 ${className}`}
        role="status"
        aria-live="polite"
      >
        <FontAwesomeIcon icon={faLanguage} className="h-4 w-4" aria-hidden="true" />
        <span>
          {t('translation.fallbackBanner', 'Shown in English (translation not available)')}
        </span>
      </div>
    );
  }

  // Badge variant (default)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 ${className}`}
      title={t('translation.fallbackTooltip', 'This content is shown in English because a translation is not available')}
      aria-label={t('translation.fallbackAriaLabel', 'Content shown in English (translation unavailable)')}
    >
      <FontAwesomeIcon icon={faLanguage} className="h-3 w-3" aria-hidden="true" />
      <span>EN</span>
    </span>
  );
}

/**
 * A smaller, more subtle indicator for use in list/grid views
 */
export function TranslationFallbackIcon({
  hasTranslation,
  currentLanguage,
  className = '',
}: Pick<TranslationFallbackBadgeProps, 'hasTranslation' | 'currentLanguage' | 'className'>) {
  const { t } = useTranslation();

  if (hasTranslation || currentLanguage === 'en') {
    return null;
  }

  return (
    <span
      className={`text-amber-500 dark:text-amber-400 ${className}`}
      title={t('translation.fallbackTooltip', 'Shown in English (translation not available)')}
      aria-label={t('translation.fallbackAriaLabel', 'Content shown in English')}
    >
      <FontAwesomeIcon icon={faLanguage} className="h-3.5 w-3.5" />
    </span>
  );
}

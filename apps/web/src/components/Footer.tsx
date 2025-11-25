import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TranslationCreditsModal from './TranslationCreditsModal';

/**
 * Footer component with translation credits link
 * Always visible at the bottom of the page
 */
export default function Footer() {
  const { t } = useTranslation();
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="mt-auto border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('footer.copyright', { year: currentYear })}
          </p>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('footer.madeWith')}
            </span>

            <button
              onClick={() => setIsCreditsModalOpen(true)}
              className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
            >
              {t('footer.translationCredits')}
            </button>
          </div>
        </div>
      </footer>

      <TranslationCreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
      />
    </>
  );
}

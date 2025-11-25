import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FocusTrap } from 'focus-trap-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExternalLinkAlt, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useLanguagesQuery } from '../hooks/queries/useLanguagesQuery';
import type { Language } from '../lib/types';

interface TranslationCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TranslationCreditsModal({
  isOpen,
  onClose,
}: TranslationCreditsModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: languages, isLoading, error } = useLanguagesQuery();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      dialog.showModal();
      setIsDialogOpen(true);
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      dialog.addEventListener('keydown', handleKeyDown);
      return () => dialog.removeEventListener('keydown', handleKeyDown);
    } else {
      dialog.close();
      setIsDialogOpen(false);

      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!isInDialog) {
      onClose();
    }
  };

  const renderAuthorizationBadge = (lang: Language) => {
    const isAuthorized = lang.authorization_type === 'authorized';
    const isCandidate = lang.authorization_type === 'candidate_authorized';

    if (isAuthorized) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" aria-hidden="true" />
          {t('translationCredits.w3cAuthorized')}
        </span>
      );
    }

    if (isCandidate) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <FontAwesomeIcon icon={faInfoCircle} className="h-3 w-3" aria-hidden="true" />
          Candidate
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        {t('translationCredits.communityTranslation')}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="w-full max-w-4xl rounded-lg bg-white p-0 shadow-xl backdrop:bg-black backdrop:bg-opacity-50 dark:bg-gray-900"
      aria-labelledby="credits-modal-title"
    >
      {isDialogOpen && (
        <FocusTrap
          focusTrapOptions={{
            initialFocus: () => closeButtonRef.current!,
            allowOutsideClick: true,
          }}
        >
          <div className="max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div>
                <h2 id="credits-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('translationCredits.title')}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {t('translationCredits.intro')}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label={t('modal.close')}
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 180px)' }}>
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {t('error.generic')}
                </div>
              )}

              {languages && languages.length > 0 && (
                <div className="space-y-4">
                  {/* Group by WCAG version */}
                  {['2.2', '2.1'].map((version) => {
                    const versionLanguages = languages.filter(
                      (lang) => lang.wcag_version === version
                    );
                    if (versionLanguages.length === 0) return null;

                    return (
                      <div key={version}>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                          {`WCAG ${version}`}
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  {t('translationCredits.language')}
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  {t('translationCredits.translator')}
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  {t('translationCredits.authorization')}
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  {t('translationCredits.publicationDate')}
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  {t('translationCredits.source')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                              {versionLanguages.map((lang) => (
                                <tr key={`${lang.code}-${version}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <td className="whitespace-nowrap px-4 py-3">
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {lang.name}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {lang.native_name}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                    {lang.translator || t('translationCredits.noTranslator')}
                                  </td>
                                  <td className="px-4 py-3">
                                    {renderAuthorizationBadge(lang)}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {lang.translation_date || '—'}
                                  </td>
                                  <td className="px-4 py-3">
                                    {lang.source_url ? (
                                      <a
                                        href={lang.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                      >
                                        {t('translationCredits.viewSource')}
                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3 w-3" aria-hidden="true" />
                                      </a>
                                    ) : (
                                      <span className="text-sm text-gray-400">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="min-h-[44px] min-w-[88px] rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {t('actions.close')}
                </button>
              </div>
            </div>
          </div>
        </FocusTrap>
      )}
    </dialog>
  );
}

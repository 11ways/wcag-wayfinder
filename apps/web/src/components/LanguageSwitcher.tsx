import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { getEnabledLanguages, getLanguageCodes, type LanguageConfig } from '../lib/i18n/languages';
import { announce } from '../utils/announce';

/**
 * LanguageSwitcher - Accessible dropdown for changing the application language
 *
 * Features:
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Screen reader announcements
 * - Updates URL with new language prefix
 * - Persists choice to localStorage via i18next
 */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const languages = getEnabledLanguages();
  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];
  const currentIndex = languages.findIndex((l) => l.code === i18n.language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus management when dropdown opens
  useEffect(() => {
    if (isOpen && listRef.current) {
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, currentIndex]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const handleLanguageChange = useCallback(
    (lang: LanguageConfig) => {
      if (lang.code === i18n.language) {
        setIsOpen(false);
        return;
      }

      // Build dynamic regex from all enabled language codes
      const langCodes = getLanguageCodes().join('|');
      const langRegex = new RegExp(`^/(${langCodes})`);

      // Update URL: replace current language prefix with new one
      // LanguageWrapper will handle i18n sync based on the URL (single source of truth)
      const pathWithoutLang = location.pathname.replace(langRegex, '');
      const newPath = `/${lang.code}${pathWithoutLang || '/'}${location.search}${location.hash}`;

      // Navigate to new URL - LanguageWrapper handles the rest
      navigate(newPath, { replace: true });

      // Announce to screen readers (use the target language name, not translated)
      announce(`Language changed to ${lang.name}`);

      setIsOpen(false);
      buttonRef.current?.focus();
    },
    [i18n.language, location, navigate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        // Open dropdown with arrow keys or Enter/Space
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev < languages.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : languages.length - 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0) {
            handleLanguageChange(languages[focusedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(languages.length - 1);
          break;
      }
    },
    [isOpen, focusedIndex, languages, currentIndex, handleLanguageChange]
  );

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-200 dark:hover:bg-gray-700"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('common:language.select')}
        aria-controls="language-listbox"
      >
        <FontAwesomeIcon icon={faGlobe} className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{currentLang.name}</span>
        <span className="sm:hidden" aria-hidden="true">
          {currentLang.flag}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id="language-listbox"
          role="listbox"
          aria-label={t('common:language.select')}
          aria-activedescendant={focusedIndex >= 0 ? `lang-option-${languages[focusedIndex].code}` : undefined}
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {languages.map((lang, index) => (
            <li key={lang.code}>
              <button
                id={`lang-option-${lang.code}`}
                role="option"
                aria-selected={lang.code === i18n.language}
                onClick={() => handleLanguageChange(lang)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm ${
                  index === focusedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${
                  lang.code === i18n.language
                    ? 'font-medium text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
                lang={lang.code}
                tabIndex={-1}
              >
                <span className="text-base" aria-hidden="true">
                  {lang.flag}
                </span>
                <span className="flex-1">{lang.name}</span>
                {lang.code === i18n.language && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LanguageSwitcher;

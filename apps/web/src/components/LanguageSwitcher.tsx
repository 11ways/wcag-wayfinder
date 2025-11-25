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
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Sort languages alphabetically by native name
  const languages = getEnabledLanguages().sort((a, b) => a.name.localeCompare(b.name));
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

  // Focus and scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const button = optionRefs.current[focusedIndex];
      if (button) {
        button.focus();
        button.scrollIntoView({ block: 'nearest' });
      }
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
          className="absolute right-0 top-full z-50 mt-1 grid w-[580px] grid-flow-col grid-cols-[1fr_1fr] grid-rows-6 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {languages.map((lang, index) => {
            // Badge configuration based on authorization type
            const badgeConfig = {
              source: {
                label: 'Official',
                ariaLabel: `${lang.englishName} - Official W3C Source`,
                normalClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400',
              },
              authorized: {
                label: 'Authorized',
                ariaLabel: `${lang.englishName} - W3C Authorized Translation`,
                normalClass: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
              },
              candidate: {
                label: 'Candidate',
                ariaLabel: `${lang.englishName} - Candidate Authorized Translation`,
                normalClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
              },
              unofficial: {
                label: 'Unofficial',
                ariaLabel: `${lang.englishName} - Unofficial Translation`,
                normalClass: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
              },
            };

            const badge = badgeConfig[lang.authorizationType];

            return (
              <li key={lang.code}>
                <button
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  id={`lang-option-${lang.code}`}
                  role="option"
                  aria-selected={lang.code === i18n.language}
                  onClick={() => handleLanguageChange(lang)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    index === focusedIndex
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${
                    lang.code === i18n.language
                      ? 'font-bold'
                      : ''
                  } ${
                    lang.code === i18n.language && index !== focusedIndex
                      ? 'text-blue-600 dark:text-blue-400'
                      : index !== focusedIndex
                        ? 'text-gray-700 dark:text-gray-200'
                        : ''
                  }`}
                  lang={lang.code}
                  tabIndex={-1}
                >
                  {/* Checkmark - left of flag */}
                  <span className="w-4 shrink-0">
                    {lang.code === i18n.language && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className={`h-4 w-4 ${index === focusedIndex ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  {/* Flag */}
                  <span className="text-base" aria-hidden="true">
                    {lang.flag}
                  </span>
                  {/* Language name */}
                  <span className="flex-1">{lang.name}</span>
                  {/* Authorization badge */}
                  {badge && (
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        index === focusedIndex
                          ? 'bg-blue-500 text-blue-100 dark:bg-blue-400 dark:text-blue-900'
                          : badge.normalClass
                      }`}
                      aria-label={badge.ariaLabel}
                    >
                      {badge.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default LanguageSwitcher;

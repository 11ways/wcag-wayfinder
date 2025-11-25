/**
 * Language Configuration for WCAG Wayfinder
 *
 * This file defines supported languages and provides utilities for
 * language management. Adding a new language only requires:
 * 1. Adding an entry to SUPPORTED_LANGUAGES
 * 2. Creating translation files in /public/locales/{code}/
 * 3. Creating content files in /public/content/{code}/
 */

export type SupportedLanguage = 'en' | 'nl' | 'fr' | 'it' | 'ca' | 'pt-BR' | 'zh' | 'da' | 'fi' | 'no' | 'pl';

/** W3C translation authorization status */
export type AuthorizationType = 'source' | 'authorized' | 'candidate' | 'unofficial';

export interface LanguageConfig {
  /** ISO 639-1 language code */
  code: SupportedLanguage;
  /** Native language name (displayed to users) */
  name: string;
  /** English name (for accessibility/logging) */
  englishName: string;
  /** Flag emoji for visual identification */
  flag: string;
  /** Whether this language is enabled */
  enabled: boolean;
  /** Text direction: ltr (left-to-right) or rtl (right-to-left) */
  direction: 'ltr' | 'rtl';
  /** WCAG version for which translations are available ('2.2' or '2.1') */
  wcagVersion?: '2.2' | '2.1';
  /** Whether UI translations exist (if false, UI falls back to English) */
  hasUiTranslations?: boolean;
  /** W3C translation authorization status */
  authorizationType: AuthorizationType;
}

/**
 * List of all supported languages.
 * To add a new language:
 * 1. Add entry here with enabled: true
 * 2. Create /public/locales/{code}/*.json files
 * 3. Create /public/content/{code}/ folder with translated markdown
 */
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  // === WCAG 2.2 Languages (full 87 SC coverage) ===
  {
    code: 'en',
    name: 'English',
    englishName: 'English',
    flag: '🇬🇧',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.2',
    hasUiTranslations: true,
    authorizationType: 'source',
  },
  {
    code: 'nl',
    name: 'Nederlands',
    englishName: 'Dutch',
    flag: '🇳🇱',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.2',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
  {
    code: 'fr',
    name: 'Français',
    englishName: 'French',
    flag: '🇫🇷',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.2',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
  {
    code: 'it',
    name: 'Italiano',
    englishName: 'Italian',
    flag: '🇮🇹',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.2',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
  {
    code: 'ca',
    name: 'Català',
    englishName: 'Catalan',
    flag: '🏴󠁥󠁳󠁣󠁴󠁿', // Catalonia flag
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.2',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
  {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    englishName: 'Portuguese (Brazil)',
    flag: '🇧🇷',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.2',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
  // === WCAG 2.1 Languages (78 SC, 9 new WCAG 2.2 SC fallback to English) ===
  {
    code: 'zh',
    name: '简体中文',
    englishName: 'Chinese (Simplified)',
    flag: '🇨🇳',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.1',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
  {
    code: 'da',
    name: 'Dansk',
    englishName: 'Danish',
    flag: '🇩🇰',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.1',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
  {
    code: 'fi',
    name: 'Suomi',
    englishName: 'Finnish',
    flag: '🇫🇮',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.1',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
  {
    code: 'no',
    name: 'Norsk',
    englishName: 'Norwegian',
    flag: '🇳🇴',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.1',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
  {
    code: 'pl',
    name: 'Polski',
    englishName: 'Polish',
    flag: '🇵🇱',
    enabled: true,
    direction: 'ltr',
    wcagVersion: '2.1',
    hasUiTranslations: true,
    authorizationType: 'authorized',
  },
];

/** Default language when none is specified or detected */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/** Fallback language when a translation is missing */
export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';

/** localStorage key for persisting language preference */
export const LANGUAGE_STORAGE_KEY = 'wcag-wayfinder-language';

/**
 * Get all enabled languages
 */
export const getEnabledLanguages = (): LanguageConfig[] =>
  SUPPORTED_LANGUAGES.filter((l) => l.enabled);

/**
 * Get language configuration by code
 */
export const getLanguageByCode = (code: string): LanguageConfig | undefined =>
  SUPPORTED_LANGUAGES.find((l) => l.code === code);

/**
 * Check if a string is a valid, enabled language code
 */
export const isValidLanguage = (code: string | undefined): code is SupportedLanguage =>
  code !== undefined && SUPPORTED_LANGUAGES.some((l) => l.code === code && l.enabled);

/**
 * Get language codes as array (for i18next configuration)
 */
export const getLanguageCodes = (): SupportedLanguage[] =>
  getEnabledLanguages().map((l) => l.code);

/**
 * Check if a language is RTL
 */
export const isRTL = (code: string): boolean => getLanguageByCode(code)?.direction === 'rtl';

/**
 * Get the WCAG version for a language's translations
 */
export const getWcagVersion = (code: string): '2.2' | '2.1' | undefined =>
  getLanguageByCode(code)?.wcagVersion;

/**
 * Check if a language has full WCAG 2.2 translations
 */
export const hasFullWcag22 = (code: string): boolean =>
  getLanguageByCode(code)?.wcagVersion === '2.2';

/**
 * Check if a language has UI translations (not just WCAG content)
 */
export const hasUiTranslations = (code: string): boolean =>
  getLanguageByCode(code)?.hasUiTranslations ?? false;

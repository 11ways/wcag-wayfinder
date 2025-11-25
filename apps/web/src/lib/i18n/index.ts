/**
 * i18n Configuration for WCAG Wayfinder
 *
 * Uses react-i18next with:
 * - HTTP backend for loading translation files
 * - Browser language detection (path > localStorage > navigator)
 * - Namespace-based lazy loading
 */

import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend, { type HttpBackendOptions } from 'i18next-http-backend';
import LanguageDetector, {
  type DetectorOptions,
} from 'i18next-browser-languagedetector';

import {
  getLanguageCodes,
  FALLBACK_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
} from './languages';

const enabledCodes = getLanguageCodes();

const initOptions: InitOptions<HttpBackendOptions> = {
  // Supported languages
  supportedLngs: enabledCodes,

  // Default language when detection fails
  fallbackLng: FALLBACK_LANGUAGE,

  // Default namespace (loaded on init)
  defaultNS: 'common',

  // Load all namespaces upfront to prevent missing translation errors
  // With useSuspense: false, components render before lazy-loaded namespaces are ready
  ns: ['common', 'filters', 'results', 'settings'],

  // HTTP backend configuration
  backend: {
    // Path to translation files
    loadPath: '/locales/{{lng}}/{{ns}}.json',

    // Add cache-busting query param in production
    queryStringParams:
      import.meta.env.PROD && import.meta.env.VITE_BUILD_VERSION
        ? { v: import.meta.env.VITE_BUILD_VERSION }
        : undefined,
  },

  // Language detection configuration
  detection: {
    // Priority: URL path first, then localStorage, then browser
    order: ['path', 'localStorage', 'navigator'],

    // Look for language in first path segment: /en/, /nl/, /fr/
    lookupFromPathIndex: 0,

    // Cache detected language in localStorage
    caches: ['localStorage'],

    // localStorage key
    lookupLocalStorage: LANGUAGE_STORAGE_KEY,
  } satisfies DetectorOptions,

  // Interpolation settings
  interpolation: {
    // React already escapes values
    escapeValue: false,
  },

  // React-specific settings
  react: {
    // Don't use Suspense (handle loading states manually for better UX)
    useSuspense: false,

    // Allow basic HTML in translations
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'em', 'a'],
  },

  // Development helpers
  debug: false, // Set to true to debug i18n

  // Key/namespace separators
  keySeparator: '.',
  nsSeparator: ':',

  // Return key name if translation missing (development)
  returnEmptyString: false,

  // Log missing keys in development
  saveMissing: Boolean(import.meta.env.DEV),
  missingKeyHandler: (
    _lngs: readonly string[],
    ns: string,
    key: string
  ): void => {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing translation: ${ns}:${key}`);
    }
  },
};

// Initialize i18n
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(initOptions);

// Export configured instance
export default i18n;

// Re-export commonly used items
export { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE } from './languages';
export type { SupportedLanguage } from './languages';

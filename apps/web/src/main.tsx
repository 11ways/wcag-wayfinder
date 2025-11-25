import React, { useEffect, useState } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider, useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import App from './App';
import AdminPage from './pages/AdminPage';
import ModalTestPage from './pages/ModalTestPage';
import SettingsPage from './pages/SettingsPage';
import TermsPage from './pages/TermsPage';
import { applyReducedMotion } from './lib/accessibilitySettings';
import { queryClient } from './lib/queryClient';
import i18n from './lib/i18n';
import {
  isValidLanguage,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
} from './lib/i18n/languages';
import './index.css';

// Apply reduce motion setting on app initialization
applyReducedMotion();

/**
 * LanguageWrapper syncs the URL language parameter with i18next
 * and updates the document's lang attribute.
 *
 * Design: URL is the single source of truth for language. This component
 * syncs i18n state to match the URL parameter.
 */
function LanguageWrapper() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n: i18nInstance } = useTranslation();
  const [languageSynced, setLanguageSynced] = useState(false);

  // CRITICAL: Change language immediately, before any components render
  // This prevents the initial navigator language from being used
  useEffect(() => {
    // If language is invalid, redirect to default language
    if (!isValidLanguage(lang)) {
      const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '');
      navigate(`/${DEFAULT_LANGUAGE}${pathWithoutLang || '/'}${location.search}${location.hash}`, {
        replace: true,
      });
      return;
    }

    // Sync i18n language with URL synchronously and immediately
    const syncLanguage = async () => {
      // Always change language to match URL
      if (i18nInstance.language !== lang) {
        // Change language immediately (don't wait for loading)
        await i18nInstance.changeLanguage(lang);
      }

      // Update document language attributes
      const langConfig = getLanguageByCode(lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = langConfig?.direction || 'ltr';

      setLanguageSynced(true);
    };

    // Reset synced state and sync
    setLanguageSynced(false);
    syncLanguage();
  }, [lang, i18nInstance, navigate, location.pathname, location.search, location.hash]);

  // Don't render until language is valid and synced
  if (!isValidLanguage(lang) || !languageSynced) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/favorites" element={<App />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/modal-test" element={<ModalTestPage />} />
      <Route path="*" element={<App />} />
    </Routes>
  );
}

/**
 * Root component that sets up providers and handles language routing
 */
function Root() {
  return (
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              {/* Redirect root to default language */}
              <Route path="/" element={<Navigate to={`/${DEFAULT_LANGUAGE}/`} replace />} />

              {/* Handle old routes without language prefix by redirecting */}
              <Route
                path="/settings"
                element={<Navigate to={`/${DEFAULT_LANGUAGE}/settings`} replace />}
              />
              <Route
                path="/terms"
                element={<Navigate to={`/${DEFAULT_LANGUAGE}/terms`} replace />}
              />
              <Route
                path="/admin"
                element={<Navigate to={`/${DEFAULT_LANGUAGE}/admin`} replace />}
              />
              <Route
                path="/favorites"
                element={<Navigate to={`/${DEFAULT_LANGUAGE}/favorites`} replace />}
              />

              {/* Language-prefixed routes */}
              <Route path="/:lang/*" element={<LanguageWrapper />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </I18nextProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

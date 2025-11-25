import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getTheme,
  setTheme,
  applyTheme,
  getAllThemes,
  type Theme,
} from '../lib/themes';
import { announce } from '../utils/announce';

// Map theme keys to translation keys
const themeTranslationKeys: Record<Theme, string> = {
  system: 'common:theme.system',
  light: 'common:theme.light',
  dark: 'common:theme.dark',
  'solarized-light': 'common:theme.solarizedLight',
  'solarized-dark': 'common:theme.solarizedDark',
  dracula: 'common:theme.dracula',
  'high-contrast': 'common:theme.highContrast',
};

export default function ThemeSelector() {
  const { t } = useTranslation();
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');

  // Load theme on mount
  useEffect(() => {
    const savedTheme = getTheme();
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as Theme;
    setCurrentTheme(newTheme);
    setTheme(newTheme);
    applyTheme(newTheme);
    // Announce theme change to screen readers
    const themeName = t(themeTranslationKeys[newTheme]);
    announce(t('common:theme.changed', { theme: themeName }));
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-selector" className="text-sm font-medium">
        {t('common:theme.label')}
      </label>
      <select
        id="theme-selector"
        value={currentTheme}
        onChange={handleThemeChange}
        className="form-input min-h-[36px] px-2 py-1"
        aria-label={t('common:theme.select')}
      >
        {getAllThemes().map((theme) => (
          <option key={theme} value={theme}>
            {t(themeTranslationKeys[theme])}
          </option>
        ))}
      </select>
    </div>
  );
}

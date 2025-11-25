export type Theme =
  | 'system'
  | 'light'
  | 'dark'
  | 'solarized-light'
  | 'solarized-dark'
  | 'dracula'
  | 'high-contrast';

const THEME_STORAGE_KEY = 'wcag-explorer-theme';

/**
 * Get the current theme from localStorage, defaulting to 'system'
 */
export function getTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && isValidTheme(stored)) {
    return stored as Theme;
  }
  return 'system';
}

/**
 * Save the theme to localStorage
 */
export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Check if a string is a valid theme
 */
function isValidTheme(value: string): boolean {
  return [
    'system',
    'light',
    'dark',
    'solarized-light',
    'solarized-dark',
    'dracula',
    'high-contrast',
  ].includes(value);
}

/**
 * Apply the theme to the document
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Remove all theme classes first
  root.classList.remove(
    'theme-light',
    'theme-dark',
    'theme-solarized-light',
    'theme-solarized-dark',
    'theme-dracula',
    'theme-high-contrast'
  );

  if (theme === 'system') {
    // Let the browser's prefers-color-scheme handle it
    return;
  }

  // Add the specific theme class
  root.classList.add(`theme-${theme}`);
}

/**
 * Get the display name for a theme
 */
export function getThemeDisplayName(theme: Theme): string {
  switch (theme) {
    case 'system':
      return 'System Default';
    case 'light':
      return 'Light Mode';
    case 'dark':
      return 'Dark Mode';
    case 'solarized-light':
      return 'Solarized Light';
    case 'solarized-dark':
      return 'Solarized Dark';
    case 'dracula':
      return 'Dracula';
    case 'high-contrast':
      return 'High Contrast';
    default:
      return 'System Default';
  }
}

/**
 * Get all available themes
 */
export function getAllThemes(): Theme[] {
  return [
    'system',
    'light',
    'dark',
    'solarized-light',
    'solarized-dark',
    'dracula',
    'high-contrast',
  ];
}

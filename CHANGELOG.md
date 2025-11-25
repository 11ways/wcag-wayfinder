# Changelog

All notable changes to WCAG Wayfinder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-11-25

### Added
- Multi-language support for UI and content (11 languages total)
- WCAG 2.2 translations: English, Dutch, French, Italian, Catalan, Portuguese (Brazil)
- WCAG 2.1 translations: Chinese, Danish, Finnish, Norwegian, Polish
- Language switcher component in header with keyboard navigation
- URL-based language routing (`/nl/`, `/fr/`, etc.)
- Automatic dev port cleanup script to prevent `EADDRINUSE` errors

### Fixed
- Language detection now correctly reads from URL path instead of browser/localStorage
- i18n initialization race condition that prevented language switching in production
- API restart mechanism now properly kills both Node wrapper and Bun processes
- Deploy script now always restarts API even when no code changes detected
- Removed localStorage caching conflicts with URL-based language preference

### Changed
- i18n language detection order changed from `['path', 'localStorage', 'navigator']` to `['navigator']`
- LanguageWrapper component now immediately syncs i18n before rendering children
- Removed `ready` check from LanguageWrapper to prevent stale language on initial load
- Updated `package.json` dev script to include `kill-ports` for cleaner restarts
- Improved deploy script restart verification with PID reporting

### Technical Details
- i18next configured to load translations from `/locales/{lang}/{namespace}.json`
- API merges translated fields (`translated_title`, `translated_handle`, etc.) based on `lang` query parameter
- Frontend passes current language to API via `useResults` hook
- All UI components use `useTranslation()` hook for translated strings
- Translation files organized by namespace: `common`, `filters`, `results`, `settings`

## [0.1.0] - 2025-11-14

### Added
- Initial BETA release
- Browse and search 87 WCAG 2.2 success criteria
- Advanced filtering by version, level, principle, guideline
- Tag-based filtering (max 3 tags, 50+ tags available)
- Favorites system with localStorage persistence
- Multiple view modes (List, Card, Grid)
- Full-text search with fuzzy matching
- URL-based state management
- Dark mode and theme options
- Keyboard shortcuts (/, f)
- WCAG 2.2 Level AA compliant interface
- Screen reader support with ARIA live regions
- Responsive design for mobile and desktop

[0.2.0]: https://github.com/roelvangils/wcag-explorer/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/roelvangils/wcag-explorer/releases/tag/v0.1.0

# WCAG Explorer - Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Component Hierarchy](#component-hierarchy)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Module Dependency Graph](#module-dependency-graph)
6. [API Integration Patterns](#api-integration-patterns)
7. [State Management](#state-management)
8. [Routing Architecture](#routing-architecture)
9. [Theme System](#theme-system)
10. [Key Design Patterns](#key-design-patterns)
11. [Import/Export Patterns](#importexport-patterns)
12. [Accessibility Architecture](#accessibility-architecture)

---

## Overview

WCAG Explorer is a React-based single-page application built with TypeScript, Vite, and Tailwind CSS. It provides an accessible, user-friendly interface for exploring WCAG 2.0/2.1/2.2 success criteria with advanced filtering, search, and metadata features.

**Tech Stack:**
- **Framework:** React 18.2 with TypeScript 5.3
- **Build Tool:** Vite 5.0
- **Styling:** Tailwind CSS 3.4 with CSS custom properties
- **Routing:** React Router DOM 7.9
- **Icons:** Font Awesome 7.1
- **Markdown:** Marked 16.4
- **Security:** DOMPurify 3.3
- **Accessibility:** focus-trap-react 11.0

---

## Directory Structure

```
apps/web/
├── dist/                          # Build output
│   ├── assets/                    # Bundled JS/CSS
│   └── index.html                 # Production HTML
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md            # This file
│   └── SUMMARY.md                 # Project summary
├── public/                        # Static assets
│   └── content/
│       └── levels/                # WCAG level documentation
│           ├── level-a.md
│           ├── level-aa.md
│           └── level-aaa.md
├── src/
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles & theme system
│   ├── components/                # React components (16 files)
│   │   ├── CriterionCard.tsx      # Card view for criteria
│   │   ├── CriterionDetails.tsx   # Expandable criterion details
│   │   ├── CriterionGrid.tsx      # Grid layout view
│   │   ├── CriterionList.tsx      # List/compact view
│   │   ├── Filters.tsx            # Filter sidebar
│   │   ├── HelpModal.tsx          # Help content modal
│   │   ├── LiveRegion.tsx         # ARIA live region for announcements
│   │   ├── MetadataEditor.tsx     # Admin metadata editor
│   │   ├── Modal.tsx              # Reusable modal component
│   │   ├── Pagination.tsx         # Pagination controls
│   │   ├── ResultList.tsx         # Result view switcher
│   │   ├── SelectedTagsPane.tsx   # Tag filter summary
│   │   ├── ShareButton.tsx        # Share criterion link
│   │   ├── StarButton.tsx         # Favorite toggle button
│   │   ├── ThemeSelector.tsx      # Theme switcher
│   │   └── ViewToggle.tsx         # View mode selector
│   ├── lib/                       # Business logic & utilities (9 files)
│   │   ├── admin-api.ts           # Admin API client
│   │   ├── api.ts                 # Main API client
│   │   ├── debounce.ts            # Debounce utility
│   │   ├── favorites.ts           # Favorites localStorage manager
│   │   ├── filterState.ts         # Filter persistence
│   │   ├── iconMapper.ts          # Emoji to FontAwesome mapping
│   │   ├── textUtils.ts           # Text manipulation utilities
│   │   ├── themes.ts              # Theme management
│   │   ├── types.ts               # TypeScript type definitions
│   │   └── urlUtils.ts            # URL state management
│   ├── pages/                     # Page components (3 files)
│   │   ├── AdminPage.tsx          # Admin interface
│   │   ├── ModalTestPage.tsx      # Modal testing page
│   │   └── SettingsPage.tsx       # Accessibility settings
│   └── utils/
│       └── announce.ts            # Screen reader announcements
├── index.html                     # Development HTML template
├── package.json                   # Dependencies & scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.node.json             # TypeScript config for Node
├── vite.config.ts                 # Vite configuration
└── URL_ROUTING_TEST_PLAN.md       # URL routing test documentation
```

### Directory Descriptions

- **`/components`**: Presentational and container components. All UI elements are isolated here.
- **`/lib`**: Pure business logic, API clients, utilities, and type definitions. No React dependencies.
- **`/pages`**: Top-level route components representing distinct pages.
- **`/utils`**: Cross-cutting concerns like accessibility announcements.
- **`/public`**: Static assets served as-is (markdown content files).

---

## Component Hierarchy

```
App.tsx (Main Container)
│
├── LiveRegion (Screen Reader Announcements)
│
├── Header
│   ├── Link (to home)
│   ├── Search Input (with ref)
│   └── Favorites Button + Clear Button
│
├── Main Content
│   ├── Filters (Sidebar)
│   │   ├── Version Checkboxes
│   │   ├── Level Checkboxes + Help Buttons
│   │   │   └── HelpModal (conditional)
│   │   ├── Principle Checkboxes (expandable)
│   │   │   └── Guideline Radio Buttons (nested)
│   │   └── Guideline Search Input
│   │
│   └── Results Area
│       ├── ViewToggle (card/list/grid)
│       ├── Pagination (top)
│       ├── SelectedTagsPane (if tags selected)
│       ├── ResultList
│       │   ├── CriterionCard[] (default)
│       │   │   ├── StarButton
│       │   │   ├── ShareButton
│       │   │   ├── CriterionDetails (expandable)
│       │   │   └── Metadata (Tags, Affected Users, etc.)
│       │   ├── CriterionList[] (list view)
│       │   └── CriterionGrid[] (grid view)
│       └── Pagination (bottom)
│
└── Footer (Sticky)
    ├── W3C Link
    ├── Settings Link
    └── ThemeSelector

Pages (React Router)
├── App (default route: /)
├── SettingsPage (/settings)
├── AdminPage (/admin)
└── ModalTestPage (/modal-test)
```

### Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│  (State Management, URL Sync, Data Fetching)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┴──────────────┐
         │                           │
    ┌────▼─────┐              ┌──────▼────────┐
    │ Filters  │              │  ResultList   │
    │ (Sidebar)│              │  (Switcher)   │
    └────┬─────┘              └──────┬────────┘
         │                           │
    ┌────▼──────┐         ┌──────────┼────────────┐
    │ HelpModal │         │          │            │
    └───────────┘    ┌────▼────┐ ┌──▼──────┐ ┌──▼─────┐
                     │Criterion│ │Criterion│ │Criterion│
                     │  Card   │ │  List   │ │  Grid  │
                     └────┬────┘ └─────────┘ └────────┘
                          │
                ┌─────────┼──────────┐
                │         │          │
           ┌────▼────┐ ┌─▼──────┐ ┌▼────────┐
           │StarButton│ │Share   │ │Criterion│
           │          │ │Button  │ │Details  │
           └──────────┘ └────────┘ └─────────┘
```

---

## Data Flow Architecture

### Overall Data Flow Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                    Application State Flow                    │
└──────────────────────────────────────────────────────────────┘

1. User Interaction (Filter/Search/Navigate)
   │
   ▼
2. State Update (React useState)
   │
   ├──▶ URL State (urlUtils.ts - buildURL)
   │    └──▶ window.history.pushState
   │
   ├──▶ localStorage (filterState.ts, favorites.ts)
   │
   └──▶ API Call (api.ts - getCriteria)
        │
        ▼
3. Backend API (/api/criteria)
   │
   ▼
4. Response Processing
   │
   ├──▶ Update Results State
   ├──▶ Update Status Message
   └──▶ Screen Reader Announcement (announce.ts)
        │
        ▼
5. Re-render Components
   │
   └──▶ Display Updated UI
```

### Detailed Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │────▶│  App.tsx     │────▶│  API        │
│  Actions    │     │  (State)     │     │  Client     │
└─────────────┘     └──────┬───────┘     └──────┬──────┘
                           │                     │
                           │                     ▼
                           │              ┌──────────────┐
                           │              │   Backend    │
                           │              │   (Proxy)    │
                           │              └──────┬───────┘
                           │                     │
                           ▼                     │
                    ┌──────────────┐            │
                    │  URL State   │◀───────────┘
                    │  (urlUtils)  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ localStorage │
                    │  (persist)   │
                    └──────────────┘

State Updates Flow Through:
1. filters (QueryFilters) → URL + localStorage + API
2. searchInput (string) → debounced → filters
3. results (PaginatedResult) ← API response
4. favorites (Set<string>) ↔ localStorage
5. viewMode (ViewMode) ↔ localStorage
6. theme (Theme) ↔ localStorage
```

### State Update Patterns

**Filter Update Pattern:**
```typescript
// User changes filter
handleFilterChange(newValue)
  ↓
setFilters({ ...filters, newFilter: newValue, page: 1 })
  ↓
useEffect[filters] triggers:
  ├─→ saveFilters(filters) → localStorage
  ├─→ buildURL(filters) → window.history.pushState
  └─→ fetchResults() → API call
       ↓
  setResults(apiResponse)
       ↓
  Component re-renders
```

**URL-to-State Sync Pattern:**
```typescript
// Browser back/forward or direct URL access
window.popstate event OR initial load
  ↓
parseURL(window.location)
  ↓
mergeWithDefaults(urlFilters)
  ↓
setFilters(mergedFilters)
  ↓
(prevents loop with isUpdatingFromURL ref)
  ↓
API fetch triggered
```

---

## Module Dependency Graph

```
┌────────────────────────────────────────────────────────────┐
│                     Dependency Layers                      │
└────────────────────────────────────────────────────────────┘

Layer 1: Core Types & Pure Utilities (No Dependencies)
├── lib/types.ts
├── lib/debounce.ts
└── lib/textUtils.ts

Layer 2: Browser API Wrappers (Depends on Layer 1)
├── lib/favorites.ts         → types.ts
├── lib/filterState.ts       → types.ts
├── lib/themes.ts            → (no deps)
├── lib/urlUtils.ts          → types.ts
└── utils/announce.ts        → (no deps)

Layer 3: External API Clients (Depends on Layer 1)
├── lib/api.ts               → types.ts
├── lib/admin-api.ts         → types.ts
└── lib/iconMapper.ts        → @fortawesome/*

Layer 4: UI Components (Depends on Layer 1-3)
├── components/LiveRegion.tsx           → announce.ts
├── components/Modal.tsx                → announce.ts
├── components/HelpModal.tsx            → Modal.tsx, marked
├── components/ThemeSelector.tsx        → themes.ts
├── components/ViewToggle.tsx           → types.ts
├── components/Pagination.tsx           → (minimal deps)
├── components/StarButton.tsx           → @fortawesome/*
├── components/ShareButton.tsx          → textUtils.ts, @fortawesome/*
├── components/CriterionDetails.tsx     → types.ts, dompurify, marked
├── components/SelectedTagsPane.tsx     → types.ts, iconMapper.ts
├── components/CriterionCard.tsx        → types.ts, iconMapper.ts, textUtils.ts
│                                         StarButton, ShareButton, CriterionDetails
├── components/CriterionList.tsx        → CriterionCard
├── components/CriterionGrid.tsx        → CriterionCard
├── components/ResultList.tsx           → CriterionCard, CriterionList, CriterionGrid
├── components/Filters.tsx              → types.ts, api.ts, HelpModal, marked
└── components/MetadataEditor.tsx       → types.ts, admin-api.ts, iconMapper.ts

Layer 5: Pages (Depends on Layer 1-4)
├── pages/SettingsPage.tsx              → themes.ts, announce.ts
├── pages/AdminPage.tsx                 → api.ts, admin-api.ts, MetadataEditor
└── pages/ModalTestPage.tsx             → Modal.tsx

Layer 6: Application Root (Depends on All Layers)
├── App.tsx                             → All lib/*, most components/*
└── main.tsx                            → App.tsx, pages/*, react-router-dom
```

### Import Dependencies by File

```
App.tsx imports:
  React, React Router, FontAwesome
  lib/api, lib/debounce, lib/urlUtils, lib/favorites
  lib/filterState, lib/types
  components/Filters, ResultList, Pagination, ViewToggle
  components/ThemeSelector, LiveRegion, SelectedTagsPane
  utils/announce

Filters.tsx imports:
  React, marked
  lib/types, lib/api
  components/HelpModal

ResultList.tsx imports:
  lib/types
  components/CriterionCard, CriterionList, CriterionGrid, ViewToggle

CriterionCard.tsx imports:
  React, FontAwesome
  lib/iconMapper, lib/textUtils, lib/types
  components/StarButton, ShareButton, CriterionDetails
```

---

## API Integration Patterns

### API Client Architecture

**Base Configuration:**
```typescript
// lib/api.ts
const API_BASE = '/api';  // Proxied to http://localhost:8787 in dev

// Generic fetch wrapper with error handling
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}
```

### API Endpoints

```
Public API (lib/api.ts):
  GET  /api/criteria                    → PaginatedResult<Criterion>
       ?q=                              (search query)
       &principle=                      (multi-value)
       &level=                          (multi-value)
       &version=                        (multi-value)
       &guideline_id=
       &tag_id=                         (legacy single)
       &tag_ids=                        (not implemented in current api.ts)
       &page=
       &pageSize=

  GET  /api/criteria/:id                → Criterion
  GET  /api/principles                  → string[]
  GET  /api/guidelines                  → Guideline[]
  GET  /api/versions                    → string[]
  GET  /api/levels                      → string[]
  GET  /api/metadata/affected-users     → AffectedUser[]
  GET  /api/metadata/assignees          → Assignee[]
  GET  /api/metadata/technologies       → Technology[]
  GET  /api/metadata/tags               → Tag[]

Admin API (lib/admin-api.ts):
  POST   /admin/metadata/criteria/:id/:type
  DELETE /admin/metadata/criteria/:id/:type/:itemId
  PUT    /admin/metadata/criteria/:id/rank
  PUT    /admin/metadata/criteria/:id/review

  (Requires: Authorization: Bearer <password>)
```

### Query Building Pattern

```typescript
// lib/api.ts - getCriteria()
export async function getCriteria(filters: QueryFilters): Promise<PaginatedResult<Criterion>> {
  const params = new URLSearchParams();

  // Single value params
  if (filters.q) params.append('q', filters.q);
  if (filters.guideline_id) params.append('guideline_id', filters.guideline_id);
  if (filters.tag_id !== undefined) params.append('tag_id', String(filters.tag_id));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.pageSize) params.append('pageSize', String(filters.pageSize));

  // Array params - append multiple times
  filters.principle?.forEach(p => params.append('principle', p));
  filters.level?.forEach(l => params.append('level', l));
  filters.version?.forEach(v => params.append('version', v));

  const url = `${API_BASE}/criteria?${params.toString()}`;
  return fetchJson<PaginatedResult<Criterion>>(url);
}
```

### API Call Pattern in Components

```typescript
// App.tsx
const fetchResults = async () => {
  setIsLoading(true);
  setError(null);
  setStatusMessage('Loading results...');

  try {
    const data = await getCriteria(filters);
    setResults(data);

    // Additional processing for tag counts
    if (filters.tag_ids && filters.tag_ids.length > 0) {
      const filtersWithoutTags = { ...filters, tag_ids: undefined, pageSize: 1000 };
      const allData = await getCriteria(filtersWithoutTags);
      // ... count matching criteria
    }

    setStatusMessage(`${data.total} results found...`);
    announce(message); // Screen reader announcement
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch results';
    setError(errorMsg);
    announce(`Error: ${errorMsg}`, 'assertive');
  } finally {
    setIsLoading(false);
  }
};
```

### Vite Proxy Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',  // Cloudflare Worker
        changeOrigin: true,
      },
    },
  },
});
```

---

## State Management

### State Architecture

WCAG Explorer uses **local component state** (React useState) with **URL synchronization** and **localStorage persistence**. No global state library (Redux, Zustand) is used.

### State Categories

```
┌─────────────────────────────────────────────────────────┐
│                   State Categories                      │
├─────────────────────────────────────────────────────────┤
│ 1. UI State (Component-local)                           │
│    - Modal open/closed                                  │
│    - Expanded/collapsed sections                        │
│    - Form input values (controlled)                     │
│                                                         │
│ 2. Filter State (URL + localStorage)                    │
│    - filters: QueryFilters                              │
│    - searchInput: string (debounced)                    │
│                                                         │
│ 3. Data State (Server-derived)                          │
│    - results: PaginatedResult<Criterion>                │
│    - isLoading: boolean                                 │
│    - error: string | null                               │
│                                                         │
│ 4. User Preferences (localStorage)                      │
│    - favorites: Set<string>                             │
│    - viewMode: ViewMode                                 │
│    - theme: Theme                                       │
│    - announcementsEnabled: boolean                      │
│                                                         │
│ 5. Derived State (Computed)                             │
│    - totalCriteriaCount: number                         │
│    - matchingCriteriaCount: number                      │
│    - displayResults: PaginatedResult (filtered)         │
└─────────────────────────────────────────────────────────┘
```

### URL State Management

**URL Format:**
```
/[segment]/[segment]/...?query#hash

Segments:
  version:2-2           (default: 2.2, omitted if default)
  level:a+aa            (default: A+AA, omitted if default)
  principle:p+o+u+r     (all = omitted, uses codes: p,o,u,r)
  guideline:1-2         (dots → dashes)
  tag:1                 (legacy single tag)
  tags:1+2+3            (multiple tags, max 3)

Query:
  ?q=search+terms       (search query)

Hash:
  #sc-1-1-1             (scroll to criterion)

Examples:
  /                                    → All defaults (WCAG 2.2, Level A+AA)
  /version:2-0+2-1/level:aaa/          → WCAG 2.0+2.1, Level AAA
  /principle:p+o/guideline:1-3/?q=alt  → Perceivable+Operable, Guideline 1.3, search "alt"
  /tags:1+5+12/#sc-1-4-3               → Tags 1,5,12, scroll to SC 1.4.3
```

**URL Utilities (lib/urlUtils.ts):**

```typescript
// Parse URL → Filters
parseURL(pathname: string, search: string): QueryFilters
  - Splits pathname into segments
  - Parses each segment (version:, level:, etc.)
  - Handles aliases (p → Perceivable)
  - Parses query string (?q=)

// Filters → URL
buildURL(filters: QueryFilters, hash?: string): string
  - Omits defaults to keep URLs clean
  - Sorts multi-values for consistency
  - Appends query params and hash

// Default filters
getDefaultFilters(): QueryFilters
  - version: ['2.2']
  - level: ['A', 'AA']

// Merge with defaults
mergeWithDefaults(urlFilters: QueryFilters): QueryFilters
  - Fills missing required fields with defaults
  - Sets page/pageSize if not present
```

**URL Sync Logic (App.tsx):**

```typescript
// On mount and pathname change
useEffect(() => {
  isUpdatingFromURL.current = true;
  const urlFilters = parseURL(window.location.pathname, window.location.search);

  // If no URL filters, try loading from localStorage
  const hasUrlFilters = Object.keys(urlFilters).length > 0;
  let filtersToUse = urlFilters;

  if (!hasUrlFilters && window.location.pathname === '/') {
    const savedFilters = loadFilters();
    if (savedFilters) filtersToUse = savedFilters;
  }

  const mergedFilters = mergeWithDefaults(filtersToUse);
  setFilters(mergedFilters);
}, [location.pathname]);

// When filters change → update URL
useEffect(() => {
  if (isUpdatingFromURL.current) {
    isUpdatingFromURL.current = false;
    return; // Prevent loop
  }

  saveFilters(filters);  // localStorage
  const newURL = buildURL(filters, window.location.hash);
  window.history.pushState({}, '', newURL);
}, [filters]);

// Browser back/forward
useEffect(() => {
  const handlePopState = () => {
    isUpdatingFromURL.current = true;
    const urlFilters = parseURL(window.location.pathname, window.location.search);
    const mergedFilters = mergeWithDefaults(urlFilters);
    setFilters(mergedFilters);
  };

  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);
```

### localStorage State Management

**Storage Keys:**
```typescript
'wcag-explorer-filters'         // QueryFilters (excluding page/pageSize)
'wcag-explorer-view-mode'       // ViewMode: 'card' | 'list' | 'grid'
'wcag-explorer-favorites'       // string[] (criterion IDs)
'wcag-explorer-theme'           // Theme: 'system' | 'light' | 'dark' | ...
'wcag-explorer-announcements'   // boolean (enabled/disabled)
```

**Persistence Pattern:**

```typescript
// lib/filterState.ts
export interface SavedFilterState {
  filters: QueryFilters;
  timestamp: number;  // For potential expiration
}

export function saveFilters(filters: QueryFilters): void {
  try {
    const state: SavedFilterState = {
      filters,
      timestamp: Date.now(),
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save filters to localStorage:', error);
  }
}

export function loadFilters(): QueryFilters | null {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!stored) return null;

    const state: SavedFilterState = JSON.parse(stored);
    return state.filters;
  } catch (error) {
    console.error('Failed to load filters from localStorage:', error);
    return null;
  }
}
```

**Favorites Management (lib/favorites.ts):**

```typescript
export function getFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (error) {
    return new Set();
  }
}

export function toggleFavorite(id: string): Set<string> {
  const favorites = getFavorites();

  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }

  saveFavorites(favorites);
  return favorites;
}
```

### State Update Lifecycle

```
User Action
  ↓
setState(newValue)
  ↓
useEffect triggered
  ├─→ localStorage.setItem()
  ├─→ window.history.pushState()
  └─→ API fetch (if needed)
       ↓
  Component re-render
```

---

## Routing Architecture

### Router Configuration

```typescript
// main.tsx
<BrowserRouter>
  <Routes>
    <Route path="/admin" element={<AdminPage />} />
    <Route path="/modal-test" element={<ModalTestPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<App />} />
  </Routes>
</BrowserRouter>
```

### Route Mapping

```
┌──────────────────┬─────────────────────────────────────────┐
│ Route            │ Component                               │
├──────────────────┼─────────────────────────────────────────┤
│ /                │ App (main explorer)                     │
│ /version:*/...   │ App (with filters)                      │
│ /favorites       │ App (favorites mode)                    │
│ /settings        │ SettingsPage (accessibility settings)  │
│ /admin           │ AdminPage (metadata editor)             │
│ /modal-test      │ ModalTestPage (testing)                 │
└──────────────────┴─────────────────────────────────────────┘
```

### Dynamic Routing Pattern

All filter-based URLs are handled by `App.tsx` via the catch-all `path="*"` route:

```typescript
// App.tsx
const location = useLocation();
const navigate = useNavigate();
const isFavoritesPage = location.pathname === '/favorites';

// URL parsing happens in useEffect
useEffect(() => {
  const urlFilters = parseURL(window.location.pathname, window.location.search);
  // ... process filters
}, [location.pathname]);
```

### Navigation Methods

**Programmatic Navigation:**
```typescript
// Navigate to favorites
navigate('/favorites');

// Navigate to home
navigate('/');

// Navigate with Link component
<Link to="/">WCAG Explorer</Link>
<Link to="/settings">Accessibility Settings</Link>
```

**URL Updates (Same Route):**
```typescript
// Update URL without navigation (filter changes)
window.history.pushState({}, '', newURL);

// Hash navigation (scroll to criterion)
const newURL = buildURL(filters, '#sc-1-4-3');
window.history.pushState({}, '', newURL);
```

### Hash Navigation

```typescript
// App.tsx - Scroll to criterion on hash change
useEffect(() => {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#sc-')) {
    const timeout = setTimeout(() => {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-fade');  // Visual highlight
        setTimeout(() => {
          element.classList.remove('highlight-fade');
        }, 2000);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }
}, [results]);
```

---

## Theme System

### Theme Architecture

The theme system uses **CSS custom properties** with **class-based theme switching** and **prefers-color-scheme** support.

### Theme Types

```typescript
// lib/themes.ts
export type Theme =
  | 'system'          // Follows OS preference
  | 'light'           // Light mode
  | 'dark'            // Dark mode
  | 'solarized-dark'  // Solarized Dark
  | 'high-contrast';  // High contrast mode
```

### Theme Implementation Layers

```
┌──────────────────────────────────────────────────────────┐
│ Layer 1: CSS Custom Properties (index.css)              │
│   --color-bg-primary, --color-text-primary, etc.        │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ Layer 2: Theme Classes                                   │
│   .theme-light, .theme-dark, etc.                        │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ Layer 3: Tailwind Dark Mode Variants                     │
│   dark:bg-gray-800, dark:text-white, etc.                │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ Layer 4: Component Styles                                │
│   className="bg-primary text-primary"                    │
└──────────────────────────────────────────────────────────┘
```

### CSS Custom Properties

```css
/* index.css */
:root {
  /* Light theme (default) */
  --color-bg-primary: 255 255 255;
  --color-text-primary: 17 24 39;
  --color-accent-primary: 37 99 235;
  /* ... */
}

/* System dark mode */
@media (prefers-color-scheme: dark) {
  :root:not(.theme-light):not(.theme-solarized-dark):not(.theme-high-contrast) {
    --color-bg-primary: 17 24 39;
    --color-text-primary: 243 244 246;
    /* ... */
  }
}

/* Explicit themes */
.theme-dark {
  --color-bg-primary: 17 24 39;
  /* ... */
}

.theme-solarized-dark {
  --color-bg-primary: 0 43 54;  /* Solarized base03 */
  /* ... */
}

.theme-high-contrast {
  --color-bg-primary: 0 0 0;
  --color-text-primary: 255 255 255;
  --color-accent-primary: 255 255 0;  /* Bright yellow */
  /* ... */
}
```

### Tailwind Dark Mode Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: ['variant', [
    '@media (prefers-color-scheme: dark) { :root:not(.theme-light) & }',
    ':root.theme-dark &',
    ':root.theme-solarized-dark &',
    ':root.theme-high-contrast &',
  ]],
  // ...
}
```

This configuration enables Tailwind's `dark:` variants for:
1. System dark mode (when no explicit theme class)
2. `.theme-dark` class
3. `.theme-solarized-dark` class
4. `.theme-high-contrast` class

### Theme Management (lib/themes.ts)

```typescript
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Remove all theme classes
  root.classList.remove('theme-light', 'theme-dark',
                        'theme-solarized-dark', 'theme-high-contrast');

  if (theme === 'system') {
    // Let prefers-color-scheme handle it
    return;
  }

  // Add specific theme class
  root.classList.add(`theme-${theme}`);
}

export function getTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && isValidTheme(stored)) {
    return stored as Theme;
  }
  return 'system';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
```

### Theme Switcher Component

```typescript
// components/ThemeSelector.tsx
export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getTheme());

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    setTheme(theme);
    applyTheme(theme);
    announce(`Switched to ${getThemeDisplayName(theme)} theme`);
  };

  // Renders dropdown/select UI
}
```

### Theme Color Scheme

```
┌──────────────────┬─────────────┬─────────────┬──────────────┬──────────────┐
│ Variable         │ Light       │ Dark        │ Solarized    │ High Contrast│
├──────────────────┼─────────────┼─────────────┼──────────────┼──────────────┤
│ bg-primary       │ #FFFFFF     │ #111827     │ #002B36      │ #000000      │
│ bg-secondary     │ #F9FAFB     │ #1F2937     │ #073642      │ #000000      │
│ text-primary     │ #111827     │ #F3F4F6     │ #839496      │ #FFFFFF      │
│ text-secondary   │ #4B5563     │ #9CA3AF     │ #93A1A1      │ #FFFFFF      │
│ accent-primary   │ #2563EB     │ #3B82F6     │ #268BD2      │ #FFFF00      │
│ border-primary   │ #E5E7EB     │ #374151     │ #586E75      │ #FFFFFF      │
└──────────────────┴─────────────┴─────────────┴──────────────┴──────────────┘
```

### Usage in Components

```tsx
// Semantic class names (recommended)
<div className="bg-primary text-primary border-primary">
  <a className="text-accent hover:underline">Link</a>
</div>

// Tailwind utility classes with dark variants
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  <button className="bg-blue-600 dark:bg-blue-500 text-white">Button</button>
</div>

// Custom properties (direct usage)
<div style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}>
  Content
</div>
```

---

## Key Design Patterns

### 1. Container/Presentational Pattern

**Container Components:** Manage state and logic (e.g., `App.tsx`, `Filters.tsx`)
**Presentational Components:** Receive props and render UI (e.g., `CriterionCard.tsx`, `Pagination.tsx`)

```typescript
// Container: App.tsx
const [filters, setFilters] = useState<QueryFilters>({});
const [results, setResults] = useState<PaginatedResult<Criterion>>(...);

return (
  <Filters filters={filters} onFiltersChange={setFilters} />
  <ResultList criteria={results.items} ... />
);

// Presentational: CriterionCard.tsx
interface CriterionCardProps {
  criterion: Criterion;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  // ...
}

export default function CriterionCard({ criterion, isFavorite, ... }) {
  // Pure rendering logic
}
```

### 2. Render Props / Children Pattern

```typescript
// Modal.tsx
interface ModalProps {
  children: React.ReactNode;
  // ...
}

export default function Modal({ children, ... }) {
  return (
    <div role="dialog">
      <div>{children}</div>
    </div>
  );
}
```

### 3. Controlled Component Pattern

All form inputs are controlled by React state:

```typescript
// App.tsx
const [searchInput, setSearchInput] = useState('');

<input
  type="search"
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
/>
```

### 4. Custom Hook Pattern (Implicit)

While no custom hooks are explicitly defined, the codebase uses hook composition:

```typescript
// App.tsx
useEffect(() => {
  // URL sync logic
}, [location.pathname]);

useEffect(() => {
  // Filter change logic
}, [filters]);

useEffect(() => {
  // Browser navigation
}, []);
```

### 5. Debouncing Pattern

```typescript
// lib/debounce.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// App.tsx
const debouncedSearch = useCallback(
  debounce((query: string) => {
    setFilters(prev => ({ ...prev, q: query || undefined, page: 1 }));
  }, 300),
  []
);
```

### 6. Error Boundary Pattern (Manual)

```typescript
// App.tsx
const [error, setError] = useState<string | null>(null);

try {
  const data = await getCriteria(filters);
  setResults(data);
} catch (err) {
  const errorMsg = err instanceof Error ? err.message : 'Failed to fetch results';
  setError(errorMsg);
}

// ResultList.tsx
if (error) {
  return <div role="alert">{error}</div>;
}
```

### 7. Ref Pattern (Focus Management)

```typescript
// App.tsx
const searchInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === '/') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };
  // ...
}, []);

<input ref={searchInputRef} ... />
```

### 8. Event Emitter Pattern (Custom Events)

```typescript
// utils/announce.ts
export function announce(message: string, priority: Priority = 'polite'): void {
  const event = new CustomEvent(ANNOUNCE_EVENT, {
    detail: { message, priority }
  });
  window.dispatchEvent(event);
}

// components/LiveRegion.tsx
useEffect(() => {
  const handleAnnounce = (event: Event) => {
    const { message, priority } = (event as CustomEvent).detail;
    // Update live region
  };

  window.addEventListener(ANNOUNCE_EVENT, handleAnnounce);
  return () => window.removeEventListener(ANNOUNCE_EVENT, handleAnnounce);
}, []);
```

### 9. Portal Pattern (Modal)

```typescript
// components/Modal.tsx
if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
    <div className="bg-primary" role="document">
      {children}
    </div>
  </div>
);
```

### 10. Compound Component Pattern

```typescript
// Implicit in CriterionCard
<CriterionCard ...>
  <StarButton ... />
  <ShareButton ... />
  <CriterionDetails ... />
</CriterionCard>
```

### 11. Factory Pattern (Icon Mapping)

```typescript
// lib/iconMapper.ts
export const emojiToIcon: Record<string, IconDefinition> = {
  '🖼️': faImage,
  '📝': faFileLines,
  // ...
};

export function getIconForEmoji(emoji: string | undefined | null): IconDefinition | null {
  if (!emoji) return null;
  return emojiToIcon[emoji] || null;
}
```

### 12. Strategy Pattern (View Modes)

```typescript
// components/ResultList.tsx
export default function ResultList({ viewMode, ... }) {
  if (viewMode === 'list') {
    return <CriterionList ... />;
  }

  if (viewMode === 'grid') {
    return <CriterionGrid ... />;
  }

  // Default: card view
  return <div className="space-y-4">
    {criteria.map(c => <CriterionCard ... />)}
  </div>;
}
```

---

## Import/Export Patterns

### Module Export Patterns

**Named Exports (Utilities & Types):**
```typescript
// lib/types.ts
export type WcagLevel = 'A' | 'AA' | 'AAA' | '';
export interface Criterion { ... }
export interface QueryFilters { ... }

// lib/api.ts
export async function getCriteria(...) { ... }
export async function getPrinciples() { ... }
```

**Default Exports (Components):**
```typescript
// components/CriterionCard.tsx
export default function CriterionCard({ ... }) { ... }

// pages/SettingsPage.tsx
export default function SettingsPage() { ... }
```

**Mixed Exports:**
```typescript
// utils/announce.ts
export function announce(...) { ... }
export { ANNOUNCE_EVENT };
export type { Priority };

// components/ViewToggle.tsx
export type ViewMode = 'card' | 'list' | 'grid';
export default function ViewToggle({ ... }) { ... }
```

### Import Patterns

**Type-only Imports:**
```typescript
import type { Criterion, QueryFilters } from './lib/types';
import type { ViewMode } from './components/ViewToggle';
```

**Named Imports:**
```typescript
import { getCriteria, getPrinciples } from './lib/api';
import { announce } from './utils/announce';
import { useState, useEffect } from 'react';
```

**Default Imports:**
```typescript
import App from './App';
import CriterionCard from './components/CriterionCard';
import { marked } from 'marked';  // Some packages use named exports as default
```

**Aliased Imports:**
```typescript
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
```

### Import Organization

```typescript
// Standard ordering in most files:

// 1. React imports
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// 2. Third-party libraries
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { marked } from 'marked';

// 3. Internal libraries (types first, then utils)
import type { Criterion, QueryFilters, PaginatedResult } from './lib/types';
import { getCriteria } from './lib/api';
import { debounce } from './lib/debounce';
import { parseURL, buildURL } from './lib/urlUtils';

// 4. Internal components
import Filters from './components/Filters';
import ResultList from './components/ResultList';

// 5. Internal utilities
import { announce } from './utils/announce';
```

### Re-export Pattern

Not heavily used in this codebase, but present in some places:

```typescript
// Could create lib/index.ts
export * from './api';
export * from './types';
export * from './urlUtils';

// Then import from single source
import { getCriteria, type Criterion, parseURL } from './lib';
```

### Barrel Files

Not used in current architecture. Each module is imported directly:

```typescript
// Current approach (explicit imports)
import CriterionCard from './components/CriterionCard';
import CriterionList from './components/CriterionList';
import CriterionGrid from './components/CriterionGrid';

// Alternative with barrel file (not used)
// components/index.ts:
//   export { default as CriterionCard } from './CriterionCard';
//   export { default as CriterionList } from './CriterionList';
// import { CriterionCard, CriterionList } from './components';
```

---

## Accessibility Architecture

### WCAG Compliance Features

The application is built with WCAG 2.1 Level AA compliance in mind:

#### 1. Keyboard Navigation

**Skip Links:**
```tsx
// App.tsx
<div className="skip-links">
  <a href="#search" className="skip-link">Skip to search</a>
  <a href="#filters" className="skip-link">Skip to filters</a>
  <a href="#main-content" className="skip-link">Skip to results</a>
</div>
```

**Keyboard Shortcuts:**
```typescript
// App.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return; // Don't trigger in form fields
    }

    switch (e.key) {
      case '/':
        e.preventDefault();
        searchInputRef.current?.focus();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        filtersRef.current?.focus();
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

**Focus Management (Modal):**
```typescript
// components/Modal.tsx
- Focus trap within modal
- Return focus to trigger element on close
- Tab cycles through focusable elements
- Escape key closes modal
```

#### 2. Screen Reader Support

**ARIA Live Regions:**
```typescript
// components/LiveRegion.tsx
<div ref={politeRef} className="sr-only" aria-live="polite" aria-atomic="true" />
<div ref={assertiveRef} className="sr-only" aria-live="assertive" aria-atomic="true" />

// utils/announce.ts
export function announce(message: string, priority: Priority = 'polite'): void {
  // Dispatches custom event to LiveRegion
  const event = new CustomEvent(ANNOUNCE_EVENT, {
    detail: { message, priority }
  });
  window.dispatchEvent(event);
}
```

**Announcement Examples:**
```typescript
// App.tsx
announce(`${data.total} results found, page ${data.page} of ${data.totalPages}`);
announce('Added to favorites');
announce('Error: Failed to fetch results', 'assertive');

// SettingsPage.tsx
announce(`Switched to ${getThemeDisplayName(theme)} theme`);
```

**User Preference:**
```typescript
// SettingsPage.tsx
- Toggle to enable/disable screen reader announcements
- Stored in localStorage
- Checked before each announcement
```

**Semantic HTML:**
```tsx
<nav aria-label="Filters">...</nav>
<main id="main-content">...</main>
<nav aria-label="You are here">...</nav>
<div role="status" aria-live="polite">...</div>
<div role="alert">...</div>
```

**ARIA Labels:**
```tsx
<button aria-label="Clear all favorites">...</button>
<button aria-expanded={isExpanded} aria-controls={`details-${id}`}>...</button>
<input aria-describedby="search-help" />
<p id="search-help" className="sr-only">...</p>
```

#### 3. Visual Design

**Focus Indicators:**
```css
/* index.css */
*:focus-visible {
  outline: 2px solid rgb(var(--color-focus));
  outline-offset: 2px;
}
```

**Color Contrast:**
```
- All text meets WCAG AA (4.5:1 minimum)
- High contrast theme available (21:1)
- Multiple theme options for user preference
```

**Touch Targets:**
```css
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 0.5rem 1rem;
}

.form-checkbox {
  min-width: 24px;
  min-height: 24px;
}
```

**Level Badges (Color + Shape):**
```tsx
// CriterionCard.tsx
const levelShape = criterion.level === 'A' ? '●'      // Circle
  : criterion.level === 'AA' ? '■'                     // Square
  : criterion.level === 'AAA' ? '▲'                    // Triangle
  : '';

<span className={levelClass}>
  <span className="mr-1">{levelShape}</span>
  {criterion.level}
</span>
```

#### 4. Motion & Animation

**Prefers Reduced Motion:**
```css
/* index.css */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### 5. Form Accessibility

**Labels:**
```tsx
<label htmlFor="search" className="sr-only">Search criteria</label>
<input id="search" type="search" ... />

<label htmlFor="guideline-search" className="form-label">
  Search Guidelines
</label>
<input id="guideline-search" ... />
```

**Fieldsets & Legends:**
```tsx
<fieldset className="space-y-2">
  <legend className="form-label">Version</legend>
  <div className="flex gap-4">
    <label>
      <input type="checkbox" ... />
      <span>WCAG 2.2</span>
    </label>
  </div>
</fieldset>
```

**Validation & Error States:**
```tsx
if (error) {
  return (
    <div className="card border-red-300" role="alert">
      <h2 className="text-red-800">Error</h2>
      <p className="text-red-700">{error}</p>
    </div>
  );
}
```

#### 6. Loading States

**Delayed Loading Indicator:**
```typescript
// App.tsx
const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

useEffect(() => {
  let timeoutId: NodeJS.Timeout | null = null;

  if (isLoading) {
    // Only show after 500ms to avoid flashing
    timeoutId = setTimeout(() => {
      setShowLoadingIndicator(true);
    }, 500);
  } else {
    setShowLoadingIndicator(false);
  }

  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
}, [isLoading]);
```

**Status Messages:**
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

---

## Build & Deployment Architecture

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});
```

### Build Output

```
dist/
├── assets/
│   ├── index-DB6FMB8s.css          # Bundled CSS
│   ├── index-lPmk4ipb.js           # App bundle
│   └── react-vendor-nf7bT_Uh.js   # React vendor chunk
└── index.html                       # Entry HTML
```

### Scripts

```json
{
  "scripts": {
    "dev": "vite",                   // Dev server on :5173
    "build": "tsc && vite build",    // Type check + build
    "preview": "vite preview"        // Preview production build
  }
}
```

---

## Performance Optimizations

### 1. Code Splitting

```typescript
// Manual vendor chunking
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
}
```

### 2. Debounced Search

```typescript
const debouncedSearch = useCallback(
  debounce((query: string) => {
    setFilters(prev => ({ ...prev, q: query || undefined, page: 1 }));
  }, 300),
  []
);
```

### 3. Lazy Loading (Not Implemented)

Could add:
```typescript
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
```

### 4. Memoization (Minimal)

Could improve with:
```typescript
const selectedTags = useMemo(() => getSelectedTags(), [filters.tag_ids]);
```

### 5. Pagination

```typescript
// Default: 25 items per page
{ page: 1, pageSize: 25 }
```

---

## Future Architecture Considerations

### Potential Improvements

1. **Custom Hooks Extraction**
   - `useURLState()` - URL state management
   - `useFavorites()` - Favorites management
   - `useTheme()` - Theme management
   - `useLocalStorage()` - Generic localStorage hook

2. **Error Boundary Component**
   - React Error Boundary for component errors
   - Fallback UI for crashes

3. **Virtual Scrolling**
   - For large result sets (500+ items)
   - React Virtualized or Tanstack Virtual

4. **Service Worker**
   - Offline support
   - Cache API responses

5. **Testing Architecture**
   - Unit tests (Vitest)
   - Component tests (React Testing Library)
   - E2E tests (Playwright)

6. **Performance Monitoring**
   - Web Vitals tracking
   - Performance observers

7. **Advanced Filtering**
   - Tag intersection logic refinement
   - Advanced query builder UI

---

## Conclusion

WCAG Explorer follows a **component-based architecture** with **unidirectional data flow**, **URL-driven state**, and **localStorage persistence**. The codebase emphasizes **accessibility**, **progressive enhancement**, and **clean separation of concerns**.

**Key Architectural Principles:**
- ✅ Component isolation (presentational vs. container)
- ✅ Type safety (TypeScript)
- ✅ URL as source of truth for filters
- ✅ localStorage for user preferences
- ✅ Accessibility-first design
- ✅ Theme system with CSS custom properties
- ✅ Semantic HTML with ARIA enhancements
- ✅ Debouncing for performance
- ✅ Error handling at API boundary
- ✅ Screen reader announcements

**Technologies:**
- React 18 + TypeScript 5
- Vite 5 (build tool)
- Tailwind CSS 3 (utility-first CSS)
- React Router 7 (client-side routing)
- Font Awesome 7 (icons)
- DOMPurify + Marked (safe HTML rendering)

---

*Last Updated: 2025-10-18*
*Version: 1.0.0*

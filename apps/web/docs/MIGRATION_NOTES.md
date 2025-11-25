# WCAG Explorer - Migration Notes & Breaking Changes

> Comprehensive guide for migrating code after recent refactors, architectural changes, and breaking API updates.

**Last Updated:** 2025-10-18
**Version:** 1.0.0 → 2.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Breaking Changes](#breaking-changes)
3. [File Renames & Moves](#file-renames--moves)
4. [Import Path Changes](#import-path-changes)
5. [API Changes](#api-changes)
6. [Configuration Changes](#configuration-changes)
7. [Manual Migration Steps](#manual-migration-steps)
8. [Before/After Examples](#beforeafter-examples)
9. [Migration Scripts](#migration-scripts)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What Changed?

This migration guide covers the transition from WCAG Explorer v1.x to v2.0, including:

- TypeScript path aliases (`@/*` imports)
- Custom hooks extraction from App.tsx
- Deprecated single-tag API (`tag_id` → `tag_ids`)
- localStorage abstraction layer
- Component reorganization
- Build configuration updates

### Migration Timeline

- **Preparation Phase**: Review this document and test in development
- **Migration Phase**: Follow manual steps in order
- **Validation Phase**: Run tests, verify functionality
- **Deployment Phase**: Deploy to staging, then production

### Risk Level

- **Low Risk**: Import path changes (automatic via codemod)
- **Medium Risk**: API changes (requires testing)
- **High Risk**: Component refactors (may affect behavior)

---

## Breaking Changes

### 1. Single Tag API Deprecated (tag_id → tag_ids)

**Status**: Deprecated in v1.5, will be removed in v2.0

**Impact**: Any code using `tag_id` in QueryFilters

**Location**: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/types.ts`

**Before:**
```typescript
// types.ts (v1.x)
export interface QueryFilters {
  tag_id?: number; // Single tag
}

// App.tsx (v1.x)
setFilters({ tag_id: 5 });
```

**After:**
```typescript
// types.ts (v2.x)
export interface QueryFilters {
  tag_ids?: number[]; // Multiple tags
  tag_id?: number; // @deprecated - Use tag_ids instead
}

// App.tsx (v2.x)
setFilters({ tag_ids: [5] });
```

**Migration Steps:**

1. Find all instances of `tag_id`:
   ```bash
   grep -r "tag_id" src/ --exclude-dir=node_modules
   ```

2. Replace with `tag_ids` array:
   ```bash
   # Use provided migration script
   bun run migrate:tag-ids
   ```

3. Update URL parsing logic in `urlUtils.ts` (already done if on v1.5+)

**API Compatibility:**

The backend still accepts both `tag_id` (single) and `tag_ids` (array), but `tag_id` will be removed in API v3.

### 2. Direct localStorage Access Deprecated

**Status**: Deprecated in v2.0, will be removed in v2.5

**Impact**: Components directly using `localStorage.getItem/setItem`

**Before:**
```typescript
// Any component
const theme = localStorage.getItem('wcag-explorer-theme');
localStorage.setItem('wcag-explorer-theme', 'dark');
```

**After:**
```typescript
// Use custom hook
import { useLocalStorage } from '@/hooks/useLocalStorage';

const [theme, setTheme] = useLocalStorage('wcag-explorer-theme', 'system');
```

**Migration Steps:**

1. Import the new hook:
   ```typescript
   import { useLocalStorage } from '@/hooks/useLocalStorage';
   ```

2. Replace direct access:
   ```typescript
   // Before
   const [value, setValue] = useState(() => {
     const stored = localStorage.getItem('key');
     return stored ? JSON.parse(stored) : defaultValue;
   });

   useEffect(() => {
     localStorage.setItem('key', JSON.stringify(value));
   }, [value]);

   // After
   const [value, setValue] = useLocalStorage('key', defaultValue);
   ```

### 3. Component Props Restructured

**Status**: Changed in v2.0

**Impact**: Components passing favorites and view mode props

**Before:**
```typescript
// App.tsx (v1.x)
<CriterionCard
  criterion={criterion}
  favorites={favorites}
  setFavorites={setFavorites}
  viewMode={viewMode}
/>
```

**After:**
```typescript
// App.tsx (v2.x)
<CriterionCard
  criterion={criterion}
  isFavorite={favorites.has(criterion.id)}
  onToggleFavorite={() => handleToggleFavorite(criterion.id)}
/>
```

**Reason**: Better encapsulation, clearer interface, easier testing

### 4. URL State Management Extracted

**Status**: Refactored in v2.0

**Impact**: Code using `parseURL`, `buildURL`, or `mergeWithDefaults`

**Before:**
```typescript
// App.tsx (v1.x) - Inline URL handling
const urlFilters = { /* manual parsing */ };
setFilters(urlFilters);
```

**After:**
```typescript
// App.tsx (v2.x) - Use custom hook
import { useURLState } from '@/hooks/useURLState';

const { filters, setFilters } = useURLState();
```

**Files Changed:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/urlUtils.ts` (no changes)
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/hooks/useURLState.ts` (new file)

---

## File Renames & Moves

### Component Reorganization

| Old Path | New Path | Reason |
|----------|----------|--------|
| `src/components/CriterionCard.tsx` | (unchanged) | - |
| `src/components/Filters.tsx` | (unchanged) | - |

**Note**: No files were renamed in v1.5-2.0 transition. Future refactors may organize components into subdirectories.

### Future Reorganization (Planned for v2.5)

Proposed structure:
```
src/
├── components/
│   ├── criterion/
│   │   ├── CriterionCard.tsx
│   │   ├── CriterionList.tsx
│   │   ├── CriterionGrid.tsx
│   │   └── CriterionDetails.tsx
│   ├── filters/
│   │   ├── Filters.tsx
│   │   ├── SelectedTagsPane.tsx
│   │   └── FilterPresets.tsx
│   ├── ui/
│   │   ├── Modal.tsx
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
```

---

## Import Path Changes

### Phase 1: TypeScript Path Aliases (v2.0)

**Configuration Added:**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/pages/*": ["src/pages/*"],
      "@/utils/*": ["src/utils/*"]
    }
  }
}
```

`vite.config.ts`:
```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Import Path Mapping

| Old Import (Relative) | New Import (Alias) | Status |
|-----------------------|-------------------|--------|
| `import Filters from './components/Filters'` | `import Filters from '@/components/Filters'` | Recommended |
| `import { getCriteria } from './lib/api'` | `import { getCriteria } from '@/lib/api'` | Recommended |
| `import type { Criterion } from './lib/types'` | `import type { Criterion } from '@/lib/types'` | Recommended |
| `import { announce } from '../utils/announce'` | `import { announce } from '@/utils/announce'` | Recommended |

### Migration Strategy

**Option 1: Gradual Migration (Recommended)**

Both relative and alias imports work. Migrate files as you touch them.

```typescript
// This still works:
import Filters from './components/Filters';

// But prefer this:
import Filters from '@/components/Filters';
```

**Option 2: Bulk Migration (Advanced)**

Use the provided codemod:
```bash
bun run migrate:imports
```

**Manual Find/Replace:**

For VSCode:
1. Open Find & Replace (Cmd+Shift+H)
2. Enable regex mode
3. Find: `from ['"](\.\.?/)+`
4. Replace: `from '@/`
5. Review each change carefully

**Example Transformations:**

```typescript
// Before
import { getCriteria } from '../../lib/api';
import type { Criterion } from '../../lib/types';
import CriterionCard from '../components/CriterionCard';

// After
import { getCriteria } from '@/lib/api';
import type { Criterion } from '@/lib/types';
import CriterionCard from '@/components/CriterionCard';
```

---

## API Changes

### 1. getCriteria() Function Signature

**Status**: Enhanced in v2.0 (backward compatible)

**File**: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/api.ts`

**Before (v1.x):**
```typescript
export async function getCriteria(filters: QueryFilters): Promise<PaginatedResult<Criterion>> {
  // tag_id only
}
```

**After (v2.x):**
```typescript
export async function getCriteria(filters: QueryFilters): Promise<PaginatedResult<Criterion>> {
  // Supports both tag_id (legacy) and tag_ids (new)
}
```

**URL Parameter Mapping:**

| Filter Key | URL Parameter | Example |
|------------|---------------|---------|
| `q` | `?q=text` | `?q=alternative` |
| `principle` | `?principle=p1&principle=p2` | `?principle=Perceivable` |
| `level` | `?level=A&level=AA` | `?level=A&level=AA` |
| `version` | `?version=2.2` | `?version=2.2` |
| `guideline_id` | `?guideline_id=1.1` | `?guideline_id=1.1` |
| `tag_id` | `?tag_id=5` | `?tag_id=5` (deprecated) |
| `tag_ids` | `?tag_ids=1&tag_ids=2` | `?tag_ids=1&tag_ids=2` (new) |
| `page` | `?page=1` | `?page=2` |
| `pageSize` | `?pageSize=25` | `?pageSize=50` |

**Migration Example:**

```typescript
// Before (v1.x) - Single tag
const filters: QueryFilters = {
  tag_id: 5,
  page: 1,
};
const results = await getCriteria(filters);

// After (v2.x) - Multiple tags
const filters: QueryFilters = {
  tag_ids: [5, 12, 8],
  page: 1,
};
const results = await getCriteria(filters);
```

### 2. Admin API Authentication

**Status**: No change in v2.0, documented here for reference

**File**: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/admin-api.ts`

**Authentication Required:**

```typescript
// All admin endpoints require Bearer token
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${password}`,
};
```

**Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/admin/metadata/criteria/:id/:type` | Add metadata to criterion |
| DELETE | `/admin/metadata/criteria/:id/:type/:itemId` | Remove metadata |
| PUT | `/admin/metadata/criteria/:id/rank` | Update rank order |
| PUT | `/admin/metadata/criteria/:id/review` | Mark as reviewed |

### 3. Response Type Changes

**Status**: Enhanced in v2.0 (backward compatible)

**Criterion Type Extended:**

```typescript
// v1.x
export interface Criterion {
  id: string;
  num: string;
  title: string;
  // ... basic fields
}

// v2.x - Added metadata fields
export interface Criterion {
  id: string;
  num: string;
  title: string;
  // ... basic fields
  affected_users?: AffectedUserWithScore[];  // NEW
  assignees?: AssigneeWithScore[];           // NEW
  technologies?: TechnologyWithScore[];      // NEW
  tags?: TagWithScore[];                     // NEW
}
```

**Migration**: No changes needed, fields are optional.

---

## Configuration Changes

### 1. Vite Configuration

**File**: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/vite.config.ts`

**Before (v1.x):**
```typescript
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
});
```

**After (v2.x):**
```typescript
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
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

**Changes:**
- Added `resolve.alias` for `@` imports
- Added `build.rollupOptions` for code splitting

### 2. TypeScript Configuration

**File**: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/tsconfig.json`

**Before (v1.x):**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

**After (v2.x):**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/pages/*": ["src/pages/*"],
      "@/utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"]
}
```

**Changes:**
- Added `baseUrl` and `paths` for path aliases

### 3. Package.json Scripts

**File**: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/package.json`

**New Scripts (v2.x):**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",          // NEW
    "lint": "eslint src --ext .ts,.tsx",   // NEW
    "lint:fix": "eslint src --fix",        // NEW
    "format": "prettier --write src",      // NEW
    "test": "vitest",                      // NEW (planned)
    "test:watch": "vitest --watch"         // NEW (planned)
  }
}
```

---

## Manual Migration Steps

### Step 1: Update Dependencies

```bash
cd /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web

# Update all dependencies to latest compatible versions
bun install

# Or if using npm
npm install
```

### Step 2: Update TypeScript Configuration

1. Open `tsconfig.json`
2. Add path aliases configuration (see [Configuration Changes](#2-typescript-configuration))
3. Save file

### Step 3: Update Vite Configuration

1. Open `vite.config.ts`
2. Add resolve.alias configuration (see [Configuration Changes](#1-vite-configuration))
3. Import `path` module at top:
   ```typescript
   import path from 'path';
   ```
4. Save file

### Step 4: Migrate tag_id to tag_ids

**Option A: Manual Migration**

1. Search for all uses of `tag_id`:
   ```bash
   grep -rn "tag_id" src/
   ```

2. For each occurrence, replace:
   ```typescript
   // Before
   const filters = { tag_id: 5 };

   // After
   const filters = { tag_ids: [5] };
   ```

3. Update URL parsing in `urlUtils.ts` (if not already done)

**Option B: Automated Migration**

Run the provided script:
```bash
bun run scripts/migrate-tag-ids.ts
```

### Step 5: Extract Custom Hooks (Optional but Recommended)

**5.1: Create hooks directory**
```bash
mkdir -p src/hooks
```

**5.2: Extract useLocalStorage hook**

Create `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/hooks/useLocalStorage.ts`:
```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
```

**5.3: Update components to use the hook**

```typescript
// Before
const [theme, setTheme] = useState(() => {
  const stored = localStorage.getItem('wcag-explorer-theme');
  return stored || 'system';
});

useEffect(() => {
  localStorage.setItem('wcag-explorer-theme', theme);
}, [theme]);

// After
import { useLocalStorage } from '@/hooks/useLocalStorage';

const [theme, setTheme] = useLocalStorage('wcag-explorer-theme', 'system');
```

### Step 6: Update Import Paths (Optional)

**Option A: Gradual (Recommended)**

Update imports as you work on files. Both styles work simultaneously.

**Option B: Bulk Update**

Use find/replace or run the codemod:
```bash
# Coming soon
bun run scripts/migrate-imports.ts
```

### Step 7: Verify Build

```bash
# Type check
bun run type-check

# Build
bun run build

# Preview build
bun run preview
```

### Step 8: Test Functionality

1. Start dev server: `bun run dev`
2. Test critical paths:
   - Search functionality
   - Filter by principle, level, version
   - Tag filtering (single and multiple)
   - Favorites add/remove
   - View mode switching
   - Theme switching
   - URL sharing (copy link, refresh page)
   - Keyboard shortcuts (/, f, Esc)

---

## Before/After Examples

### Example 1: Component with Relative Imports

**Before (v1.x):**
```typescript
// src/components/CriterionCard.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import type { Criterion } from '../lib/types';
import { getIconForEmoji } from '../lib/iconMapper';
import { truncateText } from '../lib/textUtils';
import StarButton from './StarButton';
import ShareButton from './ShareButton';
import CriterionDetails from './CriterionDetails';

interface CriterionCardProps {
  criterion: Criterion;
  favorites: Set<string>;
  setFavorites: (favorites: Set<string>) => void;
}

export default function CriterionCard({
  criterion,
  favorites,
  setFavorites,
}: CriterionCardProps) {
  const isFavorite = favorites.has(criterion.id);

  const handleToggleFavorite = () => {
    const newFavorites = new Set(favorites);
    if (isFavorite) {
      newFavorites.delete(criterion.id);
    } else {
      newFavorites.add(criterion.id);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="card">
      <StarButton isFavorite={isFavorite} onClick={handleToggleFavorite} />
      {/* ... rest of component */}
    </div>
  );
}
```

**After (v2.x):**
```typescript
// src/components/CriterionCard.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import type { Criterion } from '@/lib/types';
import { getIconForEmoji } from '@/lib/iconMapper';
import { truncateText } from '@/lib/textUtils';
import StarButton from '@/components/StarButton';
import ShareButton from '@/components/ShareButton';
import CriterionDetails from '@/components/CriterionDetails';

interface CriterionCardProps {
  criterion: Criterion;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function CriterionCard({
  criterion,
  isFavorite,
  onToggleFavorite,
}: CriterionCardProps) {
  return (
    <div className="card">
      <StarButton isFavorite={isFavorite} onClick={onToggleFavorite} />
      {/* ... rest of component */}
    </div>
  );
}
```

**Changes:**
1. Relative imports → Alias imports
2. Simplified props (removed favorites/setFavorites, added isFavorite/onToggleFavorite)
3. Removed toggle logic (now handled in parent)

### Example 2: Filter State Management

**Before (v1.x):**
```typescript
// src/App.tsx
const [filters, setFilters] = useState<QueryFilters>(() => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    q: urlParams.get('q') || undefined,
    tag_id: urlParams.get('tag_id') ? parseInt(urlParams.get('tag_id')!) : undefined,
    page: 1,
  };
});

useEffect(() => {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.tag_id) params.set('tag_id', String(filters.tag_id));
  window.history.pushState({}, '', `?${params.toString()}`);
}, [filters]);
```

**After (v2.x):**
```typescript
// src/App.tsx
import { parseURL, buildURL, mergeWithDefaults } from '@/lib/urlUtils';

const [filters, setFilters] = useState<QueryFilters>(() => {
  const urlFilters = parseURL(window.location.pathname, window.location.search);
  return mergeWithDefaults(urlFilters);
});

useEffect(() => {
  if (isUpdatingFromURL.current) {
    isUpdatingFromURL.current = false;
    return;
  }

  const newURL = buildURL(filters, window.location.hash);
  window.history.pushState({}, '', newURL);
}, [filters]);
```

**Changes:**
1. Used centralized URL utilities
2. Support for path-based filters (not just query params)
3. Added loop prevention with ref
4. Supports multiple tags via `tag_ids`

### Example 3: API Call with Tag Filtering

**Before (v1.x):**
```typescript
// Filtering by single tag
const fetchCriteria = async () => {
  const filters: QueryFilters = {
    q: searchQuery,
    tag_id: selectedTagId,
    page: 1,
    pageSize: 25,
  };

  try {
    const results = await getCriteria(filters);
    setResults(results);
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
};
```

**After (v2.x):**
```typescript
// Filtering by multiple tags
const fetchCriteria = async () => {
  const filters: QueryFilters = {
    q: searchQuery,
    tag_ids: selectedTagIds, // Array of tag IDs
    page: 1,
    pageSize: 25,
  };

  try {
    const results = await getCriteria(filters);
    setResults(results);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch results';
    setError(errorMsg);
    announce(`Error: ${errorMsg}`, 'assertive');
  }
};
```

**Changes:**
1. `tag_id` (single) → `tag_ids` (array)
2. Better error handling
3. Screen reader announcement

### Example 4: localStorage Usage

**Before (v1.x):**
```typescript
// src/lib/themes.ts
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

// src/components/ThemeSelector.tsx
import { getTheme, setTheme, applyTheme } from '../lib/themes';

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getTheme());

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    setTheme(theme);
    applyTheme(theme);
  };

  // ...
}
```

**After (v2.x):**
```typescript
// src/hooks/useTheme.ts
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { applyTheme, type Theme } from '@/lib/themes';
import { useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('wcag-explorer-theme', 'system');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return { theme, setTheme };
}

// src/components/ThemeSelector.tsx
import { useTheme } from '@/hooks/useTheme';
import { announce } from '@/utils/announce';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    announce(`Switched to ${newTheme} theme`);
  };

  // ...
}
```

**Changes:**
1. Extracted to custom hook with localStorage abstraction
2. Automatic theme application via useEffect
3. Cleaner component code
4. Better error handling (in useLocalStorage hook)

---

## Migration Scripts

### Script 1: Migrate tag_id to tag_ids

Create `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/scripts/migrate-tag-ids.ts`:

```typescript
import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

async function migrateTagIds() {
  const files = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });

  for (const file of files) {
    let content = await readFile(file, 'utf-8');
    let modified = false;

    // Replace tag_id: number with tag_ids: [number]
    const tagIdAssignmentRegex = /tag_id:\s*(\d+)/g;
    if (tagIdAssignmentRegex.test(content)) {
      content = content.replace(tagIdAssignmentRegex, 'tag_ids: [$1]');
      modified = true;
    }

    // Replace filters.tag_id with filters.tag_ids
    const tagIdAccessRegex = /filters\.tag_id(?!\w)/g;
    if (tagIdAccessRegex.test(content)) {
      content = content.replace(tagIdAccessRegex, 'filters.tag_ids');
      modified = true;
    }

    if (modified) {
      await writeFile(file, content, 'utf-8');
      console.log(`✓ Migrated: ${file}`);
    }
  }

  console.log('\n✅ Migration complete!');
}

migrateTagIds().catch(console.error);
```

**Usage:**
```bash
bun run scripts/migrate-tag-ids.ts
```

### Script 2: Update Import Paths (Coming Soon)

Create `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/scripts/migrate-imports.ts`:

```typescript
import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';

async function migrateImports() {
  const files = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });

  for (const file of files) {
    let content = await readFile(file, 'utf-8');
    let modified = false;

    // Replace relative imports with alias imports
    const importRegex = /from ['"](\.\.\?\/[^'"]+)['"]/g;
    const matches = content.matchAll(importRegex);

    for (const match of matches) {
      const relativePath = match[1];
      const absolutePath = path.resolve(path.dirname(file), relativePath);
      const srcPath = absolutePath.replace(/.*\/src\//, '');
      const aliasPath = `@/${srcPath}`;

      content = content.replace(match[0], `from '${aliasPath}'`);
      modified = true;
    }

    if (modified) {
      await writeFile(file, content, 'utf-8');
      console.log(`✓ Updated: ${file}`);
    }
  }

  console.log('\n✅ Import migration complete!');
}

migrateImports().catch(console.error);
```

**Usage:**
```bash
bun run scripts/migrate-imports.ts
```

### Script 3: Validate Migration

Create `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/scripts/validate-migration.ts`:

```typescript
import { readFile } from 'fs/promises';
import { glob } from 'glob';

async function validateMigration() {
  const files = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  const issues: string[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');

    // Check for deprecated tag_id usage
    if (/filters\.tag_id\s*=/.test(content) && !content.includes('@deprecated')) {
      issues.push(`${file}: Uses deprecated tag_id`);
    }

    // Check for direct localStorage access
    if (/localStorage\.(get|set)Item/.test(content) && !file.includes('/lib/') && !file.includes('/hooks/')) {
      issues.push(`${file}: Direct localStorage access (should use hook)`);
    }

    // Check for console.log in production code
    if (/console\.log/.test(content) && !file.includes('test')) {
      issues.push(`${file}: Contains console.log`);
    }
  }

  if (issues.length > 0) {
    console.log('⚠️  Migration issues found:\n');
    issues.forEach(issue => console.log(`  - ${issue}`));
    process.exit(1);
  } else {
    console.log('✅ Migration validated successfully!');
  }
}

validateMigration().catch(console.error);
```

**Usage:**
```bash
bun run scripts/validate-migration.ts
```

---

## Troubleshooting

### Issue 1: TypeScript Can't Resolve @ Imports

**Symptoms:**
```
Cannot find module '@/lib/types' or its corresponding type declarations
```

**Solution:**

1. Verify `tsconfig.json` has path aliases:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```

2. Verify `vite.config.ts` has resolve alias:
   ```typescript
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   }
   ```

3. Restart TypeScript server in VSCode: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

4. Restart Vite dev server

### Issue 2: Build Fails After Migration

**Symptoms:**
```
Error: Could not resolve '@/components/Filters'
```

**Solution:**

1. Check `vite.config.ts` includes `resolve.alias`
2. Make sure `path` is imported: `import path from 'path'`
3. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   bun run build
   ```

### Issue 3: Tag Filtering Not Working

**Symptoms:**
- Single tag works, multiple tags don't
- URL shows `tag_id` instead of `tag_ids`

**Solution:**

1. Verify API client supports `tag_ids`:
   ```typescript
   // lib/api.ts
   filters.tag_ids?.forEach(id => params.append('tag_ids', String(id)));
   ```

2. Verify URL utils build tag_ids correctly:
   ```typescript
   // lib/urlUtils.ts
   if (filters.tag_ids && filters.tag_ids.length > 0) {
     segments.push(`tags:${filters.tag_ids.join('+')}`);
   }
   ```

3. Check backend API supports `tag_ids` parameter

### Issue 4: localStorage Errors in Tests

**Symptoms:**
```
ReferenceError: localStorage is not defined
```

**Solution:**

Create test setup file:

```typescript
// src/test-setup.ts
import { vi } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;
```

Update `vite.config.ts`:
```typescript
test: {
  setupFiles: ['./src/test-setup.ts'],
}
```

### Issue 5: Favorites Not Persisting

**Symptoms:**
- Favorites reset on page refresh
- localStorage shows old format

**Solution:**

1. Clear localStorage:
   ```javascript
   // In browser console
   localStorage.clear();
   ```

2. Verify favorites.ts uses correct storage key:
   ```typescript
   const FAVORITES_KEY = 'wcag-explorer-favorites';
   ```

3. Check that favorites are saved as JSON array:
   ```typescript
   localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
   ```

### Issue 6: Import Errors After Path Migration

**Symptoms:**
```
Module not found: Error: Can't resolve '@/lib/types'
```

**Solution:**

1. Verify file exists at expected path:
   ```bash
   ls /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/types.ts
   ```

2. Check import statement doesn't include file extension:
   ```typescript
   // Wrong
   import type { Criterion } from '@/lib/types.ts';

   // Correct
   import type { Criterion } from '@/lib/types';
   ```

3. Restart dev server

---

## Rollback Procedure

If migration causes critical issues:

### Step 1: Revert Git Changes

```bash
git stash
# Or
git reset --hard HEAD
```

### Step 2: Restore Package Lock

```bash
git checkout package-lock.json
npm install
```

### Step 3: Restore Configuration Files

```bash
git checkout tsconfig.json vite.config.ts
```

### Step 4: Clear Cache

```bash
rm -rf node_modules/.vite
rm -rf dist
```

### Step 5: Rebuild

```bash
npm install
npm run build
```

---

## Support & Resources

- **Architecture Documentation**: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/docs/ARCHITECTURE.md`
- **TODO & Tech Debt**: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/docs/TODO.md`
- **Refactor Plan**: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/docs/REFACTOR_PLAN.md`
- **Issue Tracker**: [GitHub Issues](https://github.com/your-org/wcag-explorer/issues)

---

## Changelog

### v2.0.0 (2025-10-18)

- Added TypeScript path aliases (`@/*`)
- Deprecated `tag_id` in favor of `tag_ids`
- Enhanced error handling and logging
- Improved component props interfaces
- Added migration scripts and documentation

### v1.5.0 (2025-10-17)

- Added multi-tag filtering support
- URL routing refactor
- Favorites persistence improvements
- Theme system enhancements

### v1.0.0 (2025-10-15)

- Initial release
- React 18 + TypeScript
- Basic WCAG criteria explorer

---

*Last Updated: 2025-10-18*
*Maintained by: WCAG Explorer Team*

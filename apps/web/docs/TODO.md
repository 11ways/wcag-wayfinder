# WCAG Explorer - Technical Debt & Enhancement Ledger

> Actionable inventory of outstanding issues, technical debt, and future enhancements organized by category and priority.

**Last Updated:** 2025-10-18
**Current Version:** 1.0.0

---

## Priority Levels

- **P0** (Critical): Blocking issues, security vulnerabilities, or broken functionality
- **P1** (High): Important improvements that significantly impact UX, performance, or maintainability
- **P2** (Medium): Nice-to-have improvements, optimizations, or refactoring

---

## Testing

### P0: Critical Testing Issues

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| TEST-001 | **Zero test coverage** - No test infrastructure exists | DevOps | Week 1-2 | Open |
| TEST-002 | **No test setup files** - Missing test configuration for Vitest/Bun | DevOps | Week 1 | Open |
| TEST-003 | **No component tests** - No React Testing Library setup | Frontend | Week 2-3 | Open |

**Details:**

**TEST-001: No test infrastructure**
- **Impact**: Cannot verify functionality, high regression risk
- **Action Items**:
  1. Install test dependencies: `bun add -d @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom`
  2. Create `src/test-setup.ts` with global test configuration
  3. Update `vite.config.ts` to include test configuration
  4. Add test scripts to `package.json`
- **Acceptance Criteria**: Can run `bun test` successfully

**TEST-002: Test configuration missing**
```typescript
// vite.config.ts - Add this:
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test-setup.ts',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: ['node_modules/', 'src/test-setup.ts'],
  },
}
```

**TEST-003: Component test examples needed**
- Priority components to test first:
  - `CriterionCard.tsx` - Most complex component
  - `Filters.tsx` - Core functionality
  - `Pagination.tsx` - Edge cases
  - `Modal.tsx` - Accessibility features

### P1: High-Priority Testing

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| TEST-101 | **Unit tests for utility functions** - lib/urlUtils.ts, lib/textUtils.ts, lib/debounce.ts | Frontend | Week 3 | Open |
| TEST-102 | **Integration tests for API client** - Mock fetch responses in lib/api.ts | Frontend | Week 3 | Open |
| TEST-103 | **Accessibility tests** - Automated a11y testing with axe-core | Frontend | Week 4 | Open |
| TEST-104 | **E2E tests** - Critical user flows with Playwright | QA | Week 5-6 | Open |

**Details:**

**TEST-101: Utility function tests**
- Files requiring tests:
  - `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/urlUtils.ts` - parseURL, buildURL, mergeWithDefaults
  - `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/textUtils.ts` - truncateText, stripHtml
  - `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/debounce.ts` - debounce function

**TEST-103: Accessibility tests**
```bash
bun add -d @axe-core/react vitest-axe
```

**TEST-104: E2E test scenarios**
1. Search and filter criteria
2. Add/remove favorites
3. Change view modes (card/list/grid)
4. Navigate with keyboard shortcuts
5. Theme switching
6. URL state persistence

### P2: Medium-Priority Testing

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| TEST-201 | **Visual regression tests** - Chromatic or Percy integration | QA | Week 7 | Open |
| TEST-202 | **Performance tests** - Lighthouse CI in GitHub Actions | DevOps | Week 8 | Open |
| TEST-203 | **Cross-browser tests** - BrowserStack integration | QA | Week 9 | Open |

---

## Performance

### P0: Critical Performance Issues

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| PERF-001 | **No code splitting** - All routes bundled in single chunk | Frontend | Week 2 | Open |
| PERF-002 | **Large component bundle** - App.tsx is 694+ lines, blocks parsing | Frontend | Week 1-2 | Open |

**Details:**

**PERF-001: Implement lazy loading**
```typescript
// main.tsx - Migrate to lazy-loaded routes
import { lazy, Suspense } from 'react';

const App = lazy(() => import('./App'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Wrap routes in Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/admin" element={<AdminPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<App />} />
  </Routes>
</Suspense>
```

**PERF-002: Split App.tsx into smaller components**
- Extract filter logic to custom hook: `useFilters()`
- Extract favorites logic to custom hook: `useFavorites()`
- Extract URL sync logic to custom hook: `useURLState()`
- Move keyboard shortcuts to separate hook: `useKeyboardShortcuts()`
- Target: <300 lines per file

### P1: High-Priority Performance

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| PERF-101 | **No memoization** - Components re-render unnecessarily | Frontend | Week 3 | Open |
| PERF-102 | **Console.log statements in production** - 14 instances found | Frontend | Week 1 | Open |
| PERF-103 | **No bundle analysis** - Unknown largest dependencies | DevOps | Week 2 | Open |
| PERF-104 | **Font Awesome full bundle** - Using entire icon library | Frontend | Week 3 | Open |
| PERF-105 | **Marked + DOMPurify on main thread** - Blocking markdown parsing | Frontend | Week 4 | Open |

**Details:**

**PERF-101: Add memoization**
```typescript
// CriterionCard.tsx - Add memoization
const CriterionCard = React.memo(({ criterion, isFavorite, onToggleFavorite }) => {
  // Component logic
}, (prevProps, nextProps) => {
  return prevProps.criterion.id === nextProps.criterion.id &&
         prevProps.isFavorite === nextProps.isFavorite;
});

// App.tsx - Memoize expensive computations
const filteredResults = useMemo(() => {
  return results.items.filter(/* filter logic */);
}, [results.items, filters]);
```

**PERF-102: Remove console statements**
- Files to clean:
  - `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/filterState.ts` (6 instances)
  - `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/favorites.ts` (3 instances)
  - `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/utils/announce.ts` (2 instances)
  - `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/components/ShareButton.tsx` (1 instance)
  - `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/components/CriterionDetails.tsx` (1 instance)
  - `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/components/Filters.tsx` (1 instance)
- Replace with proper error logging service (Sentry, LogRocket)

**PERF-103: Bundle analysis**
```bash
bun add -d rollup-plugin-visualizer
```
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  visualizer({ open: true, filename: 'dist/stats.html' })
]
```

**PERF-104: Tree-shake Font Awesome icons**
- Current: Importing entire `free-solid-svg-icons` package
- Solution: Import only used icons individually
- Estimated savings: ~200KB

**PERF-105: Move markdown to Web Worker**
- Files affected: `CriterionDetails.tsx`, `HelpModal.tsx`, `Filters.tsx`
- Create `workers/markdown.worker.ts` for off-main-thread parsing

### P2: Medium-Priority Performance

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| PERF-201 | **No service worker** - No offline support or caching | Frontend | Week 6 | Open |
| PERF-202 | **No image optimization** - Assets not optimized | DevOps | Week 7 | Open |
| PERF-203 | **No virtual scrolling** - Large lists cause jank | Frontend | Week 8 | Open |
| PERF-204 | **Debounce delay too short** - 300ms may cause excessive API calls | Frontend | Week 5 | Open |

**Details:**

**PERF-201: Add service worker**
```bash
bun add -d vite-plugin-pwa
```

**PERF-203: Virtual scrolling for large result sets**
```bash
bun add @tanstack/react-virtual
```
- Apply to `CriterionList.tsx` and `CriterionGrid.tsx`
- Benefits visible when displaying 100+ criteria

**PERF-204: Tune debounce settings**
- Current: 300ms in `App.tsx` line 85
- Recommendation: 500ms for search, 150ms for filters

---

## Architecture

### P0: Critical Architecture Issues

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| ARCH-001 | **Monolithic App.tsx** - 694+ lines with mixed concerns | Frontend | Week 1-3 | Open |
| ARCH-002 | **No error boundaries** - Errors crash entire app | Frontend | Week 1 | Open |
| ARCH-003 | **No TypeScript path aliases** - Relative imports everywhere | DevOps | Week 1 | Open |

**Details:**

**ARCH-001: Split App.tsx**
Extract to:
1. `hooks/useFilters.ts` - Filter state management (80 lines)
2. `hooks/useFavorites.ts` - Favorites logic (30 lines)
3. `hooks/useURLState.ts` - URL synchronization (60 lines)
4. `hooks/useKeyboardShortcuts.ts` - Keyboard handlers (40 lines)
5. `components/AppHeader.tsx` - Header section (50 lines)
6. `components/AppFooter.tsx` - Footer section (30 lines)

**ARCH-002: Add error boundary**
```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="card border-red-300 m-4" role="alert">
          <h2 className="text-xl font-semibold text-red-800">Something went wrong</h2>
          <p className="text-red-700">Please refresh the page to continue.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**ARCH-003: Configure path aliases**
```json
// tsconfig.json
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

```typescript
// vite.config.ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### P1: High-Priority Architecture

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| ARCH-101 | **No custom hooks** - Logic duplicated across components | Frontend | Week 2-3 | Open |
| ARCH-102 | **No barrel exports** - Verbose import statements | Frontend | Week 3 | Open |
| ARCH-103 | **Mixed state management** - No clear pattern for server state | Frontend | Week 4 | Open |
| ARCH-104 | **No request deduplication** - Duplicate API calls possible | Frontend | Week 4 | Open |
| ARCH-105 | **No API response validation** - Runtime type safety missing | Frontend | Week 5 | Open |

**Details:**

**ARCH-101: Extract custom hooks**
Priority hooks to create:
1. `hooks/useFilters.ts` - Filter state + URL sync
2. `hooks/useFavorites.ts` - Favorites with localStorage
3. `hooks/useLocalStorage.ts` - Generic localStorage hook
4. `hooks/useTheme.ts` - Theme management
5. `hooks/useDebounce.ts` - Generic debounce hook
6. `hooks/useKeyboardShortcut.ts` - Keyboard handler registration

**ARCH-102: Create barrel exports**
```typescript
// components/index.ts
export { default as CriterionCard } from './CriterionCard';
export { default as CriterionList } from './CriterionList';
export { default as CriterionGrid } from './CriterionGrid';
export { default as Filters } from './Filters';
export { default as Pagination } from './Pagination';
export { default as Modal } from './Modal';
// ...etc

// Then import as:
// import { CriterionCard, Filters, Pagination } from '@/components';
```

**ARCH-103: Consider React Query/SWR**
```bash
bun add @tanstack/react-query
```
- Benefits: Caching, deduplication, background refetch, optimistic updates
- Migrate `lib/api.ts` to use React Query

**ARCH-105: Add Zod for runtime validation**
```bash
bun add zod
```
```typescript
// lib/schemas.ts
import { z } from 'zod';

export const CriterionSchema = z.object({
  id: z.string(),
  num: z.string(),
  title: z.string(),
  level: z.enum(['A', 'AA', 'AAA', '']),
  // ...
});

// lib/api.ts
export async function getCriteria(filters: QueryFilters) {
  const response = await fetch(/* ... */);
  const data = await response.json();
  return PaginatedResultSchema(CriterionSchema).parse(data);
}
```

### P2: Medium-Priority Architecture

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| ARCH-201 | **No component documentation** - Missing JSDoc/comments | Frontend | Week 6 | Open |
| ARCH-202 | **No Storybook** - Components not isolated/documented | Frontend | Week 7 | Open |
| ARCH-203 | **No design system** - Inconsistent spacing/colors | Design | Week 8 | Open |

---

## Features

### P0: Critical Feature Gaps

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| FEAT-001 | **No error tracking** - Production errors go unnoticed | DevOps | Week 1 | Open |
| FEAT-002 | **No analytics** - Unknown user behavior/metrics | Product | Week 2 | Open |

**Details:**

**FEAT-001: Add error tracking**
```bash
bun add @sentry/react
```
- Set up Sentry project
- Add to `main.tsx` with environment-based DSN
- Track: errors, performance, user sessions

**FEAT-002: Add privacy-friendly analytics**
```bash
bun add @vercel/analytics
# OR
bun add plausible-tracker
```

### P1: High-Priority Features

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| FEAT-101 | **No keyboard shortcut help** - Users don't know about '/' and 'f' shortcuts | Frontend | Week 2 | Open |
| FEAT-102 | **No export functionality** - Can't export filtered results as CSV/JSON | Frontend | Week 3 | Open |
| FEAT-103 | **No saved filter presets** - Can't save common filter combinations | Frontend | Week 4 | Open |
| FEAT-104 | **No criterion comparison view** - Can't compare multiple criteria side-by-side | Frontend | Week 5 | Open |
| FEAT-105 | **tag_ids not implemented in API client** - Multi-tag filtering incomplete | Frontend | Week 2 | Open |

**Details:**

**FEAT-101: Keyboard shortcuts help**
- Add keyboard icon in header that opens modal
- Show all shortcuts: `/` (search), `f` (filters), `Esc` (close modals)
- Persist dismissed state in localStorage

**FEAT-102: Export functionality**
```typescript
// lib/export.ts
export function exportToCSV(criteria: Criterion[], filename: string) {
  const headers = ['ID', 'Title', 'Level', 'Version', 'Principle'];
  const rows = criteria.map(c => [c.id, c.title, c.level, c.version, c.principle]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

**FEAT-105: Implement tag_ids in API client**
```typescript
// lib/api.ts - Line 30-40
// Add this after other array params:
filters.tag_ids?.forEach(id => params.append('tag_ids', String(id)));
```

### P2: Medium-Priority Features

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| FEAT-201 | **No dark mode automatic switching** - System preference changes don't update | Frontend | Week 6 | Open |
| FEAT-202 | **No PWA support** - Can't install as app | DevOps | Week 7 | Open |
| FEAT-203 | **No criterion notes/comments** - Can't add personal annotations | Frontend | Week 8 | Open |
| FEAT-204 | **No print stylesheet** - Printing results poorly formatted | Frontend | Week 9 | Open |

---

## Documentation

### P0: Critical Documentation Gaps

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| DOC-001 | **No API documentation** - Endpoints not documented | Backend | Week 1 | Open |
| DOC-002 | **No onboarding guide** - New developers struggle to start | Lead | Week 1 | Open |

**Details:**

**DOC-001: Document API endpoints**
Create `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/docs/API.md`
- Document all endpoints from `lib/api.ts` and `lib/admin-api.ts`
- Include request/response examples
- Document error responses
- Add rate limiting info (if applicable)

**DOC-002: Create ONBOARDING.md**
Include:
1. Prerequisites (Node/Bun version, API access)
2. Setup steps
3. Running locally
4. Project structure overview
5. Common tasks (adding a component, updating filters, etc.)
6. Where to ask for help

### P1: High-Priority Documentation

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| DOC-101 | **No component prop documentation** - Missing TypeScript JSDoc | Frontend | Week 2-3 | Open |
| DOC-102 | **No deployment guide** - Production deployment not documented | DevOps | Week 3 | Open |
| DOC-103 | **No accessibility guidelines** - A11y best practices not documented | Frontend | Week 4 | Open |
| DOC-104 | **No performance benchmarks** - No baseline metrics | DevOps | Week 5 | Open |

**Details:**

**DOC-101: Add JSDoc to components**
```typescript
/**
 * Displays a WCAG criterion in card format with expandable details.
 *
 * @param criterion - The WCAG criterion to display
 * @param isFavorite - Whether this criterion is favorited by the user
 * @param onToggleFavorite - Callback when favorite button is clicked
 * @param onShare - Callback when share button is clicked
 * @param expandedId - ID of currently expanded criterion (for controlling expansion)
 * @param onToggleExpand - Callback when expand/collapse is triggered
 *
 * @example
 * ```tsx
 * <CriterionCard
 *   criterion={criterionData}
 *   isFavorite={favorites.has(criterionData.id)}
 *   onToggleFavorite={() => handleToggleFavorite(criterionData.id)}
 * />
 * ```
 */
export default function CriterionCard({ ... }) { ... }
```

### P2: Medium-Priority Documentation

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| DOC-201 | **No changelog** - Changes not tracked | Lead | Week 6 | Open |
| DOC-202 | **No decision records** - Architecture decisions not documented | Lead | Week 7 | Open |

---

## DevOps

### P0: Critical DevOps Issues

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| DEVOPS-001 | **No CI/CD pipeline** - Manual deployment process | DevOps | Week 1-2 | Open |
| DEVOPS-002 | **No code quality checks** - No ESLint/Prettier in Git hooks | DevOps | Week 1 | Open |
| DEVOPS-003 | **No environment variables management** - Hardcoded API URLs | DevOps | Week 1 | Open |

**Details:**

**DEVOPS-001: GitHub Actions CI/CD**
Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint
      - run: bun run type-check
      - run: bun run test
      - run: bun run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      # Add deployment steps
```

**DEVOPS-002: Add git hooks with Husky**
```bash
bun add -d husky lint-staged
bunx husky init
```

`.husky/pre-commit`:
```bash
#!/usr/bin/env sh
bunx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**DEVOPS-003: Environment configuration**
Create `.env.example`:
```bash
VITE_API_BASE_URL=http://localhost:8787
VITE_ADMIN_PASSWORD=your_admin_password
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ANALYTICS_ID=your_analytics_id
```

Update `lib/api.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
```

### P1: High-Priority DevOps

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| DEVOPS-101 | **No ESLint configuration** - Code style inconsistent | DevOps | Week 2 | Open |
| DEVOPS-102 | **No Prettier configuration** - Formatting inconsistent | DevOps | Week 2 | Open |
| DEVOPS-103 | **No dependency updates** - Outdated packages | DevOps | Week 3 | Open |
| DEVOPS-104 | **No security scanning** - Vulnerable dependencies unknown | DevOps | Week 3 | Open |

**Details:**

**DEVOPS-101: ESLint setup**
```bash
bun add -d eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y \
  eslint-plugin-import
```

Create `.eslintrc.cjs`:
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['react-refresh', 'jsx-a11y'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'jsx-a11y/no-autofocus': 'warn',
  },
  settings: {
    react: { version: 'detect' },
  },
};
```

**DEVOPS-102: Prettier setup**
```bash
bun add -d prettier eslint-config-prettier
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

**DEVOPS-103: Dependency management**
```bash
bun add -d npm-check-updates
bunx ncu -u  # Check for updates
```

Add to CI:
```yaml
- name: Check for outdated dependencies
  run: bunx ncu --target minor
```

**DEVOPS-104: Security scanning**
```bash
bun audit
```

Add to CI:
```yaml
- name: Security audit
  run: bun audit --audit-level=moderate
```

### P2: Medium-Priority DevOps

| ID | Item | Owner | ETA | Status |
|----|------|-------|-----|--------|
| DEVOPS-201 | **No Docker configuration** - Inconsistent dev environments | DevOps | Week 5 | Open |
| DEVOPS-202 | **No staging environment** - Test in production | DevOps | Week 6 | Open |
| DEVOPS-203 | **No monitoring/alerting** - Downtime goes unnoticed | DevOps | Week 7 | Open |

---

## Deprecation Notices

### Immediate Deprecations (Remove by v2.0.0)

| ID | Deprecated Item | Replacement | Removal Date | Migration Guide |
|----|----------------|-------------|--------------|-----------------|
| DEP-001 | `tag_id` (single tag) in QueryFilters | `tag_ids` (array) | 2025-12-31 | See MIGRATION_NOTES.md |
| DEP-002 | Manual localStorage helpers | Custom hooks (useLocalStorage) | 2025-12-31 | See MIGRATION_NOTES.md |
| DEP-003 | Direct `console.log` statements | Structured logging service | 2025-11-30 | Replace with logger service |

**Details:**

**DEP-001: Legacy single tag support**
- Location: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/types.ts` line 122
- Reason: Multi-tag filtering is now standard
- Migration: Replace `tag_id: number` with `tag_ids: number[]`

**DEP-002: Direct localStorage access**
- Locations: `lib/favorites.ts`, `lib/filterState.ts`, `lib/themes.ts`
- Reason: Centralize in custom hook for better error handling and testing
- Migration: Use `useLocalStorage<T>(key, defaultValue)` hook

**DEP-003: Console.log in production**
- Locations: 14 instances across 6 files
- Reason: Production logs should go to error tracking service
- Migration: Replace with Sentry or custom logger

---

## Recently Completed

### 2025-10-18

- Architecture documentation completed
- URL routing refactored and tested
- Theme system with 5 theme options
- Tag filtering with intersection logic
- Modal accessibility improvements

### 2025-10-17

- React Router 7.9 upgrade
- Favorites page implementation
- View mode persistence
- Live region announcements

---

## Future Enhancements (Beyond v2.0)

### Long-term Roadmap Items

1. **Multi-language support** - i18n with react-i18next (P2, Q1 2026)
2. **User accounts & sync** - Cloud sync for favorites/settings (P2, Q2 2026)
3. **Criterion relationships graph** - Visualize related criteria (P2, Q2 2026)
4. **AI-powered search** - Natural language queries (P2, Q3 2026)
5. **Browser extension** - Quick WCAG reference (P2, Q4 2026)
6. **Mobile app** - React Native version (P2, 2027)

---

## Metrics & KPIs

### Current Baseline (2025-10-18)

- **Test Coverage**: 0%
- **Bundle Size**: Unknown (need analysis)
- **Lighthouse Score**: Unknown (need audit)
- **Build Time**: Unknown (need benchmark)
- **Lines of Code**: ~4,500 (estimated)
- **Technical Debt Ratio**: High (estimated 30%)

### Target Metrics (v2.0.0)

- **Test Coverage**: 80%+
- **Bundle Size**: <500KB (gzipped)
- **Lighthouse Score**: 95+ (all categories)
- **Build Time**: <30 seconds
- **Technical Debt Ratio**: <15%

---

## Notes

- All file paths are absolute paths from project root
- ETA assumes 1 developer working part-time (20 hours/week)
- Priority can be adjusted based on business needs
- Some items may be parallelized by multiple developers
- Review and update this document monthly

---

## References

- [ARCHITECTURE.md](/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/docs/ARCHITECTURE.md)
- [REFACTOR_PLAN.md](/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/docs/REFACTOR_PLAN.md)
- [MIGRATION_NOTES.md](/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/docs/MIGRATION_NOTES.md)

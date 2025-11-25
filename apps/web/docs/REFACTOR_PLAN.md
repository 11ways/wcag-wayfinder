# WCAG Explorer Refactoring Plan

> A comprehensive, phased approach to modernizing the WCAG Explorer codebase with improved tooling, architecture, and developer experience.

## Table of Contents

- [Overview](#overview)
- [Current State Assessment](#current-state-assessment)
- [Phase 0: Foundation (Tooling & Testing)](#phase-0-foundation-tooling--testing)
- [Phase 1: Architecture](#phase-1-architecture)
- [Phase 2: State & Data](#phase-2-state--data)
- [Phase 3: Polish](#phase-3-polish)
- [Appendix](#appendix)

---

## Overview

### Goals

1. **Modernize tooling**: Migrate from npm/Vite to Bun for faster builds and testing
2. **Improve code quality**: Add linting, formatting, and git hooks
3. **Enhance architecture**: Implement layered architecture with clear separation of concerns
4. **Optimize state management**: Centralize server/client state with modern solutions
5. **Boost performance**: Code splitting, bundle optimization, and performance monitoring
6. **Ensure accessibility**: Comprehensive a11y audits and improvements
7. **Increase maintainability**: Better test coverage and documentation

### Success Metrics

- Build time reduced by 50%+
- Test coverage increased to 80%+
- Bundle size reduced by 30%+
- Lighthouse score 95+ across all categories
- Zero ESLint errors/warnings
- WCAG 2.2 AAA compliance

---

## Current State Assessment

### Project Structure

```
apps/web/
├── src/
│   ├── App.tsx                    # Main component (694 lines - needs splitting)
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Global styles
│   ├── components/                # UI components (17 files)
│   │   ├── CriterionCard.tsx
│   │   ├── CriterionDetails.tsx
│   │   ├── CriterionGrid.tsx
│   │   ├── CriterionList.tsx
│   │   ├── Filters.tsx
│   │   ├── HelpModal.tsx
│   │   ├── LiveRegion.tsx
│   │   ├── MetadataEditor.tsx
│   │   ├── Modal.tsx
│   │   ├── Pagination.tsx
│   │   ├── ResultList.tsx
│   │   ├── SelectedTagsPane.tsx
│   │   ├── ShareButton.tsx
│   │   ├── StarButton.tsx
│   │   ├── ThemeSelector.tsx
│   │   └── ViewToggle.tsx
│   ├── lib/                       # Business logic (10 files)
│   │   ├── admin-api.ts
│   │   ├── api.ts
│   │   ├── debounce.ts
│   │   ├── favorites.ts
│   │   ├── filterState.ts
│   │   ├── iconMapper.ts
│   │   ├── textUtils.ts
│   │   ├── themes.ts
│   │   ├── types.ts
│   │   └── urlUtils.ts
│   ├── pages/                     # Route pages (3 files)
│   │   ├── AdminPage.tsx
│   │   ├── ModalTestPage.tsx
│   │   └── SettingsPage.tsx
│   └── utils/                     # Utilities (1 file)
│       └── announce.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

### Key Issues

1. **Monolithic App.tsx**: 694 lines with mixed concerns (UI, state, business logic)
2. **No testing infrastructure**: Zero test files
3. **No code quality tools**: No ESLint, Prettier, or git hooks
4. **Flat component structure**: No clear architectural layers
5. **Mixed state management**: useState for everything, no server state caching
6. **No error boundaries**: Errors can crash the entire app
7. **No code splitting**: Single bundle for all routes
8. **Manual API calls**: No retry logic, caching, or invalidation
9. **No validation**: API responses not validated
10. **Limited TypeScript configuration**: Missing path aliases

### Dependencies

**Current:**
- React 18.2.0
- React Router DOM 7.9.4
- Vite 5.0.8
- TypeScript 5.3.3
- Tailwind CSS 3.4.0
- FontAwesome 7.1.0
- marked, dompurify, focus-trap-react

**Total files**: 32 TypeScript/TSX files

---

## Phase 0: Foundation (Tooling & Testing)

**Duration**: 1-2 weeks
**Risk Level**: Medium
**Prerequisites**: None

### Objectives

- Migrate to Bun for faster builds and testing
- Establish code quality standards with ESLint and Prettier
- Set up testing infrastructure
- Configure git hooks for quality gates
- Create baseline tests

### Tasks

#### 0.1: Bun Migration

**Files to modify:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/package.json`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/vite.config.ts`

**New files:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/bunfig.toml`

**Steps:**

1. Install Bun globally: `curl -fsSL https://bun.sh/install | bash`
2. Create `bunfig.toml`:
   ```toml
   [install]
   cache = "~/.bun/install/cache"
   registry = "https://registry.npmjs.org"

   [install.lockfile]
   save = true

   [test]
   preload = ["./src/test-setup.ts"]

   [run]
   bun = true
   ```

3. Update `package.json` scripts:
   ```json
   {
     "scripts": {
       "dev": "bun --bun vite",
       "build": "bun run type-check && bun --bun vite build",
       "preview": "bun --bun vite preview",
       "type-check": "tsc --noEmit",
       "test": "bun test",
       "test:watch": "bun test --watch",
       "test:coverage": "bun test --coverage",
       "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
       "lint:fix": "eslint src --ext .ts,.tsx --fix",
       "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
       "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md}\""
     }
   }
   ```

4. Install dependencies with Bun: `bun install`

**Rollback**: Keep `package-lock.json` backup, restore with `npm install`

#### 0.2: ESLint Configuration

**New files:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/.eslintrc.cjs`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/.eslintignore`

**Dependencies to add:**
```bash
bun add -d eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y \
  eslint-plugin-import @typescript-eslint/utils
```

**ESLint config** (`.eslintrc.cjs`):
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh', '@typescript-eslint', 'jsx-a11y'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
  },
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts', 'postcss.config.js', 'tailwind.config.js'],
};
```

**ESLint ignore** (`.eslintignore`):
```
dist
node_modules
.bun
*.config.js
*.config.ts
```

#### 0.3: Prettier Configuration

**New files:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/.prettierrc.json`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/.prettierignore`

**Dependencies to add:**
```bash
bun add -d prettier prettier-plugin-tailwindcss
```

**Prettier config** (`.prettierrc.json`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Prettier ignore** (`.prettierignore`):
```
dist
node_modules
.bun
coverage
*.md
package.json
bun.lockb
```

#### 0.4: EditorConfig

**New files:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/.editorconfig`

**Content:**
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.{json,yml,yaml}]
indent_size = 2
```

#### 0.5: TypeScript Path Aliases

**Files to modify:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/tsconfig.json`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/vite.config.ts`

**Update `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@app/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@features/*": ["./src/features/*"],
      "@widgets/*": ["./src/widgets/*"],
      "@pages/*": ["./src/pages/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Update `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@pages': path.resolve(__dirname, './src/pages'),
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
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@fortawesome/fontawesome-svg-core', '@fortawesome/react-fontawesome'],
        },
      },
    },
  },
});
```

#### 0.6: Testing Infrastructure

**New files:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/test-setup.ts`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/test-utils.tsx`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/mocks/handlers.ts`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/mocks/server.ts`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/mocks/browser.ts`

**Dependencies to add:**
```bash
bun add -d @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @happy-dom/global-registrator happy-dom msw
```

**Test setup** (`src/test-setup.ts`):
```typescript
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'bun:test';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Start MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Clean up after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Stop MSW server
afterAll(() => server.close());
```

**Test utils** (`src/test-utils.tsx`):
```typescript
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

**MSW handlers** (`src/mocks/handlers.ts`):
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/criteria', () => {
    return HttpResponse.json({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 0,
    });
  }),

  http.get('/api/principles', () => {
    return HttpResponse.json(['Perceivable', 'Operable', 'Understandable', 'Robust']);
  }),

  http.get('/api/levels', () => {
    return HttpResponse.json(['A', 'AA', 'AAA']);
  }),

  http.get('/api/versions', () => {
    return HttpResponse.json(['2.0', '2.1', '2.2']);
  }),

  http.get('/api/guidelines', () => {
    return HttpResponse.json([]);
  }),
];
```

**MSW server** (`src/mocks/server.ts`):
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**MSW browser** (`src/mocks/browser.ts`):
```typescript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

#### 0.7: Baseline Smoke Tests

**New files:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/App.test.tsx`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/api.test.ts`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/components/Pagination.test.tsx`

**App smoke test** (`src/App.test.tsx`):
```typescript
import { describe, test, expect } from 'bun:test';
import { render, screen } from './test-utils';
import App from './App';

describe('App', () => {
  test('renders header with title', () => {
    render(<App />);
    expect(screen.getByText('WCAG Explorer')).toBeInTheDocument();
  });

  test('renders search input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  test('renders skip links for accessibility', () => {
    render(<App />);
    expect(screen.getByText('Skip to search')).toBeInTheDocument();
    expect(screen.getByText('Skip to filters')).toBeInTheDocument();
    expect(screen.getByText('Skip to results')).toBeInTheDocument();
  });
});
```

**API test** (`src/lib/api.test.ts`):
```typescript
import { describe, test, expect } from 'bun:test';
import { getCriteria, getPrinciples, getLevels, getVersions } from './api';

describe('API', () => {
  test('getCriteria returns paginated results', async () => {
    const result = await getCriteria({});
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
  });

  test('getPrinciples returns array', async () => {
    const result = await getPrinciples();
    expect(Array.isArray(result)).toBe(true);
  });

  test('getLevels returns array', async () => {
    const result = await getLevels();
    expect(Array.isArray(result)).toBe(true);
  });

  test('getVersions returns array', async () => {
    const result = await getVersions();
    expect(Array.isArray(result)).toBe(true);
  });
});
```

**Pagination test** (`src/components/Pagination.test.tsx`):
```typescript
import { describe, test, expect, mock } from 'bun:test';
import { render, screen } from '../test-utils';
import Pagination from './Pagination';
import userEvent from '@testing-library/user-event';

describe('Pagination', () => {
  test('renders page numbers', () => {
    const onPageChange = mock(() => {});
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('calls onPageChange when clicking page number', async () => {
    const user = userEvent.setup();
    const onPageChange = mock(() => {});

    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('disables previous button on first page', () => {
    const onPageChange = mock(() => {});
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    const prevButton = screen.getByLabelText(/previous/i);
    expect(prevButton).toBeDisabled();
  });
});
```

#### 0.8: Git Hooks Setup

**New files:**
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/.husky/pre-commit`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/.husky/commit-msg`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/.lintstagedrc.json`
- `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/commitlint.config.js`

**Dependencies to add:**
```bash
bun add -d husky lint-staged @commitlint/cli @commitlint/config-conventional
```

**Package.json scripts to add:**
```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

**Initialize husky:**
```bash
bunx husky install
bunx husky add .husky/pre-commit "bunx lint-staged"
bunx husky add .husky/commit-msg 'bunx --no -- commitlint --edit ${1}'
```

**Lint-staged config** (`.lintstagedrc.json`):
```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "bun test --bail --findRelatedTests"
  ],
  "*.{css,md}": [
    "prettier --write"
  ]
}
```

**Commitlint config** (`commitlint.config.js`):
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
};
```

### Verification Checklist

#### Unit Tests
- [ ] All baseline tests pass: `bun test`
- [ ] Test coverage initialized: `bun test --coverage`
- [ ] MSW handlers return mock data correctly

#### Integration Tests
- [ ] ESLint runs without errors: `bun run lint`
- [ ] Prettier formats code correctly: `bun run format:check`
- [ ] TypeScript compiles: `bun run type-check`
- [ ] Build succeeds: `bun run build`
- [ ] Dev server starts: `bun run dev`

#### Browser Walkthrough
1. Open http://localhost:5173
2. Verify app loads without errors
3. Check browser console for warnings
4. Test search functionality
5. Test filter functionality
6. Navigate to /favorites, /settings, /admin
7. Test pagination
8. Test theme switching

#### DevTools MCP Audits
- [ ] Run Lighthouse audit (all scores baseline recorded)
- [ ] Check Network tab for API calls
- [ ] Verify no console errors/warnings
- [ ] Check bundle size in Coverage tab

#### Git Hooks
- [ ] Pre-commit hook runs lint-staged
- [ ] Commit-msg hook validates commit messages
- [ ] Tests run on staged files

### Success Criteria

- All dependencies installed via Bun
- ESLint configured with zero errors
- Prettier configured and formats consistently
- Path aliases working in imports
- At least 3 baseline tests passing
- MSW mocking API calls successfully
- Git hooks preventing bad commits
- Documentation updated with new scripts

### Rollback Procedure

1. Restore original `package.json` and `package-lock.json`
2. Run `npm install` to restore npm packages
3. Remove Bun-specific files:
   - `bunfig.toml`
   - `bun.lockb`
4. Remove new config files if causing issues:
   - `.eslintrc.cjs`, `.eslintignore`
   - `.prettierrc.json`, `.prettierignore`
   - `.editorconfig`
   - `.husky/`, `.lintstagedrc.json`, `commitlint.config.js`
5. Restore original `tsconfig.json` and `vite.config.ts`
6. Remove test files and mocks directories

### Risk Assessment

**Low Risk:**
- EditorConfig setup
- Prettier configuration
- Path aliases

**Medium Risk:**
- Bun migration (can fallback to npm)
- ESLint rules (can be relaxed)
- Git hooks (can be disabled)

**High Risk:**
- None (all changes are additive)

**Mitigation:**
- Keep npm as fallback option
- Make git hooks optional with env variable
- Gradual ESLint rule enforcement

---

## Phase 1: Architecture

**Duration**: 2-3 weeks
**Risk Level**: High
**Prerequisites**: Phase 0 complete

### Objectives

- Reorganize codebase into layered architecture
- Extract business logic from components
- Implement barrel exports for cleaner imports
- Centralize API client with error handling
- Add Zod for runtime API validation
- Implement error boundaries
- Enforce architectural layers with ESLint

### Target Architecture

```
src/
├── app/                           # App layer (root, providers, routing)
│   ├── App.tsx                    # Simplified app shell
│   ├── router.tsx                 # Route configuration
│   └── providers.tsx              # Context providers
├── pages/                         # Pages layer (route components)
│   ├── HomePage.tsx
│   ├── FavoritesPage.tsx
│   ├── AdminPage.tsx
│   ├── SettingsPage.tsx
│   └── index.ts                   # Barrel export
├── widgets/                       # Widgets layer (complex features)
│   ├── SearchBar/
│   │   ├── SearchBar.tsx
│   │   ├── useSearchBar.ts
│   │   └── index.ts
│   ├── FiltersSidebar/
│   │   ├── FiltersSidebar.tsx
│   │   ├── useFilters.ts
│   │   └── index.ts
│   ├── ResultsView/
│   │   ├── ResultsView.tsx
│   │   ├── useResults.ts
│   │   └── index.ts
│   └── index.ts
├── features/                      # Features layer (domain logic)
│   ├── criteria/
│   │   ├── api/
│   │   │   ├── getCriteria.ts
│   │   │   ├── getCriterionById.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── CriterionCard.tsx
│   │   │   ├── CriterionList.tsx
│   │   │   ├── CriterionGrid.tsx
│   │   │   ├── CriterionDetails.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useCriteria.ts
│   │   │   ├── useCriterion.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── criterion.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── favorites/
│   │   ├── hooks/
│   │   │   ├── useFavorites.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── storage.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── StarButton.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── filters/
│   │   ├── components/
│   │   │   ├── Filters.tsx
│   │   │   ├── SelectedTagsPane.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useFilters.ts
│   │   │   ├── useUrlSync.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── urlUtils.ts
│   │   │   ├── storage.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── tags/
│   │   ├── components/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useTags.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── themes/
│   │   ├── components/
│   │   │   ├── ThemeSelector.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useTheme.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── themes.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
├── shared/                        # Shared layer (reusable utilities)
│   ├── api/
│   │   ├── client.ts              # Centralized fetch wrapper
│   │   ├── error-handler.ts
│   │   ├── schemas.ts             # Zod schemas
│   │   └── index.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Modal.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── ViewToggle.tsx
│   │   │   └── index.ts
│   │   ├── ErrorBoundary.tsx
│   │   ├── LiveRegion.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── announce.ts
│   │   ├── textUtils.ts
│   │   ├── iconMapper.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── common.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── routes.ts
│   │   └── index.ts
│   └── index.ts
└── main.tsx
```

### Tasks

#### 1.1: Create Directory Structure

**Script to create structure:**

Create `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/scripts/create-structure.sh`:

```bash
#!/bin/bash

BASE_DIR="/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src"

# Create app layer
mkdir -p "$BASE_DIR/app"

# Create pages layer
mkdir -p "$BASE_DIR/pages"

# Create widgets layer
mkdir -p "$BASE_DIR/widgets/SearchBar"
mkdir -p "$BASE_DIR/widgets/FiltersSidebar"
mkdir -p "$BASE_DIR/widgets/ResultsView"

# Create features layer
mkdir -p "$BASE_DIR/features/criteria/api"
mkdir -p "$BASE_DIR/features/criteria/components"
mkdir -p "$BASE_DIR/features/criteria/hooks"
mkdir -p "$BASE_DIR/features/criteria/types"

mkdir -p "$BASE_DIR/features/favorites/hooks"
mkdir -p "$BASE_DIR/features/favorites/utils"
mkdir -p "$BASE_DIR/features/favorites/components"

mkdir -p "$BASE_DIR/features/filters/components"
mkdir -p "$BASE_DIR/features/filters/hooks"
mkdir -p "$BASE_DIR/features/filters/utils"
mkdir -p "$BASE_DIR/features/filters/types"

mkdir -p "$BASE_DIR/features/tags/components"
mkdir -p "$BASE_DIR/features/tags/hooks"

mkdir -p "$BASE_DIR/features/themes/components"
mkdir -p "$BASE_DIR/features/themes/hooks"
mkdir -p "$BASE_DIR/features/themes/utils"

# Create shared layer
mkdir -p "$BASE_DIR/shared/api"
mkdir -p "$BASE_DIR/shared/components/ui"
mkdir -p "$BASE_DIR/shared/hooks"
mkdir -p "$BASE_DIR/shared/utils"
mkdir -p "$BASE_DIR/shared/types"
mkdir -p "$BASE_DIR/shared/constants"

# Create index.ts files for barrel exports
find "$BASE_DIR" -type d -exec touch {}/index.ts \;

echo "Directory structure created successfully!"
```

Run: `chmod +x scripts/create-structure.sh && ./scripts/create-structure.sh`

#### 1.2: Extract Shared Components

**Move and refactor:**

1. Move `src/components/Modal.tsx` → `src/shared/components/ui/Modal.tsx`
2. Move `src/components/Pagination.tsx` → `src/shared/components/ui/Pagination.tsx`
3. Move `src/components/ViewToggle.tsx` → `src/shared/components/ui/ViewToggle.tsx`
4. Move `src/components/LiveRegion.tsx` → `src/shared/components/LiveRegion.tsx`

Create `src/shared/components/ui/index.ts`:
```typescript
export { default as Modal } from './Modal';
export { default as Pagination } from './Pagination';
export { default as ViewToggle } from './ViewToggle';
```

Create `src/shared/components/index.ts`:
```typescript
export * from './ui';
export { default as LiveRegion } from './LiveRegion';
```

#### 1.3: Create Error Boundary

**New file:** `src/shared/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary">
          <div className="max-w-md w-full bg-primary border border-primary rounded-lg p-6 shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-secondary mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-accent hover:underline">
                  Error details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### 1.4: Centralize API Client

**New file:** `src/shared/api/client.ts`

```typescript
import type { ZodSchema } from 'zod';
import { handleApiError, ApiError } from './error-handler';

const API_BASE = '/api';

interface FetchOptions extends RequestInit {
  schema?: ZodSchema;
  timeout?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { schema, timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(
        error.error || `HTTP ${response.status}`,
        response.status,
        error
      );
    }

    const data = await response.json();

    // Validate with Zod schema if provided
    if (schema) {
      const validated = schema.parse(data);
      return validated as T;
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw handleApiError(error);
  }
}

export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}
```

**New file:** `src/shared/api/error-handler.ts`

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): Error {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new ApiError('Request timeout', 408);
    }
    return new ApiError(error.message);
  }

  return new ApiError('An unexpected error occurred');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
```

#### 1.5: Add Zod Schemas

**Dependencies to add:**
```bash
bun add zod
```

**New file:** `src/shared/api/schemas.ts`

```typescript
import { z } from 'zod';

// Tag schema
export const tagSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  category: z.string().nullable(),
  icon: z.string().nullable(),
});

export const tagWithScoreSchema = tagSchema.extend({
  relevance_score: z.number().nullable(),
});

// Criterion schema
export const criterionSchema = z.object({
  id: z.string(),
  num: z.string(),
  handle: z.string(),
  title: z.string(),
  level: z.enum(['A', 'AA', 'AAA']),
  url: z.string().url(),
  content: z.string(),
  principle: z.string(),
  guideline_id: z.string(),
  guideline_num: z.string(),
  guideline_handle: z.string(),
  versions: z.array(z.string()),
  tags: z.array(tagWithScoreSchema).nullable(),
});

// Guideline schema
export const guidelineSchema = z.object({
  id: z.string(),
  num: z.string(),
  handle: z.string(),
  title: z.string(),
  principle: z.string(),
});

// Paginated result schema
export const paginatedResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

// Query filters schema
export const queryFiltersSchema = z.object({
  q: z.string().optional(),
  principle: z.array(z.string()).optional(),
  level: z.array(z.string()).optional(),
  version: z.array(z.string()).optional(),
  guideline_id: z.string().optional(),
  tag_id: z.number().optional(),
  tag_ids: z.array(z.number()).optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

// Export types
export type Tag = z.infer<typeof tagSchema>;
export type TagWithScore = z.infer<typeof tagWithScoreSchema>;
export type Criterion = z.infer<typeof criterionSchema>;
export type Guideline = z.infer<typeof guidelineSchema>;
export type QueryFilters = z.infer<typeof queryFiltersSchema>;
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
```

**Update API barrel export** (`src/shared/api/index.ts`):
```typescript
export { apiClient, buildQueryString } from './client';
export { ApiError, handleApiError, getErrorMessage } from './error-handler';
export * from './schemas';
```

#### 1.6: Refactor Criteria Feature

**Move files:**
- `src/lib/api.ts` → `src/features/criteria/api/` (split into multiple files)
- `src/components/CriterionCard.tsx` → `src/features/criteria/components/`
- `src/components/CriterionList.tsx` → `src/features/criteria/components/`
- `src/components/CriterionGrid.tsx` → `src/features/criteria/components/`
- `src/components/CriterionDetails.tsx` → `src/features/criteria/components/`

**New file:** `src/features/criteria/api/getCriteria.ts`

```typescript
import { apiClient, buildQueryString } from '@shared/api';
import { paginatedResultSchema, criterionSchema, type Criterion, type QueryFilters, type PaginatedResult } from '@shared/api/schemas';

export async function getCriteria(
  filters: QueryFilters
): Promise<PaginatedResult<Criterion>> {
  const queryString = buildQueryString(filters);
  const endpoint = `/criteria${queryString ? `?${queryString}` : ''}`;

  return apiClient<PaginatedResult<Criterion>>(endpoint, {
    schema: paginatedResultSchema(criterionSchema),
  });
}
```

**New file:** `src/features/criteria/api/getCriterionById.ts`

```typescript
import { apiClient } from '@shared/api';
import { criterionSchema, type Criterion } from '@shared/api/schemas';

export async function getCriterionById(id: string): Promise<Criterion> {
  return apiClient<Criterion>(`/criteria/${encodeURIComponent(id)}`, {
    schema: criterionSchema,
  });
}
```

**Update barrel exports** (`src/features/criteria/api/index.ts`):
```typescript
export { getCriteria } from './getCriteria';
export { getCriterionById } from './getCriterionById';
```

Update `src/features/criteria/components/index.ts`:
```typescript
export { default as CriterionCard } from './CriterionCard';
export { default as CriterionList } from './CriterionList';
export { default as CriterionGrid } from './CriterionGrid';
export { default as CriterionDetails } from './CriterionDetails';
```

Update component imports to use path aliases and shared schemas.

#### 1.7: Extract Custom Hooks

**New file:** `src/shared/hooks/useDebounce.ts`

Extract debounce logic from App.tsx:

```typescript
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**New file:** `src/shared/hooks/useLocalStorage.ts`

```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

**Update barrel export** (`src/shared/hooks/index.ts`):
```typescript
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
```

#### 1.8: Add ESLint Import Plugin with Layer Enforcement

**Dependencies to add:**
```bash
bun add -d eslint-plugin-import eslint-import-resolver-typescript
```

**Update `.eslintrc.cjs`:**

```javascript
module.exports = {
  // ... existing config
  extends: [
    // ... existing extends
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  plugins: [
    // ... existing plugins
    'import',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // ... existing rules

    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',

    // Layer enforcement rules
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@features/*'],
            message: 'Shared layer cannot import from features layer',
          },
          {
            group: ['@widgets/*'],
            message: 'Features and shared layers cannot import from widgets layer',
          },
          {
            group: ['@pages/*'],
            message: 'Only app layer can import from pages layer',
          },
        ],
      },
    ],
  },
};
```

#### 1.9: Update Imports Throughout Codebase

Create a script to help update imports: `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/scripts/update-imports.sh`

```bash
#!/bin/bash

# Update imports to use path aliases
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s|from '\.\./\.\./lib/|from '@shared/|g" \
  -e "s|from '\.\./\.\./components/|from '@shared/components/|g" \
  -e "s|from '\.\./lib/|from '@shared/|g" \
  -e "s|from '\.\./components/|from '@features/|g" \
  {} +

echo "Import paths updated!"
```

#### 1.10: Simplify App.tsx

Extract logic into widgets and hooks, leaving App.tsx as a shell:

**New file:** `src/app/App.tsx` (simplified version)

```typescript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@shared/components/ErrorBoundary';
import { HomePage, FavoritesPage, AdminPage, SettingsPage } from '@pages';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
```

Move the existing App.tsx logic to `src/pages/HomePage.tsx` as a starting point, then progressively extract widgets.

### Verification Checklist

#### Unit Tests
- [ ] All existing tests still pass
- [ ] ErrorBoundary tests pass
- [ ] API client tests pass
- [ ] Zod schema validation tests pass
- [ ] Custom hooks tests pass

#### Integration Tests
- [ ] ESLint passes with import rules
- [ ] No circular dependencies detected
- [ ] Layer enforcement rules work
- [ ] All imports use path aliases
- [ ] Build succeeds with new structure

#### Browser Walkthrough
1. Test all routes (/, /favorites, /admin, /settings)
2. Verify error boundary catches errors (trigger test error)
3. Test all existing functionality still works
4. Check Network tab for API calls
5. Verify no console errors

#### DevTools MCP Audits
- [ ] Bundle size comparison (should be similar or smaller)
- [ ] Network requests unchanged
- [ ] Performance metrics stable
- [ ] No new accessibility issues

### Success Criteria

- All 32 files reorganized into layered architecture
- Zero circular dependencies
- All imports use path aliases (@app, @shared, @features, @pages)
- Error boundary implemented and tested
- API client centralized with error handling
- Zod schemas validate all API responses
- ESLint enforces layer boundaries
- App.tsx reduced from 694 lines to <100 lines
- All existing functionality preserved
- Test coverage maintained or improved

### Rollback Procedure

1. Revert git commits for this phase
2. Restore original directory structure from backup
3. Remove new directories (app/, features/, widgets/, shared/)
4. Restore original component locations
5. Remove Zod dependency if causing issues
6. Revert ESLint config changes

### Risk Assessment

**Low Risk:**
- Directory restructuring (can be reverted easily)
- Barrel exports
- Custom hooks extraction

**Medium Risk:**
- Path aliases (requires tsconfig and vite config alignment)
- Import updates (can be automated with script)
- ErrorBoundary implementation

**High Risk:**
- API client centralization (affects all API calls)
- Zod validation (runtime errors if schemas incorrect)
- Layer enforcement rules (may block legitimate imports)

**Mitigation:**
- Make changes incrementally, one feature at a time
- Test thoroughly after each major file move
- Keep git commits small and focused
- Use feature flags to toggle new API client
- Make Zod validation warnings initially, not errors
- Allow time to adjust layer enforcement rules

---

## Phase 2: State & Data

**Duration**: 2-3 weeks
**Risk Level**: Medium
**Prerequisites**: Phase 1 complete

### Objectives

- Implement TanStack Query for server state management
- Add Zustand for client state management
- Extract remaining hooks from components
- Implement React.lazy code splitting for routes
- Improve test coverage to 60%
- Add loading and error states consistently

### Tasks

#### 2.1: Add TanStack Query

**Dependencies to add:**
```bash
bun add @tanstack/react-query @tanstack/react-query-devtools
```

**New file:** `src/app/providers.tsx`

```typescript
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Update:** `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@app/App';
import { Providers } from '@app/providers';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>
);
```

#### 2.2: Create React Query Hooks for Criteria

**New file:** `src/features/criteria/hooks/useCriteria.ts`

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCriteria } from '../api';
import { type Criterion, type QueryFilters, type PaginatedResult } from '@shared/api/schemas';

export const criteriaKeys = {
  all: ['criteria'] as const,
  lists: () => [...criteriaKeys.all, 'list'] as const,
  list: (filters: QueryFilters) => [...criteriaKeys.lists(), filters] as const,
  details: () => [...criteriaKeys.all, 'detail'] as const,
  detail: (id: string) => [...criteriaKeys.details(), id] as const,
};

interface UseCriteriaOptions extends Omit<
  UseQueryOptions<PaginatedResult<Criterion>, Error>,
  'queryKey' | 'queryFn'
> {
  filters?: QueryFilters;
}

export function useCriteria(options: UseCriteriaOptions = {}) {
  const { filters = {}, ...queryOptions } = options;

  return useQuery({
    queryKey: criteriaKeys.list(filters),
    queryFn: () => getCriteria(filters),
    ...queryOptions,
  });
}
```

**New file:** `src/features/criteria/hooks/useCriterion.ts`

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCriterionById } from '../api';
import { criteriaKeys } from './useCriteria';
import { type Criterion } from '@shared/api/schemas';

interface UseCriterionOptions extends Omit<
  UseQueryOptions<Criterion, Error>,
  'queryKey' | 'queryFn'
> {
  id: string;
}

export function useCriterion({ id, ...queryOptions }: UseCriterionOptions) {
  return useQuery({
    queryKey: criteriaKeys.detail(id),
    queryFn: () => getCriterionById(id),
    enabled: !!id,
    ...queryOptions,
  });
}
```

**Update barrel export** (`src/features/criteria/hooks/index.ts`):
```typescript
export { useCriteria, criteriaKeys } from './useCriteria';
export { useCriterion } from './useCriterion';
```

#### 2.3: Create React Query Hooks for Filters

**New file:** `src/features/filters/api/getFilterOptions.ts`

```typescript
import { apiClient } from '@shared/api';
import { z } from 'zod';

const principlesSchema = z.array(z.string());
const levelsSchema = z.array(z.string());
const versionsSchema = z.array(z.string());

export async function getPrinciples(): Promise<string[]> {
  return apiClient<string[]>('/principles', { schema: principlesSchema });
}

export async function getLevels(): Promise<string[]> {
  return apiClient<string[]>('/levels', { schema: levelsSchema });
}

export async function getVersions(): Promise<string[]> {
  return apiClient<string[]>('/versions', { schema: versionsSchema });
}
```

**New file:** `src/features/filters/hooks/useFilterOptions.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { getPrinciples, getLevels, getVersions } from '../api/getFilterOptions';

export const filterKeys = {
  all: ['filters'] as const,
  principles: () => [...filterKeys.all, 'principles'] as const,
  levels: () => [...filterKeys.all, 'levels'] as const,
  versions: () => [...filterKeys.all, 'versions'] as const,
};

export function usePrinciples() {
  return useQuery({
    queryKey: filterKeys.principles(),
    queryFn: getPrinciples,
    staleTime: Infinity, // These rarely change
  });
}

export function useLevels() {
  return useQuery({
    queryKey: filterKeys.levels(),
    queryFn: getLevels,
    staleTime: Infinity,
  });
}

export function useVersions() {
  return useQuery({
    queryKey: filterKeys.versions(),
    queryFn: getVersions,
    staleTime: Infinity,
  });
}
```

#### 2.4: Add Zustand for Client State

**Dependencies to add:**
```bash
bun add zustand
```

**New file:** `src/features/favorites/store/useFavoritesStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: Set<string>;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: new Set<string>(),

      addFavorite: (id: string) =>
        set(state => ({
          favorites: new Set(state.favorites).add(id),
        })),

      removeFavorite: (id: string) =>
        set(state => {
          const newFavorites = new Set(state.favorites);
          newFavorites.delete(id);
          return { favorites: newFavorites };
        }),

      toggleFavorite: (id: string) =>
        set(state => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(id)) {
            newFavorites.delete(id);
          } else {
            newFavorites.add(id);
          }
          return { favorites: newFavorites };
        }),

      clearFavorites: () => set({ favorites: new Set<string>() }),

      isFavorite: (id: string) => get().favorites.has(id),
    }),
    {
      name: 'wcag-favorites',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              favorites: new Set(state.favorites),
            },
          };
        },
        setItem: (name, value) => {
          const { state } = value;
          localStorage.setItem(
            name,
            JSON.stringify({
              state: {
                ...state,
                favorites: Array.from(state.favorites),
              },
            })
          );
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
```

**New file:** `src/features/themes/store/useThemeStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'system' | 'light' | 'dark' | 'solarized-dark' | 'high-contrast';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },
    }),
    {
      name: 'wcag-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark', 'theme-solarized-dark', 'theme-high-contrast');

  if (theme !== 'system') {
    root.classList.add(`theme-${theme}`);
  }
}
```

**New file:** `src/features/filters/store/useFiltersStore.ts`

```typescript
import { create } from 'zustand';
import { type QueryFilters } from '@shared/api/schemas';

interface FiltersState {
  filters: QueryFilters;
  setFilters: (filters: QueryFilters | ((prev: QueryFilters) => QueryFilters)) => void;
  resetFilters: () => void;
  setSearchQuery: (q: string | undefined) => void;
  setPrinciples: (principle: string[] | undefined) => void;
  setLevels: (level: string[] | undefined) => void;
  setVersions: (version: string[] | undefined) => void;
  setGuidelineId: (guideline_id: string | undefined) => void;
  setTagIds: (tag_ids: number[] | undefined) => void;
  setPage: (page: number) => void;
}

const defaultFilters: QueryFilters = {
  page: 1,
  pageSize: 25,
};

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: defaultFilters,

  setFilters: (filters) =>
    set((state) => ({
      filters: typeof filters === 'function' ? filters(state.filters) : filters,
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  setSearchQuery: (q) =>
    set((state) => ({
      filters: { ...state.filters, q, page: 1 },
    })),

  setPrinciples: (principle) =>
    set((state) => ({
      filters: { ...state.filters, principle, page: 1 },
    })),

  setLevels: (level) =>
    set((state) => ({
      filters: { ...state.filters, level, page: 1 },
    })),

  setVersions: (version) =>
    set((state) => ({
      filters: { ...state.filters, version, page: 1 },
    })),

  setGuidelineId: (guideline_id) =>
    set((state) => ({
      filters: { ...state.filters, guideline_id, page: 1 },
    })),

  setTagIds: (tag_ids) =>
    set((state) => ({
      filters: { ...state.filters, tag_ids, page: 1 },
    })),

  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
    })),
}));
```

#### 2.5: Implement Code Splitting

**Update:** `src/pages/index.ts`

```typescript
import { lazy } from 'react';

export const HomePage = lazy(() => import('./HomePage'));
export const FavoritesPage = lazy(() => import('./FavoritesPage'));
export const AdminPage = lazy(() => import('./AdminPage'));
export const SettingsPage = lazy(() => import('./SettingsPage'));
```

**Update:** `src/app/App.tsx`

```typescript
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@shared/components/ErrorBoundary';
import { HomePage, FavoritesPage, AdminPage, SettingsPage } from '@pages';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-secondary">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
```

#### 2.6: Refactor Components to Use New Hooks and State

Update HomePage to use new hooks:

**Example refactor** (`src/pages/HomePage.tsx`):

```typescript
import React, { useState } from 'react';
import { useCriteria } from '@features/criteria/hooks';
import { useFiltersStore } from '@features/filters/store/useFiltersStore';
import { useFavoritesStore } from '@features/favorites/store/useFavoritesStore';
import { useDebounce } from '@shared/hooks';
import { SearchBar } from '@widgets/SearchBar';
import { FiltersSidebar } from '@widgets/FiltersSidebar';
import { ResultsView } from '@widgets/ResultsView';

export default function HomePage() {
  const filters = useFiltersStore((state) => state.filters);
  const setFilters = useFiltersStore((state) => state.setFilters);

  const [searchInput, setSearchInput] = useState(filters.q || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update filters when debounced search changes
  React.useEffect(() => {
    if (debouncedSearch !== filters.q) {
      setFilters({ ...filters, q: debouncedSearch || undefined, page: 1 });
    }
  }, [debouncedSearch]);

  const { data, isLoading, error } = useCriteria({ filters });

  return (
    <div className="min-h-screen flex flex-col">
      <SearchBar value={searchInput} onChange={setSearchInput} />

      <div className="flex-1 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <FiltersSidebar />
            <ResultsView data={data} isLoading={isLoading} error={error} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 2.7: Add Comprehensive Tests

Target: 60% coverage

**Test files to create:**

1. `src/features/criteria/hooks/useCriteria.test.ts`
2. `src/features/favorites/store/useFavoritesStore.test.ts`
3. `src/features/themes/store/useThemeStore.test.ts`
4. `src/features/filters/store/useFiltersStore.test.ts`
5. `src/shared/hooks/useDebounce.test.ts`
6. `src/shared/hooks/useLocalStorage.test.ts`
7. `src/shared/components/ErrorBoundary.test.tsx`
8. `src/features/criteria/components/CriterionCard.test.tsx`
9. `src/features/criteria/components/CriterionList.test.tsx`
10. `src/pages/HomePage.test.tsx`

**Example test** (`src/features/criteria/hooks/useCriteria.test.ts`):

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCriteria } from './useCriteria';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCriteria', () => {
  test('fetches criteria successfully', async () => {
    const { result } = renderHook(() => useCriteria(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.items).toBeInstanceOf(Array);
  });

  test('handles filters correctly', async () => {
    const filters = { level: ['AA'], principle: ['Perceivable'] };

    const { result } = renderHook(() => useCriteria({ filters }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
  });
});
```

**Example Zustand test** (`src/features/favorites/store/useFavoritesStore.test.ts`):

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useFavoritesStore } from './useFavoritesStore';

describe('useFavoritesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useFavoritesStore.setState({ favorites: new Set() });
  });

  test('adds favorite', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('1.1.1');
    });

    expect(result.current.isFavorite('1.1.1')).toBe(true);
    expect(result.current.favorites.size).toBe(1);
  });

  test('removes favorite', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('1.1.1');
      result.current.removeFavorite('1.1.1');
    });

    expect(result.current.isFavorite('1.1.1')).toBe(false);
    expect(result.current.favorites.size).toBe(0);
  });

  test('toggles favorite', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.toggleFavorite('1.1.1');
    });
    expect(result.current.isFavorite('1.1.1')).toBe(true);

    act(() => {
      result.current.toggleFavorite('1.1.1');
    });
    expect(result.current.isFavorite('1.1.1')).toBe(false);
  });

  test('clears all favorites', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('1.1.1');
      result.current.addFavorite('1.2.1');
      result.current.clearFavorites();
    });

    expect(result.current.favorites.size).toBe(0);
  });
});
```

### Verification Checklist

#### Unit Tests
- [ ] All new hook tests pass
- [ ] All Zustand store tests pass
- [ ] Code splitting tests pass
- [ ] Test coverage reaches 60%+
- [ ] All existing tests still pass

#### Integration Tests
- [ ] TanStack Query devtools work
- [ ] Data fetching with React Query works
- [ ] State management with Zustand works
- [ ] Code splitting loads routes lazily
- [ ] Error states handled correctly
- [ ] Loading states shown correctly

#### Browser Walkthrough
1. Open DevTools Network tab
2. Navigate between routes (verify lazy loading)
3. Test search (verify debouncing)
4. Test filters (verify state updates)
5. Test favorites (verify persistence)
6. Test theme switching (verify persistence)
7. Refresh page (verify state rehydration)
8. Check React Query DevTools for cache

#### DevTools MCP Audits
- [ ] Initial bundle size reduced (code splitting)
- [ ] Route chunks loaded on demand
- [ ] Network requests optimized (fewer duplicate calls)
- [ ] Performance metrics improved
- [ ] Memory usage stable

### Success Criteria

- TanStack Query managing all server state
- Zustand managing all client state (favorites, theme, filters)
- All routes code-split with React.lazy
- Test coverage 60%+
- Loading states implemented consistently
- Error states handled gracefully
- No prop drilling (state centralized)
- localStorage persistence working

### Rollback Procedure

1. Revert git commits for this phase
2. Remove TanStack Query and Zustand dependencies
3. Restore useState-based state management
4. Remove lazy loading from routes
5. Restore original HomePage implementation

### Risk Assessment

**Low Risk:**
- Code splitting implementation
- Zustand store creation
- Custom hooks extraction

**Medium Risk:**
- TanStack Query migration (changes data flow)
- State centralization (affects multiple components)
- Test coverage improvements (time-consuming)

**High Risk:**
- None (changes are largely additive)

**Mitigation:**
- Migrate one feature at a time to React Query
- Keep old state management alongside new temporarily
- Use feature flags to toggle between old/new implementations
- Gradual rollout of Zustand stores

---

## Phase 3: Polish

**Duration**: 2-3 weeks
**Risk Level**: Low
**Prerequisites**: Phase 2 complete

### Objectives

- Optimize bundle size and analyze composition
- Set up Lighthouse CI for performance monitoring
- Profile and optimize React rendering performance
- Conduct comprehensive accessibility audit
- Create comprehensive documentation
- Achieve 80%+ test coverage
- Production-ready optimizations

### Tasks

#### 3.1: Bundle Optimization

**Dependencies to add:**
```bash
bun add -d rollup-plugin-visualizer vite-plugin-compression
```

**Update:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: './dist/stats.html',
    }),
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@pages': path.resolve(__dirname, './src/pages'),
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
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'query': ['@tanstack/react-query'],
          'ui-vendor': [
            '@fortawesome/fontawesome-svg-core',
            '@fortawesome/react-fontawesome',
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/free-regular-svg-icons',
          ],
          'markdown': ['marked', 'dompurify'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
```

**Add script:** `package.json`

```json
{
  "scripts": {
    "analyze": "bun run build && open dist/stats.html"
  }
}
```

**Create optimization checklist:**

Create `docs/BUNDLE_OPTIMIZATION.md`:

```markdown
# Bundle Optimization Checklist

## Analysis

- [ ] Run `bun run analyze` to generate bundle visualization
- [ ] Identify largest chunks
- [ ] Check for duplicate dependencies
- [ ] Verify code splitting is working
- [ ] Check tree-shaking effectiveness

## Optimization Targets

### Target Sizes (gzipped)
- Initial bundle: < 150 KB
- React vendor chunk: < 130 KB
- Router chunk: < 30 KB
- Query chunk: < 40 KB
- UI vendor chunk: < 100 KB
- Each page chunk: < 50 KB

### Optimization Strategies

1. **Code Splitting**
   - All routes lazy loaded
   - Heavy components lazy loaded
   - Third-party libraries in separate chunks

2. **Tree Shaking**
   - Use named imports
   - Avoid barrel exports for large libraries
   - Check for unused exports

3. **Compression**
   - Gzip compression enabled
   - Brotli compression enabled
   - Server configured to serve compressed files

4. **Dependencies**
   - Replace heavy dependencies with lighter alternatives
   - Use dynamic imports for rarely-used features
   - Remove unused dependencies

## Monitoring

Track bundle size over time:
- Set up size budget alerts
- Monitor chunk sizes in CI
- Review bundle analysis report regularly
```

#### 3.2: Lighthouse CI Setup

**Dependencies to add:**
```bash
bun add -d @lhci/cli
```

**New file:** `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "bun run preview",
      "url": [
        "http://localhost:4173/",
        "http://localhost:4173/favorites",
        "http://localhost:4173/settings"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 300 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Add scripts:** `package.json`

```json
{
  "scripts": {
    "lighthouse": "lhci autorun",
    "lighthouse:collect": "lhci collect",
    "lighthouse:assert": "lhci assert"
  }
}
```

**Create CI workflow:** `.github/workflows/lighthouse.yml`

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build app
        run: bun run build

      - name: Run Lighthouse CI
        run: bun run lighthouse
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

#### 3.3: Performance Profiling

**New file:** `src/shared/utils/performance.ts`

```typescript
// Performance monitoring utilities

export function measureRender(componentName: string) {
  const start = performance.now();

  return () => {
    const end = performance.now();
    const duration = end - start;

    if (duration > 16.67) { // More than one frame (60fps)
      console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  };
}

export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    if (end - start > 10) {
      console.warn(`[Performance] ${name} took ${(end - start).toFixed(2)}ms`);
    }

    return result;
  }) as T;
}

// Mark and measure with Performance API
export function mark(name: string) {
  performance.mark(name);
}

export function measure(name: string, startMark: string, endMark: string) {
  performance.measure(name, startMark, endMark);
  const entries = performance.getEntriesByName(name);
  const latest = entries[entries.length - 1];

  if (latest) {
    console.log(`[Performance] ${name}: ${latest.duration.toFixed(2)}ms`);
  }
}
```

**Optimization strategies document:**

Create `docs/PERFORMANCE.md`:

```markdown
# Performance Optimization Guide

## React Performance

### 1. Memoization

Use `React.memo` for expensive components:
- List items in large lists
- Components with complex calculations
- Components that re-render frequently

### 2. useMemo and useCallback

- `useMemo`: Memoize expensive calculations
- `useCallback`: Memoize functions passed to child components

### 3. Virtual Lists

For lists with 100+ items, consider react-window or react-virtual.

### 4. Code Splitting

- Route-based splitting (already implemented)
- Component-based splitting for heavy components
- Dynamic imports for rarely-used features

## React Query Optimizations

### 1. Stale Time Configuration

```typescript
staleTime: 1000 * 60 * 5 // 5 minutes
```

### 2. Prefetching

Prefetch data on hover or mount:

```typescript
queryClient.prefetchQuery({
  queryKey: criteriaKeys.detail(id),
  queryFn: () => getCriterionById(id),
});
```

### 3. Optimistic Updates

For favorites and other mutations.

## Bundle Size

- Target: < 500 KB total (gzipped)
- Monitor with `bun run analyze`
- Regular dependency audits

## Metrics Goals

- FCP (First Contentful Paint): < 1.8s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- TBT (Total Blocking Time): < 200ms
- TTI (Time to Interactive): < 3.5s

## Monitoring

Use React DevTools Profiler to:
1. Identify slow renders
2. Find unnecessary re-renders
3. Measure component render times
```

#### 3.4: Accessibility Audit

**Create comprehensive a11y testing checklist:**

Create `docs/ACCESSIBILITY_AUDIT.md`:

```markdown
# Accessibility Audit Checklist

## WCAG 2.2 AAA Compliance

### Perceivable

#### 1.1 Text Alternatives
- [ ] All images have alt text
- [ ] Icons have aria-labels
- [ ] Decorative images marked with empty alt

#### 1.2 Time-based Media
- [ ] N/A (no video/audio content)

#### 1.3 Adaptable
- [ ] Semantic HTML structure
- [ ] Proper heading hierarchy (h1 → h6)
- [ ] Landmark regions (header, nav, main, footer)
- [ ] Lists use proper markup (ul, ol, li)
- [ ] Tables use proper markup (if any)

#### 1.4 Distinguishable
- [ ] Color contrast ratio ≥ 7:1 (AAA)
- [ ] Text resizable to 200% without loss of functionality
- [ ] No content lost when spacing increased
- [ ] Focus indicators visible (≥ 3:1 contrast)
- [ ] Reflow works at 320px width

### Operable

#### 2.1 Keyboard Accessible
- [ ] All interactive elements keyboard accessible
- [ ] No keyboard traps
- [ ] Skip links implemented
- [ ] Keyboard shortcuts documented
- [ ] Focus order logical

#### 2.2 Enough Time
- [ ] No time limits on interactions
- [ ] Auto-updating content can be paused (if any)

#### 2.3 Seizures
- [ ] No flashing content > 3 times per second

#### 2.4 Navigable
- [ ] Descriptive page titles
- [ ] Meaningful link text (no "click here")
- [ ] Multiple ways to find pages
- [ ] Clear focus indicators
- [ ] Breadcrumbs (if applicable)

#### 2.5 Input Modalities
- [ ] Touch targets ≥ 44×44px
- [ ] Pointer gestures have keyboard alternative
- [ ] No accidental activation

### Understandable

#### 3.1 Readable
- [ ] Page language declared (lang attribute)
- [ ] Language of parts declared if different
- [ ] Unusual words explained (glossary if needed)
- [ ] Abbreviations explained

#### 3.2 Predictable
- [ ] Consistent navigation
- [ ] Consistent identification
- [ ] No unexpected context changes
- [ ] Focus doesn't trigger unexpected changes

#### 3.3 Input Assistance
- [ ] Error messages descriptive and helpful
- [ ] Labels and instructions for inputs
- [ ] Error suggestions provided
- [ ] Errors preventable (confirmation dialogs)

### Robust

#### 4.1 Compatible
- [ ] Valid HTML (no errors)
- [ ] Proper ARIA usage
- [ ] Status messages announced
- [ ] Name, role, value for all components

## Testing Tools

### Automated Testing
- [ ] axe DevTools (Chrome extension)
- [ ] WAVE (Web Accessibility Evaluation Tool)
- [ ] Lighthouse accessibility audit
- [ ] eslint-plugin-jsx-a11y

### Manual Testing
- [ ] Keyboard navigation only
- [ ] Screen reader (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode
- [ ] 200% zoom
- [ ] Color blindness simulation

### User Testing
- [ ] Test with users with disabilities
- [ ] Gather feedback on accessibility
- [ ] Implement improvements

## Screen Reader Testing Scenarios

### VoiceOver (macOS)
1. Navigate with Tab key
2. Use Rotor to navigate headings
3. Use Rotor to navigate landmarks
4. Test form interactions
5. Test modal dialogs
6. Test live regions

### NVDA (Windows)
1. Browse mode navigation
2. Forms mode testing
3. Headings navigation (H key)
4. Landmarks navigation (D key)
5. Test tables (if any)
6. Test ARIA widgets

## Common Issues to Check

- [ ] Missing alt text
- [ ] Low color contrast
- [ ] Missing form labels
- [ ] Non-semantic HTML (divs instead of buttons)
- [ ] Missing ARIA labels
- [ ] Keyboard traps
- [ ] Non-descriptive link text
- [ ] Missing skip links
- [ ] Improper heading hierarchy
- [ ] Missing live region announcements
- [ ] Focus not managed in modals
- [ ] Touch targets too small
```

**Add axe-core for automated testing:**

```bash
bun add -d @axe-core/react
```

**Update:** `src/main.tsx` (development only)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@app/App';
import { Providers } from '@app/providers';
import './index.css';

if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>
);
```

#### 3.5: Documentation

**Create comprehensive documentation:**

1. **README.md** (update project root)
2. **CONTRIBUTING.md** (contribution guidelines)
3. **ARCHITECTURE.md** (architecture decisions)
4. **API.md** (API documentation)
5. **DEPLOYMENT.md** (deployment instructions)

**Create:** `docs/ARCHITECTURE.md`

```markdown
# Architecture Documentation

## Overview

WCAG Explorer follows a layered architecture pattern inspired by Feature-Sliced Design, promoting clear separation of concerns and maintainability.

## Directory Structure

```
src/
├── app/           # Application layer
├── pages/         # Page components (routes)
├── widgets/       # Complex UI features
├── features/      # Business logic domains
└── shared/        # Shared utilities
```

## Layers

### App Layer (`src/app/`)

**Responsibility**: Application initialization, routing, global providers

**Contains**:
- `App.tsx`: Root component with routing
- `providers.tsx`: Context providers (React Query, etc.)
- `router.tsx`: Route configuration

**Rules**:
- Can import from any layer
- Entry point for the application

### Pages Layer (`src/pages/`)

**Responsibility**: Route-level components

**Contains**:
- `HomePage.tsx`
- `FavoritesPage.tsx`
- `AdminPage.tsx`
- `SettingsPage.tsx`

**Rules**:
- Can import from: widgets, features, shared
- Cannot import from: other pages
- Should be relatively simple (composition of widgets)

### Widgets Layer (`src/widgets/`)

**Responsibility**: Complex, reusable UI features

**Contains**:
- `SearchBar/`: Search functionality
- `FiltersSidebar/`: Filters UI
- `ResultsView/`: Results display

**Rules**:
- Can import from: features, shared
- Cannot import from: app, pages, other widgets
- Should be self-contained features

### Features Layer (`src/features/`)

**Responsibility**: Domain-specific business logic

**Contains**:
- `criteria/`: Success criteria domain
- `favorites/`: Favorites management
- `filters/`: Filtering logic
- `tags/`: Tag management
- `themes/`: Theme switching

**Structure per feature**:
```
feature/
├── api/         # API calls
├── components/  # Domain components
├── hooks/       # Custom hooks
├── store/       # State management
├── types/       # TypeScript types
├── utils/       # Feature utilities
└── index.ts     # Barrel export
```

**Rules**:
- Can import from: shared, other features (with caution)
- Cannot import from: app, pages, widgets
- Should be focused on single domain

### Shared Layer (`src/shared/`)

**Responsibility**: Reusable utilities and components

**Contains**:
- `api/`: API client, error handling, schemas
- `components/`: Generic UI components
- `hooks/`: Generic React hooks
- `utils/`: Helper functions
- `types/`: Shared TypeScript types
- `constants/`: Application constants

**Rules**:
- Cannot import from any other layer
- Should be generic and reusable
- No business logic

## Import Rules (Enforced by ESLint)

```
app      → pages, widgets, features, shared
pages    → widgets, features, shared
widgets  → features, shared
features → shared, (other features with caution)
shared   → nothing
```

## State Management

### Server State (TanStack Query)

Used for:
- API data fetching
- Caching API responses
- Background refetching
- Optimistic updates

Location: `features/*/hooks/`

### Client State (Zustand)

Used for:
- UI state (theme, view mode)
- User preferences
- Favorites
- Filter state

Location: `features/*/store/`

## Code Splitting

- **Route-based**: All pages lazy loaded
- **Component-based**: Heavy components lazy loaded
- **Vendor splitting**: Libraries in separate chunks

## Type Safety

- All API responses validated with Zod
- Strict TypeScript configuration
- No `any` types (enforced by ESLint)

## Testing Strategy

- **Unit tests**: Individual functions and hooks
- **Component tests**: React components in isolation
- **Integration tests**: Multiple components together
- **E2E tests**: Critical user flows (future)

Target coverage: 80%

## Performance Considerations

- Memoization for expensive calculations
- Virtual lists for large datasets (future)
- Debounced search
- Optimized re-renders
- Code splitting

## Accessibility

- WCAG 2.2 AAA compliance target
- Semantic HTML
- ARIA attributes where needed
- Keyboard navigation
- Screen reader support
- Focus management

## API Integration

Centralized API client with:
- Error handling
- Request timeout
- Response validation (Zod)
- Retry logic
- Type safety
```

**Create:** `CONTRIBUTING.md`

```markdown
# Contributing to WCAG Explorer

## Getting Started

1. Clone the repository
2. Install Bun: `curl -fsSL https://bun.sh/install | bash`
3. Install dependencies: `bun install`
4. Start dev server: `bun run dev`

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Follow the architecture guidelines in ARCHITECTURE.md
- Write tests for new features
- Update documentation as needed

### 3. Run Quality Checks

```bash
# Type check
bun run type-check

# Lint
bun run lint

# Format
bun run format

# Test
bun test

# Build
bun run build
```

### 4. Commit

We use Conventional Commits:

```
feat: add new filter option
fix: correct pagination bug
docs: update README
style: format code with prettier
refactor: extract hook from component
perf: optimize criterion rendering
test: add tests for favorites
build: update vite config
ci: add lighthouse workflow
chore: update dependencies
```

Commits are validated by commitlint.

### 5. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Create a pull request with:
- Clear title and description
- Screenshots for UI changes
- Test coverage report
- Accessibility considerations

## Code Style

### TypeScript

- Use TypeScript for all files
- Avoid `any` type
- Use interfaces for objects
- Use type for unions/primitives
- Export types alongside implementations

### React

- Functional components only
- Use hooks for state and effects
- Memoize expensive calculations
- Keep components focused (single responsibility)

### Imports

- Use path aliases (@app, @shared, @features, @pages)
- Sort imports (enforced by ESLint)
- Avoid circular dependencies

### File Structure

```typescript
// 1. Imports (grouped)
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Component } from '@shared/components';
import { useHook } from '@features/domain/hooks';
import type { Type } from '@shared/types';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export default function Component({ prop }: Props) {
  // ...
}

// 4. Helpers (if small, otherwise separate file)
function helper() {
  // ...
}
```

## Testing

- Write tests for all new features
- Maintain 80%+ coverage
- Test user interactions, not implementation
- Use meaningful test descriptions

### Test Structure

```typescript
describe('FeatureName', () => {
  test('does something specific', () => {
    // Arrange
    const input = setupInput();

    // Act
    const result = performAction(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

## Accessibility

- Use semantic HTML
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios
- Provide text alternatives

## Performance

- Profile before optimizing
- Use React DevTools Profiler
- Avoid premature optimization
- Document performance improvements

## Documentation

- Update README for new features
- Add JSDoc comments for complex functions
- Document architectural decisions
- Keep docs in sync with code

## Questions?

Open an issue or discussion on GitHub.
```

#### 3.6: Increase Test Coverage to 80%+

**Test files to add:**

1. Widget tests
2. Remaining component tests
3. Integration tests
4. E2E critical paths (optional)

**Create test coverage report:**

Add to `package.json`:

```json
{
  "scripts": {
    "test:coverage": "bun test --coverage",
    "test:coverage:report": "bun test --coverage && open coverage/index.html"
  }
}
```

**Example integration test** (`src/pages/HomePage.integration.test.tsx`):

```typescript
import { describe, test, expect } from 'bun:test';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import HomePage from './HomePage';

describe('HomePage Integration', () => {
  test('complete user flow: search, filter, paginate', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Search
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'text alternatives');

    // Wait for debounced search
    await waitFor(() => {
      expect(screen.getByText(/results found/i)).toBeInTheDocument();
    }, { timeout: 500 });

    // Apply filter
    const levelAAButton = screen.getByRole('checkbox', { name: /AA/i });
    await user.click(levelAAButton);

    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText(/level AA/i)).toBeInTheDocument();
    });

    // Paginate
    const nextButton = screen.getByRole('button', { name: /next/i });
    if (!nextButton.disabled) {
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/page 2/i)).toBeInTheDocument();
      });
    }
  });

  test('favorites workflow', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find a star button and click it
    const starButtons = screen.getAllByRole('button', { name: /favorite/i });
    await user.click(starButtons[0]);

    // Check favorite count increased
    await waitFor(() => {
      expect(screen.getByText(/1 favorite/i)).toBeInTheDocument();
    });

    // Navigate to favorites page
    const favoritesLink = screen.getByRole('button', { name: /favorites/i });
    await user.click(favoritesLink);

    // Should show favorited item
    await waitFor(() => {
      expect(screen.getByText(/showing 1 favorite/i)).toBeInTheDocument();
    });
  });
});
```

### Verification Checklist

#### Unit Tests
- [ ] 80%+ code coverage achieved
- [ ] All features have unit tests
- [ ] All hooks have unit tests
- [ ] All utilities have unit tests
- [ ] All stores have unit tests

#### Integration Tests
- [ ] Critical user flows tested
- [ ] Search + filter + paginate flow works
- [ ] Favorites flow works
- [ ] Theme switching works
- [ ] Error handling tested

#### Browser Walkthrough
1. Complete accessibility audit
2. Test with keyboard only
3. Test with screen reader (VoiceOver/NVDA)
4. Test at 200% zoom
5. Test in high contrast mode
6. Test color blindness modes
7. Performance profiling in DevTools

#### DevTools MCP Audits
- [ ] Lighthouse performance score 90+
- [ ] Lighthouse accessibility score 95+
- [ ] Lighthouse best practices score 90+
- [ ] Lighthouse SEO score 90+
- [ ] Bundle size targets met
- [ ] No console errors/warnings
- [ ] Network waterfall optimized

#### Documentation
- [ ] README updated
- [ ] CONTRIBUTING.md complete
- [ ] ARCHITECTURE.md accurate
- [ ] All docs reviewed and accurate
- [ ] Code comments where needed

### Success Criteria

- Lighthouse CI passing with scores:
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 90+
  - SEO: 90+
- Bundle size reduced by 30%+
- Test coverage 80%+
- Zero accessibility violations (axe-core)
- Comprehensive documentation
- Production-ready deployment

### Rollback Procedure

Phase 3 is mostly additive, so rollback is simple:

1. Revert build optimizations if causing issues
2. Remove Lighthouse CI if not needed
3. Keep tests (no rollback needed)
4. Keep documentation (no rollback needed)

### Risk Assessment

**Low Risk:**
- All tasks are low risk (mostly additive)
- Bundle optimization (can be disabled)
- Lighthouse CI (doesn't affect app)
- Documentation (no code changes)
- Testing (improves reliability)

**Mitigation:**
- Test build optimizations thoroughly
- Monitor bundle size regression
- Keep optimization configs separate

---

## Appendix

### A. Glossary

- **Barrel export**: An index.ts file that re-exports items from multiple files
- **Code splitting**: Dividing code into separate bundles loaded on demand
- **Feature-Sliced Design**: Architecture pattern organizing code by features
- **Layered architecture**: Organizing code into layers with strict import rules
- **Path aliases**: TypeScript/Vite shortcuts for import paths (@app, @shared, etc.)
- **Server state**: Data from APIs managed by React Query
- **Client state**: Local UI state managed by Zustand
- **Tree shaking**: Removing unused code from bundles

### B. Tools Reference

#### Bun
- **Install**: `curl -fsSL https://bun.sh/install | bash`
- **Docs**: https://bun.sh/docs
- **Speed**: 2-5x faster than npm

#### ESLint
- **Config**: `.eslintrc.cjs`
- **Run**: `bun run lint`
- **Fix**: `bun run lint:fix`

#### Prettier
- **Config**: `.prettierrc.json`
- **Run**: `bun run format`
- **Check**: `bun run format:check`

#### TanStack Query
- **Docs**: https://tanstack.com/query/latest
- **DevTools**: Included in dev mode
- **Purpose**: Server state management

#### Zustand
- **Docs**: https://zustand-demo.pmnd.rs/
- **Purpose**: Client state management
- **Size**: ~1KB

#### Zod
- **Docs**: https://zod.dev/
- **Purpose**: Runtime type validation
- **Size**: ~8KB

#### Lighthouse CI
- **Docs**: https://github.com/GoogleChrome/lighthouse-ci
- **Run**: `bun run lighthouse`
- **Purpose**: Performance monitoring

### C. Common Commands

```bash
# Development
bun run dev                  # Start dev server
bun run build                # Build for production
bun run preview              # Preview production build

# Quality
bun run lint                 # Run ESLint
bun run lint:fix             # Fix ESLint issues
bun run format               # Format with Prettier
bun run type-check           # TypeScript check

# Testing
bun test                     # Run tests
bun test --watch             # Watch mode
bun test --coverage          # Coverage report

# Analysis
bun run analyze              # Bundle analysis
bun run lighthouse           # Lighthouse audit
```

### D. Troubleshooting

#### Build Issues

**Problem**: Build fails with "Out of memory"
**Solution**: Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 bun run build`

**Problem**: TypeScript errors after path alias changes
**Solution**: Restart TypeScript server in editor

#### Test Issues

**Problem**: Tests failing with module resolution errors
**Solution**: Check `bunfig.toml` preload configuration

**Problem**: MSW not intercepting requests
**Solution**: Ensure server is started in test setup

#### Performance Issues

**Problem**: Slow development server
**Solution**: Check for large files in src/, clear Bun cache

**Problem**: Large bundle size
**Solution**: Run `bun run analyze` and check for duplicates

### E. Migration Checklist

Use this checklist when executing the refactoring plan:

#### Phase 0 Checklist
- [ ] Bun installed and working
- [ ] All dependencies installed with Bun
- [ ] ESLint configured and passing
- [ ] Prettier configured
- [ ] EditorConfig set up
- [ ] Path aliases working
- [ ] Test infrastructure ready
- [ ] MSW mocking working
- [ ] Baseline tests passing
- [ ] Git hooks installed and working

#### Phase 1 Checklist
- [ ] Directory structure created
- [ ] Shared components moved
- [ ] ErrorBoundary implemented
- [ ] API client centralized
- [ ] Zod schemas created
- [ ] Criteria feature refactored
- [ ] Custom hooks extracted
- [ ] Import rules enforced
- [ ] All imports updated to use aliases
- [ ] App.tsx simplified

#### Phase 2 Checklist
- [ ] TanStack Query installed
- [ ] Query provider set up
- [ ] Criteria hooks created
- [ ] Filter hooks created
- [ ] Zustand installed
- [ ] Favorites store created
- [ ] Theme store created
- [ ] Filters store created
- [ ] Code splitting implemented
- [ ] Components refactored to use new hooks
- [ ] Test coverage 60%+

#### Phase 3 Checklist
- [ ] Bundle optimization configured
- [ ] Lighthouse CI set up
- [ ] Performance profiling done
- [ ] Accessibility audit complete
- [ ] Documentation written
- [ ] Test coverage 80%+
- [ ] Production build optimized
- [ ] All metrics meet targets

### F. Timeline Summary

| Phase | Duration | Risk | Dependencies |
|-------|----------|------|--------------|
| Phase 0: Foundation | 1-2 weeks | Medium | None |
| Phase 1: Architecture | 2-3 weeks | High | Phase 0 |
| Phase 2: State & Data | 2-3 weeks | Medium | Phase 1 |
| Phase 3: Polish | 2-3 weeks | Low | Phase 2 |
| **Total** | **8-11 weeks** | - | - |

### G. Resources

#### Documentation
- [Bun Documentation](https://bun.sh/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Zod](https://zod.dev/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [React Documentation](https://react.dev/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

#### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TanStack Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)

#### Learning
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React Patterns](https://reactpatterns.com/)
- [Web Performance](https://web.dev/performance/)
- [Web Accessibility](https://www.w3.org/WAI/fundamentals/accessibility-intro/)

---

## Conclusion

This refactoring plan provides a comprehensive, phased approach to modernizing the WCAG Explorer codebase. Each phase builds upon the previous one, with clear objectives, detailed tasks, verification checklists, and rollback procedures.

By following this plan, you'll achieve:

- Modern tooling with Bun
- Clean, layered architecture
- Robust state management
- Excellent performance
- High accessibility standards
- Comprehensive documentation
- 80%+ test coverage

The plan is designed to minimize risk through incremental changes, thorough testing, and the ability to rollback at any phase.

**Good luck with your refactoring!**

# WCAG Explorer - Claude Code Documentation

**Last Updated:** October 21, 2025
**Project Status:** Phase 1 Complete, Phase 2 In Progress
**Test Status:** 70/82 passing (85%)

## Quick Start

```bash
# Navigate to project
cd /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web

# Install dependencies
npm install

# Run development server
npm run dev
# → http://localhost:5173/

# Run tests
node --run test

# Type checking
npm run typecheck

# Lint
npm run lint
```

## Project Overview

**WCAG Explorer** is a React + TypeScript web application for exploring WCAG 2.2 success criteria with advanced filtering, search, tagging, and favorites functionality.

### Key Features
- 📊 Browse 87 WCAG 2.2 success criteria
- 🔍 Full-text search with 300ms debouncing
- 🏷️ Tag-based filtering (max 3 tags, 50+ available)
- ⭐ Favorites with localStorage persistence
- 🎨 Multiple view modes (List, Card, Grid)
- 🔗 URL-based state management
- ♿ WCAG 2.2 Level AA compliant
- 🌙 Dark mode + 4 theme options
- ⌨️ Keyboard shortcuts (/, f)

## Recent Major Work

### Phase 1: Architecture Refactor (COMPLETED ✅)

**Completion Date:** January 18, 2025
**Git Tag:** `phase-1-complete`
**Documentation:** `PHASE1_COMPLETION.md`

Successfully refactored monolithic App.tsx into modular architecture:

**Metrics:**
- App.tsx: 779 → 282 lines (64% reduction)
- Created: 9 custom hooks, 2 components, 2 utility modules
- Tests: 65/82 → 67/82 passing (maintained baseline)
- Zero regressions in browser

**Extractions:**
```
src/hooks/
├── useDelayedLoading.ts      # Prevents loading flash
├── useKeyboardShortcuts.ts   # Global shortcuts
├── useHashNavigation.ts      # Auto-scroll to #sc-*
├── useDocumentTitle.ts       # Dynamic titles
├── useSearch.ts              # Debounced search
├── useFavorites.ts           # Favorites management
├── useTagSelection.ts        # Tag state (max 3)
├── useResults.ts             # Data fetching
└── useURLSync.ts             # URL ↔ filters sync

src/components/
├── LoadingIndicator.tsx      # Reusable spinner
└── AppHeader.tsx             # Header extraction

src/lib/
├── tagUtils.ts               # Pure tag functions
└── resultsUtils.ts           # Pure result functions
```

### Phase 2: Test Improvements (IN PROGRESS)

**Current Status:** 70/82 passing (85%)
**Progress:** Fixed 5 tests (+6% improvement)

**Completed:**
- ✅ Fixed mock data versions (2.0 → 2.2)
- ✅ Fixed multiple searchbox queries
- ✅ Fixed multiple status role queries
- ✅ Updated query specificity

**Remaining (12 failures):**
- 9 App.test.tsx - element finding issues
- 2 Pagination.test.tsx - interaction/size tests
- 1 urlUtils.test.ts - round-trip test

### Recent Improvements (October 21, 2025)

**1. Fixed Critical Empty Filter Bug**
- **Issue:** Unchecking all filter checkboxes still showed results
- **Root Cause:** Empty arrays not sent to API, backend treated missing params as "show all"
- **Fix:** Added early return in `useResults.ts` to detect empty filter arrays and return zero results without API call
- **Impact:** Proper enforcement of filter requirements

**2. Externalized Content to Markdown Files**
- **Purpose:** Separate content from code for easier editing
- **Created 4 new markdown files:**
  - `/content/warnings/empty-versions.md`
  - `/content/warnings/empty-levels.md`
  - `/content/warnings/empty-principles.md`
  - `/content/help/no-results.md`
- **Refactored:** `ResultList.tsx` to load content dynamically with `marked.js`
- **Benefits:** Non-developers can edit warnings/tips, browser caching, cleaner code

**3. Documented Markdown Content Pattern**
- Added comprehensive documentation in CLAUDE.md
- Established standard pattern for future content externalization
- Components affected: `ResultList.tsx`, `Filters.tsx`

## Architecture

### Component Tree
```
App
├── LiveRegion (2x: polite + assertive)
├── LoadingIndicator
├── AppHeader
│   ├── Search input (main)
│   └── Favorites button
├── Filters (navigation)
│   ├── Version checkboxes
│   ├── Level checkboxes
│   ├── Principle checkboxes
│   └── Guideline search (secondary searchbox)
└── ResultList (main)
    ├── SelectedTagsPane
    ├── ViewToggle
    ├── Pagination (top)
    ├── CriterionCard/List/Grid
    └── Pagination (bottom)
```

### State Management

**Hook Composition Pattern:**
```typescript
// App.tsx orchestrates multiple hooks
const { searchInput, setSearchInput, handleSearchChange } = useSearch({ setFilters });
const { favorites, handleToggleFavorite } = useFavorites({ isFavoritesPage });
const { hideCollapsed, handleTagToggle } = useTagSelection({ filters, setFilters });
const { results, isLoading } = useResults({ filters, isFavoritesPage });
useURLSync({ filters, setFilters, setSearchInput });
```

### Key Design Patterns

**1. URL as Source of Truth**
- All filters synced to URL
- Bidirectional: URL → filters, filters → URL
- Loop prevention with `useRef` flag
- localStorage fallback for defaults

**2. Debounced Search**
```typescript
const debouncedSearch = useCallback(
  debounce((query: string) => {
    setFilters((prev) => ({ ...prev, q: query || undefined, page: 1 }));
  }, 300),
  [setFilters]
);
```

**3. Tag Selection (Max 3)**
```typescript
if (currentTags.length >= 3) {
  announce('Maximum 3 tags selected');
  return prev;
}
```

**4. Screen Reader Announcements**
```typescript
announce('12 results found');           // polite
announce('Error: Failed', 'assertive'); // urgent
```

## File Structure

```
src/
├── App.tsx                    # Main app (282 lines)
├── main.tsx                   # Entry point
├── components/               # UI components
│   ├── AppHeader.tsx         # Extracted header
│   ├── CriterionCard.tsx     # Card view item
│   ├── CriterionList.tsx     # Table view
│   ├── CriterionGrid.tsx     # Grid view
│   ├── Filters.tsx           # Filter sidebar
│   ├── LoadingIndicator.tsx  # Spinner
│   ├── Pagination.tsx        # Page navigation
│   ├── ResultList.tsx        # Result container
│   ├── SelectedTagsPane.tsx  # Active tags
│   ├── ViewToggle.tsx        # View mode switcher
│   └── __tests__/            # Component tests
├── hooks/                    # Custom hooks (9 files)
│   ├── useDelayedLoading.ts
│   ├── useDocumentTitle.ts
│   ├── useFavorites.ts
│   ├── useHashNavigation.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useResults.ts
│   ├── useSearch.ts
│   ├── useTagSelection.ts
│   └── useURLSync.ts
├── lib/                      # Business logic
│   ├── api.ts                # API client
│   ├── favorites.ts          # Favorites storage
│   ├── filterState.ts        # Filter persistence
│   ├── resultsUtils.ts       # Result counting
│   ├── tagUtils.ts           # Tag operations
│   ├── types.ts              # TypeScript types
│   ├── urlUtils.ts           # URL parsing/building
│   └── __tests__/            # Unit tests
├── tests/                    # Test setup
│   ├── mocks/
│   │   ├── handlers.ts       # MSW API mocks
│   │   └── server.ts         # MSW server
│   └── utils.tsx             # Test utilities
├── utils/                    # Utilities
│   └── announce.ts           # Screen reader
└── __tests__/                # Integration tests
    └── App.test.tsx
```

## Common Tasks

### Adding a New Hook

1. Create file in `src/hooks/use[Name].ts`
2. Export hook function with TypeScript types
3. Add to `App.tsx` imports
4. Call in App component body
5. Pass return values to children
6. Update CLAUDE.md and ARCHITECTURE.md

**Example:**
```typescript
// src/hooks/useExample.ts
import { useState } from 'react';

interface UseExampleOptions {
  initialValue: string;
}

interface UseExampleReturn {
  value: string;
  setValue: (v: string) => void;
}

export function useExample({ initialValue }: UseExampleOptions): UseExampleReturn {
  const [value, setValue] = useState(initialValue);
  return { value, setValue };
}
```

### Adding a New Component

1. Create `src/components/[Name].tsx`
2. Define props interface
3. Export default function
4. Import in parent component
5. Add tests in `__tests__/[Name].test.tsx`

### Running Specific Tests

```bash
# Single test file
node --run test -- src/__tests__/App.test.tsx

# Single test name (grep)
node --run test -- --grep "should load"

# Watch mode
node --run test -- --watch

# Coverage
node --run test -- --coverage
```

### Debugging

**Browser DevTools:**
- Open http://localhost:5173/
- React DevTools available
- Check Console for screen reader logs: `🔊 Screen Reader [POLITE]: ...`

**Test Debugging:**
```typescript
// In test file
import { screen } from '@testing-library/react';

// Print DOM
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));

// Use logRoles
import { logRoles } from '@testing-library/react';
logRoles(container);
```

## Known Issues

### Test Failures (12 remaining)

**App.test.tsx (9 failures)**
- Tests can't find "Non-text Content" text
- Issue: Possible view mode or rendering timing
- Impact: Integration tests failing
- Status: Under investigation

**Pagination.test.tsx (2 failures)**
- Page number click test fails
- Touch target size assertion fails
- Impact: Pagination component tests
- Status: Need to investigate Pagination rendering

**urlUtils.test.ts (1 failure)**
- URL round-trip test fails
- Issue: Parsed filters don't match expected
- Impact: URL utility tests
- Status: Need to check default filter merging

### Multiple Searchboxes Issue

**Problem:** Two searchboxes exist:
1. Main search in AppHeader (id="search", name="Search criteria")
2. Guideline filter in Filters (id="guideline-search", name="Search Guidelines")

**Solution:** Always use specific queries:
```typescript
// ❌ Wrong - ambiguous
screen.getByRole('searchbox')

// ✅ Correct - specific
screen.getByRole('searchbox', { name: 'Search criteria' })
```

### Multiple Status Roles

**Problem:** Multiple `role="status"` elements:
- LiveRegion (2x: polite + assertive)
- LoadingIndicator
- AppHeader status message

**Solution:** Use getAllByRole and filter:
```typescript
const liveRegions = screen.getAllByRole('status', { hidden: true });
const politeLiveRegion = liveRegions.find(
  (region) => region.getAttribute('aria-live') === 'polite'
);
```

## Testing

### Test Structure

```
src/
├── __tests__/
│   └── App.test.tsx              # Integration tests
├── components/__tests__/
│   ├── CriterionCard.test.tsx
│   ├── Filters.test.tsx
│   ├── Pagination.test.tsx
│   └── ...
├── lib/__tests__/
│   ├── favorites.test.ts
│   ├── filterState.test.ts
│   ├── urlUtils.test.ts
│   └── ...
└── tests/
    ├── mocks/
    │   ├── handlers.ts           # MSW mocks
    │   └── server.ts
    ├── setup.ts                  # Vitest setup
    └── utils.tsx                 # renderWithRouter
```

### Mock Data

**Location:** `src/tests/mocks/handlers.ts`

**Criteria:** 3 mock criteria (all version 2.2, level A):
- 1.1.1 Non-text Content (Perceivable)
- 1.3.1 Info and Relationships (Perceivable)
- 2.1.1 Keyboard (Operable)

**Important:** Mock criteria MUST match default filters:
- `version: '2.2'` (not 2.0 or 2.1)
- `level: 'A'` or `'AA'` (included in defaults)

### Test Utilities

```typescript
// tests/utils.tsx
import { renderWithRouter } from '../tests/utils';

// Render with router context
renderWithRouter(<App />);

// Render with specific route
renderWithRouter(<App />, { route: '/level:a/' });
```

## API & Data

### Endpoints

```typescript
GET /api/criteria              # List criteria
GET /api/criteria/:id          # Get single
GET /api/guidelines            # List guidelines
GET /api/principles            # List principles
GET /api/versions              # List versions
GET /api/levels                # List levels
```

### Query Parameters

```typescript
interface QueryFilters {
  q?: string;                   // Search query
  version?: string[];           // e.g., ['2.1', '2.2']
  level?: string[];             // e.g., ['A', 'AA']
  principle?: string[];         // e.g., ['Perceivable']
  guideline_id?: string;        // e.g., '1.1'
  tag_ids?: number[];           // e.g., [1, 2, 3]
  page?: number;                // Default: 1
  pageSize?: number;            // Default: 25
}
```

### Default Filters

```typescript
// lib/urlUtils.ts
{
  version: ['2.2'],
  level: ['A', 'AA'],
  page: 1,
  pageSize: 25
}
```

## Accessibility

### WCAG 2.2 Level AA Compliance

**Features:**
- Keyboard navigation (Tab, Enter, Space, /)
- Screen reader announcements (ARIA live regions)
- Skip links (Search, Filters, Results) - overlapping in top-left corner
- Descriptive labels and ARIA attributes
- Focus indicators with shapes (●■▲)
- Minimum touch target size (44x44px)
- Color contrast ratios meet AA
- Semantic HTML structure
- No-JavaScript fallback with `<noscript>` message

**Skip Links Implementation:**
- All three skip links positioned at same location (top-left: 0,0)
- Fixed dimensions: 200px × 44px (meets WCAG touch target)
- `position: fixed` ensures they stick to viewport
- Links appear one at a time when tabbing
- Overlay each other perfectly to avoid visual clutter

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `f` or `F` | Focus filters sidebar |
| `Tab` | Navigate focusable elements |
| `Enter/Space` | Activate buttons/links |
| `Enter` (in search) | Jump focus to first result heading |

**Search Field Behavior:**
- When typing in either search field (main or guideline search)
- Press `Enter` to move keyboard focus to the first H2 result heading
- Screen reader announces "Jumped to first result"
- H2 headings have `tabIndex={-1}` (focusable by JS, not in tab order)

### Screen Reader Support

**Announcements:**
```typescript
announce('12 results found');              // Polite
announce('Tag added');                     // Polite
announce('Error: Failed to load', 'assertive'); // Urgent
```

**Live Regions:**
- Polite: Results, filter changes, favorites
- Assertive: Errors, important state changes

### Text Nodes and Screen Reader Navigation

**Problem:** When mixing static text with JSX expressions in React, multiple text nodes are created in the DOM. This causes screen readers (especially VoiceOver) to fragment text during arrow-key navigation.

**Example Issue:**
```tsx
// ❌ Wrong - Creates 2 text nodes
<span>WCAG {version}</span>
// DOM: TextNode("WCAG ") + TextNode("2.0")
// Screen reader requires 2 arrow presses to read fully

// ❌ Wrong - Creates 3 text nodes
<span>{criterion.num} — {criterion.title}</span>
// DOM: TextNode("1.1.1") + TextNode(" — ") + TextNode("Non-text Content")
```

**Solution: Use Template Literals**
```tsx
// ✅ Correct - Creates 1 text node
<span>{`WCAG ${version}`}</span>
// DOM: TextNode("WCAG 2.0")
// Screen reader reads as single unit

// ✅ Correct - Combined into fewer nodes
<span>
  <span className="text-blue-600">{criterion.num}</span>
  {` — ${criterion.title}`}
</span>
// DOM: <span>TextNode("1.1.1")</span> + TextNode(" — Non-text Content")
```

**Why NOT role="text":**
- ❌ Not part of official ARIA spec (rejected from ARIA 1.1)
- ❌ Only proprietary VoiceOver support
- ❌ Can remove semantic values → WCAG failure
- ❌ Should be avoided in 2025+

**Best Practice (2025):**
Always use template literals for dynamic text to create single text nodes. This works universally across all screen readers and follows WCAG best practices.

**Affected Components:**
- `Filters.tsx` - Version labels, guideline titles, counts
- `CriterionCard.tsx` - H2 headings, sr-only text
- `CriterionGrid.tsx` - H2 headings
- Any label/text with dynamic content

### Markdown Content Pattern

**Purpose:** Externalize long-form text, warnings, and help content to markdown files for easier editing without code changes.

**Benefits:**
- Non-developers can edit content
- Browser caching for better performance
- Separation of content from code
- Consistent formatting via marked.js

**File Structure:**
```
public/content/
├── filters/
│   ├── version.md      # Filter help modals
│   ├── level.md
│   └── principle.md
├── warnings/
│   ├── wcag-22-only.md         # WCAG 2.2 warning
│   ├── empty-versions.md       # Empty filter warnings
│   ├── empty-levels.md
│   └── empty-principles.md
└── help/
    └── no-results.md   # Tips for no results
```

**Implementation Pattern:**
```tsx
// 1. State for HTML content
const [warningContent, setWarningContent] = useState<string>('');

// 2. Load markdown when needed
useEffect(() => {
  if (showWarning && !warningContent) {
    fetch('/content/warnings/example.md')
      .then((res) => res.text())
      .then((markdown) => marked(markdown))
      .then((html) => setWarningContent(html))
      .catch((err) => console.error('Failed to load warning:', err));
  }
}, [showWarning, warningContent]);

// 3. Render with dangerouslySetInnerHTML
{warningContent && (
  <div
    className="prose prose-sm max-w-none dark:prose-invert"
    dangerouslySetInnerHTML={{ __html: warningContent }}
  />
)}
```

**Components Using This Pattern:**
- `ResultList.tsx` - Empty filter warnings, no results tips, WCAG 2.2 warning
- `Filters.tsx` - Filter help modals (version, level, principle)

**Important Notes:**
- Always sanitize if user input involved (we don't have user input, so safe)
- Condition on both trigger AND content loaded (prevents refetching)
- Use Tailwind `prose` classes for consistent markdown styling
- Browser automatically caches .md files (no extra cache layer needed)

## Performance

### Bundle Size
- Target: <500KB initial
- Code splitting: Enabled
- Tree shaking: Enabled
- Current: TBD (need measurement)

### Optimizations
- 300ms debounced search
- Lazy loading for large lists
- LocalStorage caching
- Conditional rendering
- Memoization in hooks

## Dependencies

### Core
- React 18.3
- React Router DOM 7.1
- TypeScript 5.7

### UI
- Tailwind CSS 3.4
- FontAwesome (icons)
- Inter font (Google Fonts)

### Development
- Vite 6.0
- Vitest 2.1
- Testing Library (React, User Events)
- MSW 2.7 (API mocking)
- ESLint 9.18
- TypeScript ESLint 8.19

## Environment

### Supported Browsers
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Node Version
- Node.js 18+ required
- npm 9+ recommended
- Bun supported (but tests run with Node.js)

## Deployment

### Build

```bash
npm run build
# → dist/ folder
```

### Preview

```bash
npm run preview
# → http://localhost:4173/
```

### Production Checklist

- [ ] Run tests: `npm test`
- [ ] Type check: `npm run typecheck`
- [ ] Lint: `npm run lint`
- [ ] Build: `npm run build`
- [ ] Preview: `npm run preview`
- [ ] Lighthouse audit (target 90+ scores)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness check

## Git Workflow

### Branches
- `main` - Production-ready code
- Feature branches - `feature/[name]`
- Bug fixes - `fix/[name]`

### Commit Convention

```
type: subject line

Detailed description

Key points:
- Point 1
- Point 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** feat, fix, refactor, test, docs, chore, perf

### Tags
- `phase-1-complete` - Phase 1 refactor done
- Future: `v2.0.0`, `v2.1.0`, etc.

## Troubleshooting

### Tests Failing

**Mock data version mismatch:**
```typescript
// ❌ Wrong
version: '2.0'  // Won't match default filters

// ✅ Correct
version: '2.2'  // Matches default filters
```

**Multiple element queries:**
```typescript
// ❌ Wrong - ambiguous
screen.getByRole('searchbox')

// ✅ Correct - specific
screen.getByRole('searchbox', { name: 'Search criteria' })
```

### Dev Server Issues

**Port in use:**
```bash
# Kill existing processes
killall -9 node

# Or use different port
npm run dev -- --port 5174
```

**CORS errors:**
- Check API endpoint configuration
- Verify proxy settings in vite.config.ts

### Build Errors

**Type errors:**
```bash
npm run typecheck
# Fix all TypeScript errors first
```

**ESLint errors:**
```bash
npm run lint
# Fix linting issues or add exceptions
```

## Next Steps

### Phase 2: Test Coverage (IN PROGRESS)
- [ ] Fix remaining 12 test failures
- [ ] Add hook unit tests
- [ ] Improve coverage to 60%+
- [ ] Add integration tests for critical flows
- [ ] Document test patterns

### Phase 3: Performance & Polish
- [ ] Bundle size optimization (<500KB)
- [ ] Lighthouse CI setup (90+ scores)
- [ ] Performance profiling
- [ ] WCAG 2.2 AAA audit
- [ ] Fix ESLint warnings (69 remaining)
- [ ] Reach 80%+ test coverage
- [ ] Documentation updates

### Future Enhancements
- [ ] Offline support (Service Worker)
- [ ] Export criteria (PDF, CSV)
- [ ] Share favorites via URL
- [ ] Custom tag creation
- [ ] Advanced search operators
- [ ] Comparison view
- [ ] Print-friendly styles

## Resources

### Documentation
- `PHASE1_COMPLETION.md` - Phase 1 summary
- `docs/ARCHITECTURE.md` - Architecture guide
- `docs/DECISIONS/` - ADRs
- `README.md` - Project overview

### External Links
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Testing Library](https://testing-library.com/react)
- [Vitest](https://vitest.dev/)

## Contact

For questions or issues:
1. Check this CLAUDE.md
2. Check PHASE1_COMPLETION.md
3. Check docs/ARCHITECTURE.md
4. Review git commit history
5. Check GitHub issues

---

**Last Major Update:** January 18, 2025 - Phase 1 completion + Phase 2 progress
**Next Review:** After Phase 2 completion

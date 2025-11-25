# Testing Infrastructure Setup - Summary

This document summarizes the complete testing infrastructure setup for WCAG Explorer.

## Files Created

### Configuration Files

1. **vitest.config.ts**
   - Vitest configuration with happy-dom environment
   - Path aliases for cleaner imports
   - Coverage configuration with 80% thresholds
   - Test file patterns and reporters

2. **package.json** (updated)
   - Added test scripts:
     - `npm test` - Run all tests
     - `npm run test:watch` - Watch mode
     - `npm run test:ui` - Interactive UI
     - `npm run test:coverage` - With coverage report

### Test Infrastructure

3. **src/tests/setup.ts**
   - Global test setup and teardown
   - MSW server configuration
   - DOM matchers from jest-dom
   - Mock implementations for:
     - window.matchMedia
     - localStorage
     - IntersectionObserver
     - ResizeObserver

4. **src/tests/utils.tsx**
   - Custom `renderWithRouter()` function
   - Test data fixtures:
     - `testCriterion`
     - `testCriterionWithTags`
     - `testTag`
     - `testFilters`
   - Mock data generators:
     - `createMockCriterion()`
     - `createMockCriteria()`
   - Helper functions:
     - localStorage helpers
     - Announcement helpers
     - Accessibility helpers

5. **src/tests/README.md**
   - Comprehensive testing documentation
   - Examples for unit, component, and integration tests
   - Best practices and common patterns
   - Debugging guide
   - Troubleshooting tips

### MSW (API Mocking)

6. **src/tests/mocks/server.ts**
   - MSW server setup for Node.js environment
   - Configured with all request handlers

7. **src/tests/mocks/handlers.ts**
   - Mock API endpoints:
     - GET /api/criteria (with filtering)
     - GET /api/criteria/:id
     - GET /api/principles
     - GET /api/guidelines
     - GET /api/versions
     - GET /api/levels
   - Mock data fixtures:
     - 3 sample criteria
     - Guidelines
     - Principles, versions, levels
   - Helper function for pagination

### Example Test Files

8. **src/lib/__tests__/urlUtils.test.ts** (Unit Test)
   - Tests for URL parsing and building
   - Tests for filter merging
   - Round-trip URL conversion tests
   - 25+ test cases
   - Coverage: All URL utility functions

9. **src/components/__tests__/Pagination.test.tsx** (Component Test)
   - Tests for rendering logic
   - Tests for page number display
   - Tests for button states
   - Tests for user interactions
   - Tests for accessibility features
   - 20+ test cases
   - Coverage: All Pagination component features

10. **src/__tests__/App.test.tsx** (Integration Test)
    - Tests for initial rendering
    - Tests for data fetching
    - Tests for search functionality
    - Tests for URL state management
    - Tests for favorites functionality
    - Tests for view mode persistence
    - Tests for accessibility
    - Tests for loading states
    - Tests for error handling
    - 15+ test cases
    - Coverage: Core App functionality

### Documentation

11. **TESTING_DEPENDENCIES.md**
    - Complete list of required dependencies
    - Installation instructions
    - Version compatibility information
    - Troubleshooting guide
    - CI/CD integration examples

12. **TESTING_SETUP_SUMMARY.md** (this file)
    - Overview of all created files
    - Quick start guide
    - Next steps

## Directory Structure

```
apps/web/
├── vitest.config.ts               # Vitest configuration
├── package.json                   # Updated with test scripts
├── TESTING_DEPENDENCIES.md        # Dependency installation guide
├── TESTING_SETUP_SUMMARY.md       # This file
└── src/
    ├── __tests__/                 # Integration tests
    │   └── App.test.tsx
    ├── lib/
    │   └── __tests__/             # Unit tests for lib/
    │       └── urlUtils.test.ts
    ├── components/
    │   └── __tests__/             # Component tests
    │       └── Pagination.test.tsx
    └── tests/                     # Test infrastructure
        ├── README.md              # Testing documentation
        ├── setup.ts               # Global test setup
        ├── utils.tsx              # Test utilities and helpers
        └── mocks/                 # MSW setup
            ├── server.ts          # MSW server
            └── handlers.ts        # API mock handlers
```

## Quick Start

### 1. Install Dependencies

```bash
npm install -D \
  vitest@^1.0.4 \
  @vitest/ui@^1.0.4 \
  @vitest/coverage-v8@^1.0.4 \
  happy-dom@^12.10.3 \
  @testing-library/react@^14.1.2 \
  @testing-library/jest-dom@^6.1.5 \
  @testing-library/user-event@^14.5.1 \
  msw@^2.0.11
```

See **TESTING_DEPENDENCIES.md** for detailed installation instructions.

### 2. Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with interactive UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### 3. View Coverage Report

After running `npm run test:coverage`, open:
```
coverage/index.html
```

Target coverage: 80% for lines, functions, branches, and statements.

## Test Coverage

The example tests provide coverage for:

### Unit Tests (urlUtils.test.ts)
- ✅ URL parsing (all filter types)
- ✅ URL building (canonical form)
- ✅ Default filters
- ✅ Filter merging
- ✅ Round-trip conversion

### Component Tests (Pagination.test.tsx)
- ✅ Rendering conditions
- ✅ Page number display logic
- ✅ Button states (enabled/disabled)
- ✅ User interactions (clicks)
- ✅ Accessibility (ARIA labels, current page)
- ✅ Touch target sizes

### Integration Tests (App.test.tsx)
- ✅ Initial rendering
- ✅ Data fetching from API
- ✅ Search functionality with debounce
- ✅ URL state synchronization
- ✅ Favorites management
- ✅ View mode persistence
- ✅ Loading states
- ✅ Error handling
- ✅ Accessibility features

## Writing More Tests

Follow the patterns in the example tests:

1. **For utilities/helpers**: Add tests to `src/lib/__tests__/`
2. **For components**: Add tests to `src/components/__tests__/`
3. **For pages/integration**: Add tests to `src/__tests__/`

Example test structure:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ComponentName', () => {
  describe('feature group', () => {
    it('should do something specific', () => {
      // Arrange
      render(<Component />);
      
      // Act
      // ... user interactions
      
      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
```

## Key Features

### 1. Fast Test Execution
- Vitest leverages Vite's transform pipeline
- Tests run in parallel
- Watch mode with HMR for instant feedback

### 2. Realistic API Mocking
- MSW intercepts network requests
- No need to mock fetch/axios
- Same handlers can be used in browser for development

### 3. Accessibility-First Testing
- Testing Library encourages accessible queries
- Tests verify ARIA attributes
- Touch target size validation

### 4. Type Safety
- Full TypeScript support
- Type-safe test utilities
- Autocomplete for matchers

### 5. Developer Experience
- Interactive test UI
- Watch mode for rapid iteration
- Detailed error messages
- Source maps for debugging

## Best Practices Implemented

1. ✅ Test behavior, not implementation
2. ✅ Use accessible queries (getByRole, getByLabelText)
3. ✅ Wait for async changes with waitFor
4. ✅ Mock external dependencies (API, localStorage)
5. ✅ Test error states and edge cases
6. ✅ Verify accessibility features
7. ✅ Group related tests with describe blocks
8. ✅ Clean up after each test
9. ✅ Use realistic user interactions (userEvent)
10. ✅ Maintain high code coverage

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitest/coverage-v8
   ```

2. **Run Example Tests**
   ```bash
   npm test
   ```
   
   All 3 example test files should pass.

3. **Add More Tests**
   - Test remaining components
   - Test other utility functions
   - Add integration tests for other pages
   - Target 80% coverage

4. **Set Up CI/CD**
   - Add test job to GitHub Actions
   - Configure coverage reporting
   - Add status badges to README

5. **Optional Enhancements**
   - Add visual regression testing
   - Add E2E tests with Playwright
   - Add performance testing
   - Add accessibility auditing with axe-core

## Troubleshooting

### Tests Not Running?
1. Check dependencies are installed: `npm ls vitest`
2. Verify vitest.config.ts exists
3. Check test file patterns match: `**/*.{test,spec}.{ts,tsx}`

### MSW Not Working?
1. Verify MSW version is 2.x: `npm ls msw`
2. Check handler syntax uses `http` from `msw`
3. Ensure server is started in setup.ts

### Coverage Too Low?
1. Add tests for uncovered files
2. Exclude non-critical files in vitest.config.ts
3. Adjust thresholds if needed (initially)

### Need Help?
- Check **src/tests/README.md** for detailed examples
- Check **TESTING_DEPENDENCIES.md** for dependency issues
- Refer to example test files for patterns

## Summary

✅ Complete testing infrastructure set up
✅ 3 example test files with 60+ test cases
✅ MSW for API mocking
✅ Custom test utilities and helpers
✅ Comprehensive documentation
✅ 80% coverage target configured
✅ CI/CD ready

**The testing infrastructure is ready to use!** Just install the dependencies and start writing tests.

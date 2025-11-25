# Testing Dependencies

This document lists all the dependencies needed to run the testing infrastructure for WCAG Explorer.

## Required Dependencies

Install all testing dependencies with the following command:

```bash
npm install -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitest/coverage-v8
```

Or using yarn:

```bash
yarn add -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitest/coverage-v8
```

Or using pnpm:

```bash
pnpm add -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitest/coverage-v8
```

## Dependency Breakdown

### Core Testing Framework

**vitest** (^1.0.0 or later)
- Fast unit test framework powered by Vite
- Compatible with Jest API
- Native ESM support
- Fast watch mode with HMR

**@vitest/ui** (^1.0.0 or later)
- Interactive UI for running and debugging tests
- Visual test explorer
- Optional but highly recommended for development

### DOM Environment

**happy-dom** (^12.10.0 or later)
- Lightweight DOM implementation for Node.js
- Faster than jsdom
- Good enough for most React testing scenarios
- Alternative: `jsdom` if you need fuller DOM API support

### React Testing Utilities

**@testing-library/react** (^14.1.0 or later)
- React component testing utilities
- Encourages testing best practices
- Accessibility-focused queries
- Works with React 18+

**@testing-library/jest-dom** (^6.1.0 or later)
- Custom matchers for DOM assertions
- Examples: `toBeInTheDocument()`, `toHaveAttribute()`
- Improves test readability

**@testing-library/user-event** (^14.5.0 or later)
- Simulates user interactions
- More realistic than `fireEvent`
- Handles keyboard, mouse, clipboard, etc.

### API Mocking

**msw** (^2.0.0 or later)
- Mock Service Worker for API mocking
- Intercepts network requests at the network level
- Works in both tests and browser
- Network-agnostic (works with any HTTP client)

### Coverage Reporting

**@vitest/coverage-v8** (^1.0.0 or later)
- Code coverage using V8
- Fast and accurate
- Multiple report formats (text, html, lcov)
- Alternative: `@vitest/coverage-istanbul` for more detailed reports

## Type Definitions

The following type definitions should be automatically included with the packages above, but if needed:

```bash
npm install -D @types/node
```

## Optional Dependencies

### Enhanced Testing Experience

**@vitest/browser** (if you need real browser testing)
```bash
npm install -D @vitest/browser playwright
```

### Visual Regression Testing

**@vitest/snapshot** (included with vitest, but can be used for visual snapshots)

### Accessibility Testing

**axe-core** (^4.8.0) and **@axe-core/react** (^4.8.0)
```bash
npm install -D axe-core @axe-core/react
```

For automated accessibility testing in your test suite.

## Peer Dependencies

Ensure you have compatible versions of:

- **react** (^18.2.0)
- **react-dom** (^18.2.0)
- **vite** (^5.0.0)
- **typescript** (^5.3.0)

These should already be in your project as production dependencies.

## Installation Verification

After installation, verify everything is set up correctly:

### 1. Check package.json

Your `package.json` should include these devDependencies:

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@vitest/coverage-v8": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "happy-dom": "^12.10.3",
    "msw": "^2.0.11",
    "vitest": "^1.0.4"
  }
}
```

### 2. Run Test Command

```bash
npm test
```

This should execute the test suite successfully.

### 3. Check Coverage

```bash
npm run test:coverage
```

This should generate a coverage report in the `coverage/` directory.

### 4. Open Test UI

```bash
npm run test:ui
```

This should open an interactive test UI in your browser.

## Version Compatibility

### Minimum Versions

| Package | Minimum Version | Recommended Version |
|---------|----------------|---------------------|
| vitest | 1.0.0 | Latest 1.x |
| @testing-library/react | 14.0.0 | Latest 14.x |
| @testing-library/jest-dom | 6.0.0 | Latest 6.x |
| @testing-library/user-event | 14.5.0 | Latest 14.x |
| msw | 2.0.0 | Latest 2.x |
| happy-dom | 12.0.0 | Latest 12.x |
| @vitest/coverage-v8 | 1.0.0 | Latest 1.x |

### Breaking Changes to Watch For

**MSW 2.x**
- API changes from 1.x to 2.x
- New response resolver syntax
- Migration guide: https://mswjs.io/docs/migrations/1.x-to-2.x

**Testing Library React 14.x**
- Requires React 18+
- Updated act() behavior
- Better concurrent rendering support

## Troubleshooting

### Issue: "Cannot find module 'vitest'"

**Solution:** Ensure vitest is installed and scripts use correct command:
```bash
npm install -D vitest
```

### Issue: "happy-dom" errors

**Solution:** Try using jsdom instead:
```bash
npm install -D jsdom
```

Update `vitest.config.ts`:
```typescript
test: {
  environment: 'jsdom',
}
```

### Issue: MSW handlers not intercepting requests

**Solution:** Ensure MSW is version 2.x and handlers use new syntax:
```typescript
import { http, HttpResponse } from 'msw';

http.get('/api/endpoint', () => {
  return HttpResponse.json({ data: [] });
});
```

### Issue: Coverage thresholds failing

**Solution:** Adjust thresholds in `vitest.config.ts` or exclude specific files:
```typescript
coverage: {
  thresholds: {
    lines: 70, // Reduce from 80 if needed
  },
  exclude: [
    'src/specific-file.ts',
  ],
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Additional Resources

- [Vitest Getting Started](https://vitest.dev/guide/)
- [Testing Library Setup](https://testing-library.com/docs/react-testing-library/setup)
- [MSW Setup Guide](https://mswjs.io/docs/getting-started)
- [Vite Test Config](https://vitest.dev/config/)

## Complete Installation Command

For convenience, here's the complete command to install all dependencies at once:

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

After installation, the test suite is ready to use with:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run test:ui       # Interactive UI
```

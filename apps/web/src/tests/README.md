# Testing Infrastructure

This directory contains the testing setup and utilities for WCAG Explorer.

## Overview

The testing infrastructure uses:
- **Vitest** - Fast unit test framework powered by Vite
- **React Testing Library** - Testing utilities for React components
- **MSW (Mock Service Worker)** - API mocking for tests
- **happy-dom** - Lightweight DOM implementation for tests

## Directory Structure

```
src/tests/
├── README.md          # This file
├── setup.ts           # Global test setup and configuration
├── utils.tsx          # Custom render functions and test helpers
└── mocks/
    ├── server.ts      # MSW server setup
    └── handlers.ts    # API request handlers and mock data
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI (interactive)
npm run test:ui
```

## Writing Tests

### Unit Tests

For testing pure functions and utilities:

```typescript
import { describe, it, expect } from 'vitest';
import { parseURL } from '../urlUtils';

describe('urlUtils', () => {
  it('should parse URL correctly', () => {
    const result = parseURL('/level:a/', '');
    expect(result).toEqual({ level: ['A'] });
  });
});
```

### Component Tests

For testing React components:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<MyComponent onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });
});
```

### Integration Tests

For testing components with routing:

```typescript
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../tests/utils';
import App from '../App';

describe('App', () => {
  it('should load and display data', async () => {
    renderWithRouter(<App />);

    await waitFor(() => {
      expect(screen.getByText('Non-text Content')).toBeInTheDocument();
    });
  });
});
```

## Test Utilities

### Custom Render Function

Use `renderWithRouter` for components that need React Router:

```typescript
import { renderWithRouter } from '../tests/utils';

renderWithRouter(<App />, { route: '/level:a/' });
```

### Mock Data Fixtures

Pre-built test data is available in `utils.tsx`:

```typescript
import {
  testCriterion,
  testCriterionWithTags,
  testFilters,
  createMockCriteria
} from '../tests/utils';

const criteria = createMockCriteria(10); // Generate 10 mock criteria
```

### API Mocking

MSW automatically mocks API calls. To customize responses in specific tests:

```typescript
import { server } from '../tests/mocks/server';
import { http, HttpResponse } from 'msw';

// Override a specific endpoint
server.use(
  http.get('/api/criteria', () => {
    return HttpResponse.json({ items: [], total: 0 });
  })
);
```

### localStorage Helpers

```typescript
import { setLocalStorage, getLocalStorage } from '../tests/utils';

setLocalStorage('key', { value: 'data' });
const data = getLocalStorage('key');
```

## Coverage Goals

We aim for 80% coverage across:
- Lines
- Functions
- Branches
- Statements

View coverage reports after running:
```bash
npm run test:coverage
```

Reports are generated in `coverage/` directory.

## Best Practices

### 1. Test Behavior, Not Implementation

Focus on what the user sees and does:

```typescript
// Good - tests user-facing behavior
expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
await user.click(screen.getByRole('button', { name: 'Submit' }));

// Avoid - tests implementation details
expect(component.state.isSubmitting).toBe(true);
```

### 2. Use Accessible Queries

Prefer queries that reflect how users interact:

```typescript
// Preferred (in order)
screen.getByRole('button', { name: 'Click me' })
screen.getByLabelText('Email')
screen.getByText('Welcome')
screen.getByDisplayValue('Current value')

// Less preferred
screen.getByTestId('submit-button')
```

### 3. Wait for Async Changes

Always wait for async updates:

```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### 4. Clean Up Side Effects

Tests are automatically cleaned up, but be mindful of:
- Event listeners
- Timers
- Network requests

```typescript
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.clearAllTimers();
  vi.restoreAllMocks();
});
```

### 5. Test Accessibility

Include accessibility checks in component tests:

```typescript
it('should have proper ARIA labels', () => {
  render(<Pagination currentPage={1} totalPages={5} />);

  expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination');
  expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
});
```

### 6. Group Related Tests

Use `describe` blocks to organize tests:

```typescript
describe('Component', () => {
  describe('rendering', () => {
    it('should render heading', () => {});
    it('should render navigation', () => {});
  });

  describe('interactions', () => {
    it('should handle clicks', () => {});
    it('should handle keyboard', () => {});
  });
});
```

## Common Patterns

### Testing Forms

```typescript
const user = userEvent.setup();
const input = screen.getByLabelText('Search');

await user.type(input, 'test query');
await user.click(screen.getByRole('button', { name: 'Submit' }));

await waitFor(() => {
  expect(screen.getByText('Results')).toBeInTheDocument();
});
```

### Testing Loading States

```typescript
import { http, HttpResponse, delay } from 'msw';
import { server } from '../tests/mocks/server';

server.use(
  http.get('/api/data', async () => {
    await delay(600);
    return HttpResponse.json({ data: [] });
  })
);

render(<Component />);

expect(screen.getByText('Loading...')).toBeInTheDocument();

await waitFor(() => {
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

### Testing Error States

```typescript
server.use(
  http.get('/api/data', () => {
    return HttpResponse.json({ error: 'Failed' }, { status: 500 });
  })
);

render(<Component />);

await waitFor(() => {
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

## Debugging Tests

### View Test UI

```bash
npm run test:ui
```

### Debug Specific Test

```typescript
import { screen } from '@testing-library/react';

// Print the entire DOM
screen.debug();

// Print a specific element
screen.debug(screen.getByRole('button'));
```

### Run Single Test File

```bash
npm test -- src/lib/__tests__/urlUtils.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "pagination"
```

## Troubleshooting

### Test Timeout

If tests timeout, increase the timeout:

```typescript
it('should handle slow operation', async () => {
  // ... test code
}, 15000); // 15 second timeout
```

### Async Updates Warning

If you see "not wrapped in act()" warnings, ensure you're waiting for updates:

```typescript
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

### MSW Handlers Not Working

Check that:
1. Server is started in setup.ts
2. Handlers match the exact URL pattern
3. Handlers return proper responses

```typescript
// In your test
import { server } from '../tests/mocks/server';

server.printHandlers(); // Debug registered handlers
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

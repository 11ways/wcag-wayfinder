# Testing Quick Reference

## Install Dependencies

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8 happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

## Run Tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open interactive test UI |
| `npm run test:coverage` | Run tests with coverage report |

## File Locations

| Type | Location | Example |
|------|----------|---------|
| Unit tests | `src/lib/__tests__/` | `urlUtils.test.ts` |
| Component tests | `src/components/__tests__/` | `Pagination.test.tsx` |
| Integration tests | `src/__tests__/` | `App.test.tsx` |
| Test utilities | `src/tests/` | `setup.ts`, `utils.tsx` |
| Mock data | `src/tests/mocks/` | `handlers.ts` |

## Common Test Patterns

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Test with User Interaction

```typescript
import userEvent from '@testing-library/user-event';

it('should handle click', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  render(<Button onClick={onClick} />);
  await user.click(screen.getByRole('button'));

  expect(onClick).toHaveBeenCalled();
});
```

### Test with Router

```typescript
import { renderWithRouter } from '../tests/utils';

it('should navigate', () => {
  renderWithRouter(<App />, { route: '/level:a/' });
  // ... assertions
});
```

### Test with Async Data

```typescript
import { waitFor } from '@testing-library/react';

it('should load data', async () => {
  render(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Mock API Response

```typescript
import { server } from '../tests/mocks/server';
import { http, HttpResponse } from 'msw';

it('should handle custom response', async () => {
  server.use(
    http.get('/api/data', () => {
      return HttpResponse.json({ items: [] });
    })
  );

  render(<Component />);
  // ... assertions
});
```

## Useful Queries (in order of preference)

```typescript
// 1. By Role (most accessible)
screen.getByRole('button', { name: 'Submit' })
screen.getByRole('heading', { level: 1 })

// 2. By Label
screen.getByLabelText('Email')

// 3. By Text
screen.getByText('Welcome')

// 4. By Display Value
screen.getByDisplayValue('Current value')

// 5. By Alt Text
screen.getByAltText('Profile picture')

// 6. By Test ID (last resort)
screen.getByTestId('custom-element')
```

## Common Matchers

```typescript
// Presence
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Visibility
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// Attributes
expect(element).toHaveAttribute('aria-label', 'Close')
expect(element).toHaveClass('active')

// Form elements
expect(input).toHaveValue('text')
expect(checkbox).toBeChecked()
expect(button).toBeDisabled()

// Text content
expect(element).toHaveTextContent('Hello')
expect(element).toContainHTML('<span>Test</span>')
```

## Test Data Fixtures

```typescript
import {
  testCriterion,
  testCriterionWithTags,
  testTag,
  testFilters,
  createMockCriterion,
  createMockCriteria
} from '../tests/utils';

const criterion = createMockCriterion({ level: 'AA' });
const criteria = createMockCriteria(10);
```

## Debugging

```typescript
// Print DOM
screen.debug()

// Print specific element
screen.debug(screen.getByRole('button'))

// Get all roles (helpful for finding elements)
screen.logTestingPlaygroundURL()
```

## Coverage Targets

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Key Files to Read

1. `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/tests/README.md` - Full testing guide
2. `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/TESTING_DEPENDENCIES.md` - Dependency info
3. `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/lib/__tests__/urlUtils.test.ts` - Unit test example
4. `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/components/__tests__/Pagination.test.tsx` - Component test example
5. `/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web/src/__tests__/App.test.tsx` - Integration test example

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout: `it('test', async () => {}, 15000)` |
| MSW not working | Check MSW version is 2.x: `npm ls msw` |
| Act warning | Wrap in `waitFor(() => { ... })` |
| Can't find element | Use `screen.logTestingPlaygroundURL()` |
| Import errors | Check path aliases in `vitest.config.ts` |

## Resources

- Vitest: https://vitest.dev/
- Testing Library: https://testing-library.com/react
- MSW: https://mswjs.io/
- Common Mistakes: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

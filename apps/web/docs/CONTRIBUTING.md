# Contributing to WCAG Explorer

Thank you for your interest in contributing to WCAG Explorer! This project aims to make WCAG success criteria more accessible and searchable for everyone. We welcome contributions from developers of all skill levels.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Available Scripts](#available-scripts)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Format](#commit-message-format)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Code Review Checklist](#code-review-checklist)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh/)** (latest version) - Our primary JavaScript runtime and package manager
  ```bash
  # Install Bun on macOS, Linux, or WSL
  curl -fsSL https://bun.sh/install | bash

  # Or on Windows
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```
- **Node.js 18+** (optional, for some dev tools compatibility)
- **Git** for version control
- A modern code editor (we recommend VS Code with TypeScript support)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/wcag-explorer.git
cd wcag-explorer
```

### 2. Install Dependencies

```bash
bun install
```

This will install all dependencies for the monorepo workspace, including both the web app and API packages.

### 3. Set Up the Database

Run database migrations to create the SQLite database schema:

```bash
bun run db:migrate
```

Seed the database with WCAG criteria data:

```bash
bun run db:seed
```

### 4. Start Development Servers

```bash
bun run dev
```

This will start both:
- **API server** at http://localhost:8787
- **Web app** at http://localhost:5173

You should now be able to access the WCAG Explorer in your browser!

## Project Structure

```
wcag-explorer/
├── apps/
│   ├── api/                    # Bun HTTP server (API backend)
│   │   ├── src/
│   │   │   ├── index.ts       # Main server entry point
│   │   │   └── routes/        # API route handlers
│   │   └── package.json
│   │
│   ├── admin/                  # Admin interface (if applicable)
│   │
│   └── web/                    # Vite + React frontend
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── pages/         # Page-level components
│       │   ├── lib/           # Utility functions and helpers
│       │   ├── utils/         # General utilities
│       │   ├── App.tsx        # Main app component
│       │   ├── main.tsx       # Entry point
│       │   └── index.css      # Global styles
│       ├── public/            # Static assets
│       ├── dist/              # Build output (generated)
│       ├── docs/              # Documentation (you are here!)
│       ├── index.html         # HTML template
│       ├── vite.config.ts     # Vite configuration
│       ├── tailwind.config.js # Tailwind CSS configuration
│       ├── tsconfig.json      # TypeScript configuration
│       └── package.json
│
├── packages/
│   └── db/                     # SQLite database package
│       ├── src/
│       │   ├── client.ts      # Database client
│       │   ├── migrate.ts     # Migration script
│       │   ├── seed.ts        # Seeding script
│       │   └── schema.sql     # Database schema
│       └── package.json
│
├── data/
│   ├── wcag.json              # Source WCAG data
│   └── wcag.sqlite            # Generated SQLite database
│
├── tests/
│   └── e2e/                   # Playwright E2E tests
│       └── *.spec.ts          # Test files
│
├── package.json               # Root workspace package.json
├── playwright.config.ts       # Playwright test configuration
├── vitest.config.ts           # Vitest unit test configuration
└── README.md                  # Project readme
```

### Key Directories

- **`apps/web/src/components/`**: Reusable React components (Filters, Pagination, Modal, etc.)
- **`apps/web/src/pages/`**: Top-level page components
- **`apps/web/src/lib/`**: Business logic, API clients, type definitions, and utilities
- **`packages/db/`**: Database layer with migrations and seeding

## Development Workflow

1. **Create a feature branch** from `main` (see [Branch Naming Conventions](#branch-naming-conventions))
2. **Make your changes** following our [Code Style Guidelines](#code-style-guidelines)
3. **Write tests** for new features or bug fixes
4. **Run tests locally** to ensure everything passes
5. **Commit your changes** using [Conventional Commits](#commit-message-format)
6. **Push your branch** and create a pull request
7. **Address review feedback** and iterate as needed

## Available Scripts

### Root-level Scripts

Run these from the project root (`/wcag-explorer/`):

| Script | Description |
|--------|-------------|
| `bun run dev` | Start both API and web dev servers concurrently |
| `bun run dev:api` | Start only the API server |
| `bun run dev:web` | Start only the web development server |
| `bun run build` | Build the web app for production |
| `bun run db:migrate` | Run database migrations |
| `bun run db:seed` | Seed the database with WCAG data |
| `bun test` | Run unit tests |
| `bun run test:e2e` | Run Playwright E2E tests |

### Web App Scripts

Run these from `/apps/web/`:

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Vite dev server (port 5173) |
| `bun run build` | Type-check with `tsc` and build with Vite |
| `bun run preview` | Preview production build locally |

### Linting & Formatting

While not currently defined in package.json, we recommend:

```bash
# Type checking
cd apps/web && bun run build  # Runs tsc before build

# Format code (if you set up Prettier)
bunx prettier --write "src/**/*.{ts,tsx,css}"

# Lint code (if you set up ESLint)
bunx eslint src --ext .ts,.tsx
```

## Code Style Guidelines

### TypeScript

- **Use TypeScript strict mode** - Already enabled in `tsconfig.json`
- **Define explicit types** for function parameters and return values
- **Avoid `any`** - Use `unknown` or proper types instead
- **Use interfaces** for object shapes, `type` for unions/primitives

Example:
```typescript
// Good
interface FilterOptions {
  principle?: string;
  level?: string;
  version?: string;
}

function filterCriteria(options: FilterOptions): Criterion[] {
  // Implementation
}

// Avoid
function filterCriteria(options: any): any {
  // Implementation
}
```

### React

- **Use functional components** with hooks
- **Keep components focused** - Single responsibility principle
- **Extract reusable logic** into custom hooks
- **Use meaningful prop names** and destructure props

Example:
```typescript
// Good
interface CriterionCardProps {
  criterion: Criterion;
  onSelect: (id: string) => void;
}

export function CriterionCard({ criterion, onSelect }: CriterionCardProps) {
  // Component implementation
}
```

### Styling

- **Use Tailwind CSS** utility classes for styling
- **Follow mobile-first approach** - Base styles for mobile, then use `md:`, `lg:` breakpoints
- **Maintain consistency** with existing design patterns
- **Use semantic color names** from the Tailwind config

Example:
```typescript
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
  Click me
</button>
```

### File Organization

- **One component per file** - File name should match component name
- **Group related files** in the same directory
- **Use index files** to simplify imports when appropriate
- **Keep files under 300 lines** - Extract into smaller modules if needed

### Naming Conventions

- **Components**: PascalCase (e.g., `CriterionCard.tsx`)
- **Utilities/Hooks**: camelCase (e.g., `useFavorites.ts`, `debounce.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `const API_BASE_URL = '...'`)
- **Interfaces/Types**: PascalCase (e.g., `interface Criterion { ... }`)

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for clear and meaningful commit history.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates, etc.
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI/CD configuration

### Scope (optional)

The scope indicates what part of the codebase is affected:
- `filters`
- `search`
- `pagination`
- `modal`
- `api`
- `db`
- `a11y` (accessibility)
- `ui`

### Examples

```bash
# Adding a new feature
feat(filters): add guideline filter dropdown

# Fixing a bug
fix(search): prevent empty search queries from being submitted

# Improving accessibility
feat(a11y): add ARIA live region for search result announcements

# Documentation
docs: update installation instructions in README

# Refactoring
refactor(api): simplify criterion query builder

# Performance improvement
perf(search): debounce search input to reduce API calls
```

## Branch Naming Conventions

Use descriptive branch names that follow this pattern:

```
<type>/<short-description>
```

### Branch Types

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### Examples

```bash
feature/add-version-filter
fix/pagination-reset-bug
docs/update-contributing-guide
refactor/extract-filter-logic
test/add-modal-accessibility-tests
chore/update-dependencies
```

### Tips

- Use lowercase and hyphens
- Keep it concise but descriptive
- Avoid issue numbers in branch names (put them in commits instead)

## Pull Request Process

### Before Submitting

1. **Ensure your code builds** without errors
   ```bash
   cd apps/web && bun run build
   ```

2. **Run all tests** and ensure they pass
   ```bash
   bun test
   bun run test:e2e
   ```

3. **Check for accessibility issues** - Test with:
   - Keyboard navigation (Tab, Enter, Escape, Arrow keys)
   - Screen reader (NVDA, JAWS, VoiceOver)
   - Browser dev tools accessibility audit

4. **Update documentation** if you've changed APIs or added features

5. **Rebase on latest main** to avoid merge conflicts
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### PR Template

When creating a pull request, include:

**Title**: Follow conventional commit format (e.g., `feat: add version filter`)

**Description**:
```markdown
## What does this PR do?
Brief description of the changes

## Why are these changes needed?
Explain the motivation behind the changes

## How has this been tested?
- [ ] Unit tests
- [ ] E2E tests
- [ ] Manual testing
- [ ] Accessibility testing (keyboard, screen reader)

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Accessibility requirements met
- [ ] No console errors or warnings
```

### Review Process

1. At least one maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

## Testing Requirements

### Unit Tests

- Write unit tests for **utility functions** and **business logic**
- Use **Vitest** for unit testing
- Place tests next to the code they test: `utils.ts` → `utils.test.ts`
- Aim for **high coverage** on critical paths

Example:
```typescript
// debounce.test.ts
import { describe, it, expect, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  it('should delay function execution', () => {
    // Test implementation
  });
});
```

### E2E Tests

- Write E2E tests for **user flows** and **critical features**
- Use **Playwright** for E2E testing
- Include **accessibility checks** with axe-core
- Tests live in `/tests/e2e/`

Example:
```typescript
// search.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('search functionality works correctly', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await page.fill('input[type="search"]', 'contrast');
  await page.click('button[type="submit"]');

  await expect(page.locator('[data-testid="results"]')).toBeVisible();

  // Accessibility check
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Manual Testing Checklist

Before submitting a PR, manually test:

- [ ] Feature works as expected in Chrome, Firefox, Safari
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Screen reader announces content correctly
- [ ] No console errors or warnings
- [ ] Dark mode (if applicable) renders correctly

## Accessibility Guidelines

WCAG Explorer is itself a tool for accessibility, so we hold ourselves to the highest standards.

### Core Principles

We aim to meet **WCAG 2.2 Level AAA** where possible, but at minimum **Level AA**.

### Accessibility Requirements

#### Keyboard Navigation

- **All interactive elements** must be keyboard accessible
- **Visible focus indicators** required (use `focus:ring-2` or similar)
- **Logical tab order** - follows visual flow
- **Keyboard shortcuts** should not conflict with browser/screen reader shortcuts
- **Skip links** provided for main content areas

Example:
```typescript
<button
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
  onClick={handleClick}
>
  Submit
</button>
```

#### ARIA and Semantics

- **Use semantic HTML** first (button, nav, main, etc.)
- **ARIA labels** for icons and non-text controls
- **ARIA live regions** for dynamic content updates
- **Proper heading hierarchy** (h1 → h2 → h3, no skipping)
- **Landmarks** for page regions (main, nav, aside, footer)

Example:
```typescript
<button aria-label="Close modal" onClick={onClose}>
  <FontAwesomeIcon icon={faTimes} aria-hidden="true" />
</button>

<div role="status" aria-live="polite" aria-atomic="true">
  {resultsCount} results found
</div>
```

#### Visual Design

- **Color contrast**: Minimum 4.5:1 for text, 3:1 for UI components
- **Focus indicators**: Minimum 3:1 contrast against background
- **Touch targets**: Minimum 44x44px for interactive elements
- **Text resize**: Support up to 200% zoom without breaking layout
- **Reduced motion**: Respect `prefers-reduced-motion` preference

Example:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Screen Reader Support

- **Alternative text** for images
- **Form labels** properly associated with inputs
- **Error messages** linked to form fields
- **Dynamic announcements** via ARIA live regions
- **Hidden decorative elements** with `aria-hidden="true"`

### Testing Tools

- **axe DevTools** browser extension
- **NVDA** (Windows) or **VoiceOver** (macOS/iOS)
- **JAWS** (Windows)
- **Keyboard only** navigation
- **Browser accessibility audits** (Chrome/Firefox DevTools)

## Code Review Checklist

Use this checklist when reviewing pull requests:

### Functionality

- [ ] Code accomplishes the intended purpose
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs or logic errors

### Code Quality

- [ ] Code is readable and well-organized
- [ ] Functions/components are appropriately sized
- [ ] No unnecessary complexity
- [ ] TypeScript types are correct and meaningful
- [ ] No `any` types unless absolutely necessary

### Testing

- [ ] Unit tests added/updated for new logic
- [ ] E2E tests added for new user flows
- [ ] All tests pass
- [ ] Test coverage is adequate

### Accessibility

- [ ] Keyboard navigation works
- [ ] Focus management is correct
- [ ] ARIA attributes are appropriate
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader testing completed
- [ ] No axe violations

### Performance

- [ ] No unnecessary re-renders
- [ ] API calls are optimized (debounced, cached, etc.)
- [ ] Large lists use virtualization if needed
- [ ] Images are optimized and appropriately sized

### Documentation

- [ ] Code comments explain "why" not "what"
- [ ] Complex logic is documented
- [ ] Public APIs have JSDoc comments
- [ ] README/docs updated if needed

### Style

- [ ] Follows project coding conventions
- [ ] Consistent with existing code patterns
- [ ] No linting errors or warnings
- [ ] Formatting is consistent

## Troubleshooting

### Common Issues

#### Bun Installation Problems

**Issue**: `bun: command not found`

**Solution**:
```bash
# Reinstall Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (if not automatic)
export PATH="$HOME/.bun/bin:$PATH"
```

#### Database Issues

**Issue**: `Error: no such table: criteria`

**Solution**: Run migrations and seed the database:
```bash
bun run db:migrate
bun run db:seed
```

**Issue**: Database locked or corrupted

**Solution**: Delete and recreate the database:
```bash
rm data/wcag.sqlite
bun run db:migrate
bun run db:seed
```

#### Port Already in Use

**Issue**: `Error: Port 5173 already in use`

**Solution**: Kill the process using the port:
```bash
# Find process using port 5173
lsof -ti:5173

# Kill the process
kill -9 $(lsof -ti:5173)

# Or use a different port
cd apps/web && PORT=3000 bun run dev
```

#### Type Errors

**Issue**: TypeScript errors after pulling latest changes

**Solution**: Reinstall dependencies and clear cache:
```bash
rm -rf node_modules
rm -f bun.lockb
bun install
```

#### Build Failures

**Issue**: Build fails with "out of memory" error

**Solution**: Increase Node memory limit:
```bash
NODE_OPTIONS=--max-old-space-size=4096 bun run build
```

#### E2E Test Failures

**Issue**: Playwright tests fail to run

**Solution**: Install Playwright browsers:
```bash
bunx playwright install
```

**Issue**: Tests pass locally but fail in CI

**Solution**: Check browser versions and ensure dev servers are running:
```bash
# Make sure both servers are started before tests
bun run dev:api &
bun run dev:web &
sleep 5  # Wait for servers to start
bun run test:e2e
```

### Getting Help

If you encounter issues not covered here:

1. **Check existing issues** on GitHub
2. **Search documentation** in the `/docs` directory
3. **Ask in discussions** - Create a GitHub Discussion
4. **Open an issue** - Provide:
   - Your operating system and version
   - Bun version (`bun --version`)
   - Node version (`node --version`)
   - Complete error message
   - Steps to reproduce

## Thank You!

We appreciate your contributions to making WCAG guidelines more accessible to everyone. Your efforts help developers worldwide build more inclusive web experiences.

Happy coding, and thank you for helping make the web more accessible!

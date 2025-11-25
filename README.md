# WCAG Explorer

A fully accessible web application for searching and filtering WCAG (Web Content Accessibility Guidelines) success criteria. Built with Bun, Vite, React, and SQLite with full-text search.

## Features

- **Full-text search** across WCAG criteria using SQLite FTS5
- **Advanced filtering** by Principle, Level, Guideline, and Version
- **Fully accessible** with keyboard navigation, screen reader support, and WCAG compliance
- **Dark mode** support with system color-scheme preference
- **Responsive design** with mobile-first approach
- **Fast performance** with code-splitting and optimized bundles

## Tech Stack

- **Runtime:** Bun
- **Frontend:** Vite + React + TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite with FTS5
- **API:** Lightweight Bun HTTP server
- **Testing:** Vitest (unit) + Playwright (E2E) + axe-core (a11y)

## Project Structure

```
wcag-explorer/
├── apps/
│   ├── api/          # Bun HTTP server
│   └── web/          # Vite + React frontend
├── packages/
│   └── db/           # SQLite wrapper + migrations + seed
├── data/
│   ├── wcag.json     # Source WCAG data
│   └── wcag.sqlite   # Generated database (after migration/seed)
└── tests/
    └── e2e/          # Playwright tests
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) latest version
- Node.js 18+ (for some dev tools)

### Installation

1. Install dependencies:

```bash
bun install
```

2. Run database migrations:

```bash
bun run db:migrate
```

3. Seed the database with WCAG data:

```bash
bun run db:seed
```

4. Start the development servers:

```bash
bun run dev
```

This will start:
- API server at http://localhost:8787
- Web app at http://localhost:5173

### Build for Production

```bash
bun run build
```

## Testing

### Unit Tests

```bash
bun test
```

### E2E Tests (with accessibility checks)

```bash
bun run test:e2e
```

## API Endpoints

- `GET /api/criteria` - Query criteria with filters
  - Query params: `q`, `principle`, `guideline_id`, `level`, `version`, `page`, `pageSize`
- `GET /api/criteria/:id` - Get single criterion
- `GET /api/principles` - List all principles
- `GET /api/guidelines` - List all guidelines
- `GET /api/versions` - List all versions
- `GET /api/levels` - List all levels (A, AA, AAA)

## Accessibility Features

- ✅ Keyboard-operable with visible focus indicators
- ✅ ARIA labels and landmarks throughout
- ✅ Screen reader announcements for dynamic updates
- ✅ High contrast mode support (4.5:1 text, 3:1 UI)
- ✅ Respects `prefers-reduced-motion`
- ✅ Large touch targets (44×44px minimum)
- ✅ Proper heading hierarchy and semantic HTML
- ✅ Skip links for keyboard users
- ✅ Works at 200% zoom and 320px viewport width

## Documentation

See the [docs/](./docs/) folder for detailed documentation:

- [Quick Start Guide](./docs/QUICKSTART.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/FULL_DEPLOYMENT_GUIDE.md)
- [Project Status](./docs/PROJECT_STATUS.md)

For web app development, see [apps/web/CLAUDE.md](./apps/web/CLAUDE.md).

## Data Source

WCAG data sourced from [W3C WCAG 2.2](https://www.w3.org/WAI/WCAG22/).

## License

Data: [W3C Document License](https://www.w3.org/copyright/document-license/)

Code: MIT (or your preferred license)

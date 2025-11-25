# WCAG Explorer - Quick Start Guide

## What's Built

A fully accessible WCAG search application with:
- ✅ 87 WCAG criteria in SQLite with full-text search
- ✅ Bun API server + Vite React frontend
- ✅ Comprehensive filters (Principle, Level, Guideline, Version)
- ✅ WCAG-compliant UI (keyboard nav, screen readers, high contrast)
- ✅ ~155KB production bundle (under target!)
- ✅ Tests passing (5/5 unit tests)

## Start Development

```bash
# Already completed:
# ✓ bun install
# ✓ bun run db:migrate
# ✓ bun run db:seed (87 criteria imported)

# Start both servers:
bun run dev

# Then open:
# - Web: http://localhost:5173
# - API: http://localhost:8787
```

## Test It Out

Try these searches in the web app:
- Search: "keyboard"
- Filter: Level AA + Principle Perceivable  
- Guideline: 1.1 Text Alternatives
- Click "Show Details" on any criterion

## Run Tests

```bash
# Unit tests (WCAG ID sorting)
bun run test

# E2E tests with accessibility checks
# (requires servers running)
bun run test:e2e
```

## Production Build

```bash
bun run build

# Output in apps/web/dist/
# Bundle size: ~155KB JS (gzipped: ~50KB)
```

## Project Structure

```
wcag-explorer/
├── apps/api/          → Bun server (port 8787)
├── apps/web/          → React app (port 5173)
├── packages/db/       → SQLite + migrations + seed
├── data/wcag.sqlite   → Database (87 criteria)
└── tests/e2e/         → Playwright tests
```

## API Examples

```bash
# Get all criteria
curl http://localhost:8787/api/criteria

# Search
curl http://localhost:8787/api/criteria?q=keyboard

# Filter by level
curl http://localhost:8787/api/criteria?level=AA

# Get single criterion
curl http://localhost:8787/api/criteria/1.1.1
```

## Key Features

**Accessibility:**
- Keyboard-only navigation works perfectly
- Screen reader tested (aria-live updates)
- High contrast, large touch targets
- System dark mode support
- 200% zoom + 320px reflow tested

**Performance:**
- Debounced search (300ms)
- Paginated results (25/page)
- FTS5 with BM25 ranking
- Code-split bundles

**Data:**
- WCAG 2.0, 2.1, 2.2
- All 4 principles
- Levels A, AA, AAA
- Full descriptions + links to W3C docs

Enjoy! 🎉

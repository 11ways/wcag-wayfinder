# Walkthrough Mode

A fully accessible, framework-agnostic onboarding tour system for web applications.

## Features

- **Zero Dependencies** (except DOM APIs, marked.js, and DOMPurify)
- **Framework Agnostic** - Works with React, Vue, vanilla JS, or any web framework
- **Fully Accessible** - WCAG 2.2 Level AA compliant
- **Keyboard Navigation** - Complete keyboard control
- **Screen Reader Support** - ARIA live regions and proper labeling
- **Responsive** - Works on mobile and desktop
- **Customizable** - CSS variables for easy theming
- **Session Persistence** - Auto-saves progress
- **Smart Positioning** - Automatic collision detection and viewport fitting
- **Reduced Motion Support** - Respects prefers-reduced-motion
- **RTL Support** - Right-to-left language support
- **Dark Mode** - Built-in dark mode support

## Installation

### 1. Copy Files

Copy the walkthrough directory to your project:

```
src/walkthrough/
├── index.ts
├── types.ts
├── overlay.ts
├── tooltip.ts
├── positioning.ts
├── accessibility.ts
├── markdown.ts
└── styles.css
```

### 2. Install Dependencies

The walkthrough system requires `marked` and `dompurify` for markdown parsing and sanitization:

```bash
npm install marked dompurify
npm install --save-dev @types/dompurify
```

### 3. Import Styles

Import the CSS in your main application file:

```typescript
import './walkthrough/styles.css';
```

Or include it in your HTML:

```html
<link rel="stylesheet" href="/src/walkthrough/styles.css" />
```

### 4. Add Classes to Target Elements

Add classes to the elements you want to highlight in your tour:

```html
<header class="walkthrough-1">...</header>
<main class="walkthrough-2">...</main>
<aside class="walkthrough-3">...</aside>
```

The numeric suffix determines the order. Elements can have multiple classes.

### 5. Create Markdown Content

Create markdown files for each step in `/public/content/walkthrough/`:

```
public/content/walkthrough/
├── step-1.md
├── step-2.md
└── step-3.md
```

Example `step-1.md`:

```markdown
# Welcome!

This is your first step in the walkthrough tour.

## What to expect

- Navigate with **Next** and **Previous** buttons
- Use keyboard shortcuts (`Enter`, `Esc`)
- Your progress is automatically saved
```

## Usage

### Basic Example

```typescript
import { walkthrough } from './walkthrough';

// Start the tour
document.getElementById('startTour').addEventListener('click', () => {
  walkthrough.start();
});
```

### With Options

```typescript
walkthrough.start({
  selectorPrefix: 'walkthrough-', // Default
  startAt: 1, // Start at step 1
  onStart: (totalSteps) => {
    console.log(`Tour started with ${totalSteps} steps`);
  },
  onStepChange: (current, total) => {
    console.log(`Step ${current} of ${total}`);
  },
  onExit: (completed) => {
    console.log('Tour exited. Completed:', completed);
  },
  markdownPath: (n) => `/content/walkthrough/step-${n}.md`,
});
```

### Resume Tour

The walkthrough automatically saves progress to `sessionStorage`. To resume:

```typescript
// Simply call start() again
walkthrough.start(); // Will resume from saved step
```

### Manual Navigation

```typescript
// Next step
walkthrough.next();

// Previous step
walkthrough.prev();

// Go to specific step
walkthrough.goTo(3);

// Exit tour
walkthrough.exit();
```

### Check Status

```typescript
// Check if active
if (walkthrough.isActive()) {
  console.log('Tour is running');
}

// Get current state
const { current, total } = walkthrough.getState();
console.log(`Currently on step ${current} of ${total}`);
```

## API Reference

### `walkthrough.start(options?)`

Starts the walkthrough tour.

**Options:**

| Option           | Type                                   | Default                             | Description                          |
| ---------------- | -------------------------------------- | ----------------------------------- | ------------------------------------ |
| `selectorPrefix` | `string`                               | `'walkthrough-'`                    | CSS class prefix for target elements |
| `startAt`        | `number`                               | `1`                                 | Starting step number (1-based)       |
| `onStart`        | `(totalSteps: number) => void`         | `undefined`                         | Called when tour starts              |
| `onStepChange`   | `(current: number, total: number) => void` | `undefined`                         | Called when step changes             |
| `onExit`         | `(completed: boolean) => void`         | `undefined`                         | Called when tour exits               |
| `markdownPath`   | `(n: number) => string`                | `n => /content/walkthrough/step-${n}.md` | Generates markdown file path         |

**Returns:** `Promise<void>`

### `walkthrough.next()`

Advances to the next step.

### `walkthrough.prev()`

Goes to the previous step.

### `walkthrough.goTo(stepNumber)`

Jumps to a specific step (1-based).

**Parameters:**

- `stepNumber` (number): The step to jump to

### `walkthrough.exit()`

Exits the walkthrough tour.

### `walkthrough.isActive()`

Returns whether the tour is currently active.

**Returns:** `boolean`

### `walkthrough.getState()`

Gets the current state of the walkthrough.

**Returns:** `{ current: number; total: number }`

## Keyboard Shortcuts

| Key                  | Action          |
| -------------------- | --------------- |
| `Enter` or `Space`   | Next step       |
| `Shift` + `Enter`    | Previous step   |
| `Esc`                | Exit walkthrough |
| `Tab`                | Navigate buttons |

## Accessibility Features

### WCAG 2.2 Level AA Compliance

- **Keyboard Accessible** - Full keyboard navigation
- **Screen Reader Support** - ARIA live regions announce step changes
- **Focus Management** - Focus trap within tooltip dialog
- **Semantic HTML** - Proper use of roles and landmarks
- **Color Contrast** - 4.5:1 contrast ratio
- **Touch Targets** - 44x44px minimum (WCAG 2.2)
- **Reduced Motion** - Respects `prefers-reduced-motion`
- **High Contrast Mode** - Enhanced borders in high contrast mode

### ARIA Attributes

The tooltip dialog includes:

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby="wt-title"`
- `aria-describedby="wt-body"`
- ARIA live region with `aria-live="polite"`

### Focus Trapping

Focus is automatically trapped within the tooltip when active. Tab key cycles through:

1. Exit button
2. Previous button
3. Next button

### Screen Reader Announcements

Step changes are announced automatically:

```
"Step 2 of 5: Navigation Features"
```

## Theming

The walkthrough uses CSS custom properties for easy theming.

### CSS Variables

Override these in your stylesheet:

```css
:root {
  /* Colors */
  --wt-color-primary: #3b82f6;
  --wt-color-primary-hover: #2563eb;
  --wt-color-secondary: #6b7280;
  --wt-color-text: #1f2937;
  --wt-color-bg: #ffffff;
  --wt-color-border: #e5e7eb;
  --wt-color-scrim: rgba(0, 0, 0, 0.5);
  --wt-color-highlight: #3b82f6;

  /* Spacing */
  --wt-spacing-md: 1rem;
  --wt-spacing-lg: 1.5rem;

  /* Typography */
  --wt-font-family: system-ui, sans-serif;
  --wt-font-size-base: 1rem;

  /* Dimensions */
  --wt-tooltip-width: 24rem;
  --wt-border-radius: 0.5rem;

  /* Shadows */
  --wt-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* Z-index */
  --wt-z-scrim: 9998;
  --wt-z-highlight: 9999;
  --wt-z-tooltip: 10000;
}
```

### Dark Mode

Dark mode is automatically applied based on `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --wt-color-text: #f9fafb;
    --wt-color-bg: #1f2937;
    --wt-color-border: #374151;
  }
}
```

### Custom Theme Example

```css
/* Brand colors */
:root {
  --wt-color-primary: #8b5cf6; /* Purple */
  --wt-color-primary-hover: #7c3aed;
  --wt-color-highlight: #8b5cf6;
  --wt-tooltip-width: 28rem; /* Wider tooltip */
  --wt-border-radius: 1rem; /* More rounded */
}
```

## Advanced Usage

### Custom Markdown Path

Organize markdown files differently:

```typescript
walkthrough.start({
  markdownPath: (n) => `/help/onboarding/chapter-${n}.md`,
});
```

### Custom Selector Prefix

Use a different class naming convention:

```typescript
walkthrough.start({
  selectorPrefix: 'tour-step-',
});
```

```html
<div class="tour-step-1">First step</div>
<div class="tour-step-2">Second step</div>
```

### Track Analytics

```typescript
walkthrough.start({
  onStepChange: (current, total) => {
    analytics.track('Walkthrough Step Viewed', {
      step: current,
      total: total,
      progress: (current / total) * 100,
    });
  },
  onExit: (completed) => {
    analytics.track('Walkthrough Exited', {
      completed: completed,
      completionRate: completed ? 100 : 0,
    });
  },
});
```

### Conditional Steps

Show different walkthroughs based on user type:

```typescript
const isNewUser = user.isNew;

if (isNewUser) {
  walkthrough.start({
    selectorPrefix: 'beginner-',
  });
} else {
  walkthrough.start({
    selectorPrefix: 'advanced-',
  });
}
```

## Edge Cases Handled

### Hidden Elements

If a target element is hidden (`display: none`, `visibility: hidden`, etc.), the walkthrough automatically skips to the next visible step.

### Off-Screen Elements

Elements outside the viewport are automatically scrolled into view with smooth scrolling (respecting `prefers-reduced-motion`).

### Non-Sequential Step Numbers

Steps don't need to be sequential:

```html
<div class="walkthrough-1">...</div>
<div class="walkthrough-5">...</div>
<div class="walkthrough-10">...</div>
```

The system automatically sorts and orders them correctly.

### Missing Markdown Files

If a markdown file fails to load, a fallback message is displayed:

```
"Content for step N could not be loaded."
```

### Duplicate Step Numbers

If multiple elements have the same step number, the first visible one is used.

### Viewport Overflow

The tooltip automatically repositions itself to avoid viewport overflow, trying placements in this order:

1. Right
2. Bottom
3. Left
4. Top

If none fit, it clamps to the viewport edges.

## Performance

### Optimizations

- Markdown files are fetched on-demand and cached
- Uses `ResizeObserver` and `MutationObserver` for efficient repositioning
- Automatic cleanup prevents memory leaks
- CSS transitions are disabled when `prefers-reduced-motion` is enabled

### Memory Management

All observers and event listeners are automatically cleaned up when the walkthrough exits:

- `ResizeObserver` disconnected
- `MutationObserver` disconnected
- Event listeners removed
- DOM elements removed
- ARIA live regions unmounted

## Browser Support

Tested and working on:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari (latest)
- Chrome Mobile (latest)

Requires:

- ES6+ support
- ResizeObserver API
- MutationObserver API
- sessionStorage API

## Testing

Run the test suite:

```bash
npm test -- src/walkthrough/__tests__/walkthrough.test.ts
```

### Test Coverage

The test suite covers:

- ✅ Initialization and discovery
- ✅ Navigation (next, prev, goTo)
- ✅ Keyboard interaction
- ✅ UI elements and ARIA attributes
- ✅ Session storage persistence
- ✅ Edge cases (hidden elements, missing files, etc.)
- ✅ Accessibility features
- ✅ Focus management

## Demo

To view the demo:

```bash
npm run dev
```

Then navigate to `/walkthrough-demo.html`

## Troubleshooting

### Tour doesn't start

- **Check elements:** Ensure elements with `walkthrough-*` classes exist in the DOM
- **Check visibility:** Elements must be visible (not `display: none`)
- **Check console:** Look for warnings about missing steps

### Markdown not loading

- **Check path:** Verify markdown files exist at the correct path
- **Check fetch:** Ensure fetch API is available
- **Check CORS:** Markdown files must be served from the same origin

### Styles not applying

- **Import CSS:** Make sure `styles.css` is imported
- **Check z-index:** Ensure no other elements have higher z-index than `--wt-z-tooltip` (10000)
- **Check conflicts:** Look for CSS conflicts with your app styles

### Focus not trapping

- **Check dialog:** Ensure tooltip has `role="dialog"`
- **Check buttons:** Verify all buttons are focusable
- **Check tab order:** Test with `Tab` key

## Migration Guide

### From Manual Tours

If you're currently using a manual tour implementation:

1. **Replace with classes:**

   ```html
   <!-- Before -->
   <div id="step-1" data-tour-step="1">...</div>

   <!-- After -->
   <div class="walkthrough-1">...</div>
   ```

2. **Move content to markdown:**

   Create `/public/content/walkthrough/step-N.md` files

3. **Replace tour logic:**

   ```typescript
   // Before
   tourSystem.start();

   // After
   walkthrough.start();
   ```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Code Style:** Follow existing patterns
2. **Tests:** Add tests for new features
3. **Accessibility:** Maintain WCAG 2.2 Level AA compliance
4. **Documentation:** Update README for API changes

## License

MIT License - See LICENSE file for details

## Credits

Built with:

- [marked](https://github.com/markedjs/marked) - Markdown parser
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitizer

---

**Questions or issues?** Please file an issue on GitHub.

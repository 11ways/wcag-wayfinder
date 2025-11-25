# Reduce Motion Feature - Implementation Summary

**Date:** October 21, 2025
**Status:** ✅ Complete and Tested

## Overview

A comprehensive "Reduce Motion" setting has been added to the Settings page that allows users to override their system's reduce motion preference. This is particularly useful for users who have reduce motion enabled system-wide but want to enable animations specifically for the WCAG Wayfinder application (or vice versa).

## What Was Implemented

### 1. OS Detection & System Preference Detection

**File:** `src/lib/accessibilitySettings.ts`

Added functions to:
- Detect the user's operating system (macOS, Windows, Linux, Other)
- Check if system has `prefers-reduced-motion` enabled
- Store and retrieve user's override preference in localStorage
- Calculate the effective reduce motion state (system + override)
- Apply the setting via a `data-reduce-motion` attribute on the body element

**Key Functions:**
```typescript
detectOS(): OperatingSystem
getSystemReducedMotion(): boolean
getReduceMotionOverride(): boolean | null
setReduceMotionOverride(enabled: boolean | null): void
getEffectiveReducedMotion(): boolean
applyReducedMotion(): void
getReduceMotionSettingsURL(os: OperatingSystem): string | null
```

### 2. Settings Page UI

**File:** `src/pages/SettingsPage.tsx`

Added a new "Reduce Motion" section that includes:

#### When System Has Reduce Motion Enabled:
- **Blue info box** stating: "Important: You have Reduce Motion enabled in your macOS/Windows Settings"
- **Link to system settings** (clickable, opens system preferences)
  - macOS: Opens System Settings → Accessibility → Display
  - Windows: Opens Settings → Accessibility → Visual effects
- **Path guide** showing where to find the setting in system preferences

#### Toggle Control:
- **Switch button** (ARIA role="switch")
- Shows current state: "Enabled" or "Disabled"
- Shows "(Override active)" label when user has overridden system preference

#### Override Notification:
- **Yellow info box** when override is active
- Explains current state vs system preference
- Example: "Animations are enabled even though your system has reduce motion turned on."

### 3. CSS Integration

**File:** `src/walkthrough/styles.css`

Updated the walkthrough module CSS to respect the body data attribute:

```css
/* System preference */
@media (prefers-reduced-motion: reduce) {
  .walkthrough-scrim {
    transition: none;
  }
}

/* User override - takes precedence */
body[data-reduce-motion='true'] .walkthrough-scrim {
  transition: none;
}

body[data-reduce-motion='false'] .walkthrough-scrim {
  transition: opacity var(--wt-transition-duration) var(--wt-transition-easing);
}
```

This pattern was applied to:
- `.walkthrough-scrim` - Page overlay
- `.walkthrough-highlight--animate` - Target highlighting
- `.walkthrough-tooltip` - Tooltip dialog

### 4. JavaScript Integration

**File:** `src/walkthrough/accessibility.ts`

Updated the `prefersReducedMotion()` function to check the body data attribute first:

```typescript
export function prefersReducedMotion(): boolean {
  // Check for user override first
  const bodyDataAttr = document.body.getAttribute('data-reduce-motion');

  if (bodyDataAttr === 'true') {
    return true;
  }

  if (bodyDataAttr === 'false') {
    return false;
  }

  // Fall back to system preference
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

### 5. App Initialization

**File:** `src/main.tsx`

Added call to `applyReducedMotion()` on app startup to ensure the body data attribute is set before any components render:

```typescript
import { applyReducedMotion } from './lib/accessibilitySettings';

// Apply reduce motion setting on app initialization
applyReducedMotion();
```

## How It Works

### Logic Flow:

1. **On App Load:**
   - `applyReducedMotion()` is called in `main.tsx`
   - Checks localStorage for user override
   - If no override, checks system `prefers-reduced-motion`
   - Sets `data-reduce-motion` attribute on body element

2. **In Settings Page:**
   - Detects user's OS
   - Checks system `prefers-reduced-motion` preference
   - Loads user's override preference from localStorage
   - Displays appropriate messaging based on OS and system state

3. **When User Toggles:**
   - If system has reduce motion ON and user toggles:
     - First toggle: Sets override to `false` (enables animations)
     - Second toggle: Removes override (uses system preference)
   - If system has reduce motion OFF and user toggles:
     - First toggle: Sets override to `true` (disables animations)
     - Second toggle: Removes override (uses system preference)
   - Updates body data attribute immediately
   - Announces change to screen readers

4. **CSS Cascade Priority:**
   ```
   body[data-reduce-motion] selectors (highest priority)
   ↓
   @media (prefers-reduced-motion: reduce)
   ↓
   Default transitions (lowest priority)
   ```

## OS-Specific Features

### macOS
- **Detection:** Checks for Mac, iPhone, iPad, iPod in platform/userAgent
- **Settings URL:** `x-apple.systempreferences:com.apple.preference.universalaccess?Seeing_Display`
- **Path Guide:** System Settings → Accessibility → Display → Reduce motion

### Windows
- **Detection:** Checks for Win/Windows in platform/userAgent
- **Settings URL:** `ms-settings:easeofaccess-display`
- **Path Guide:** Settings → Accessibility → Visual effects → Animation effects

### Linux/Other
- **Detection:** Checks for Linux or falls back to "Other"
- **Settings URL:** Not available (shows "System Settings" without link)
- **Path Guide:** Not shown

## Example Usage

### Scenario 1: macOS User with System Reduce Motion ON

**Initial State:**
- System: Reduce motion enabled ✓
- Override: None
- **Result:** Animations disabled

**After First Toggle:**
- System: Reduce motion enabled ✓
- Override: false (enable animations)
- **Result:** Animations enabled ✓
- **UI Shows:** Yellow box "You are overriding your system preference. Animations are enabled even though your system has reduce motion turned on."

**After Second Toggle:**
- System: Reduce motion enabled ✓
- Override: None
- **Result:** Animations disabled (back to system preference)
- **UI Shows:** Blue box "Important: You have Reduce Motion enabled in your macOS Settings."

### Scenario 2: Windows User with System Reduce Motion OFF

**Initial State:**
- System: Reduce motion disabled
- Override: None
- **Result:** Animations enabled

**After First Toggle:**
- System: Reduce motion disabled
- Override: true (disable animations)
- **Result:** Animations disabled ✓
- **UI Shows:** Yellow box "Reduce motion is enabled even though your system has it turned off."

## Data Attribute Usage

Other parts of the application can use the `data-reduce-motion` attribute in CSS:

```css
/* Disable transitions when reduce motion is enabled */
body[data-reduce-motion='true'] .my-animated-element {
  transition: none;
  animation: none;
}

/* Force enable transitions when reduce motion is explicitly disabled */
body[data-reduce-motion='false'] .my-animated-element {
  transition: all 0.3s ease;
}

/* Or use it in JavaScript */
const shouldReduceMotion = document.body.getAttribute('data-reduce-motion') === 'true';
```

## Accessibility Features

✅ **ARIA Support:**
- Toggle uses `role="switch"`
- Properly labeled with `aria-checked`
- Screen reader only text for context

✅ **Screen Reader Announcements:**
- "Reduce motion enabled - animations disabled"
- "Reduce motion disabled - animations enabled"
- "Reduce motion enabled - using system preference"

✅ **Keyboard Navigation:**
- Toggle is fully keyboard accessible
- Focus indicators visible
- Tab order logical

✅ **Visual Feedback:**
- Blue info box for system preference notification
- Yellow warning box for override state
- Toggle switch shows enabled/disabled state
- "(Override active)" label when applicable

## Storage

**Key:** `wcag-explorer-reduce-motion-override`

**Values:**
- `"true"` - Reduce motion enabled (override)
- `"false"` - Reduce motion disabled (override)
- `null` - Use system preference (no override)

## Testing

### Manual Testing Checklist

- [x] macOS with system reduce motion ON
  - [x] Shows blue info box
  - [x] Link opens System Settings
  - [x] Toggle works correctly
  - [x] Override state shown
  - [x] Body data attribute updates

- [x] macOS with system reduce motion OFF
  - [x] No info box shown
  - [x] Toggle works correctly
  - [x] Can enable reduce motion manually

- [x] Windows detection works
  - [x] Shows Windows-specific messaging
  - [x] Link format is correct

- [x] Walkthrough animations
  - [x] Disabled when reduce motion ON
  - [x] Enabled when reduce motion OFF
  - [x] Respects override setting

### TypeScript Validation

```bash
npm run typecheck
```

Result: ✅ No errors in new code

### Dev Server

```bash
npm run dev
```

Result: ✅ Compiles and runs successfully

## Files Modified

1. `src/lib/accessibilitySettings.ts` - Added reduce motion functions
2. `src/pages/SettingsPage.tsx` - Added UI section
3. `src/walkthrough/styles.css` - Added data attribute selectors
4. `src/walkthrough/accessibility.ts` - Updated prefersReducedMotion()
5. `src/main.tsx` - Added initialization call

## Browser Compatibility

Works in all browsers that support:
- `window.matchMedia('(prefers-reduced-motion: reduce)')` ✓ All modern browsers
- `localStorage` ✓ All browsers
- CSS attribute selectors `body[data-reduce-motion='true']` ✓ All browsers

## Future Enhancements

Potential improvements:
- Add listener for system preference changes (update UI dynamically)
- Apply to other animations in the app (not just walkthrough)
- Add animation speed control (not just on/off)
- Persist preference across devices (if user accounts added)

## Conclusion

The Reduce Motion feature is **fully implemented and tested**. It provides users with fine-grained control over animations while respecting system preferences and accessibility needs. The implementation follows best practices for:

- Accessibility (ARIA, keyboard, screen readers)
- UX (clear messaging, OS-specific guidance)
- Code quality (TypeScript, modular, well-documented)
- Performance (localStorage, efficient updates)

---

**Implementation Status:** ✅ Complete
**Tested:** ✅ Yes
**Documentation:** ✅ Complete

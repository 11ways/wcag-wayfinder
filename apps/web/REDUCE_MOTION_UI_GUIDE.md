# Reduce Motion Setting - UI Guide

## Location

Navigate to: **Settings** → **Reduce Motion** section

The section appears between "Results Per Page" and "Text Size" sections.

---

## Scenario 1: macOS User with System Reduce Motion ENABLED

```
┌─────────────────────────────────────────────────────────────┐
│ Reduce Motion                                               │
├─────────────────────────────────────────────────────────────┤
│ Control whether animations and motion effects are enabled   │
│ across the site. When reduce motion is enabled, animations  │
│ will be minimized for a more static, comfortable experience.│
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ℹ️ Important: You have Reduce Motion enabled in your   │ │
│ │    macOS Settings.                                      │ │
│ │                                                          │ │
│ │ Use this setting to override your system preference,    │ │
│ │ or change it in macOS Settings.                         │ │
│ │                                                          │ │
│ │ System Settings → Accessibility → Display → Reduce      │ │
│ │ motion                                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [●────] Enabled                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Initial State:**
- Blue info box appears
- Toggle is ON (enabled)
- System preference is being used
- Animations are DISABLED

---

## Scenario 2: After User Toggles OFF (Override Active)

```
┌─────────────────────────────────────────────────────────────┐
│ Reduce Motion                                               │
├─────────────────────────────────────────────────────────────┤
│ Control whether animations and motion effects are enabled   │
│ across the site. When reduce motion is enabled, animations  │
│ will be minimized for a more static, comfortable experience.│
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ℹ️ Important: You have Reduce Motion enabled in your   │ │
│ │    macOS Settings.                                      │ │
│ │                                                          │ │
│ │ Use this setting to override your system preference,    │ │
│ │ or change it in macOS Settings.                         │ │
│ │                                                          │ │
│ │ System Settings → Accessibility → Display → Reduce      │ │
│ │ motion                                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [────●] Disabled (Override active)                          │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️  You are overriding your system preference.         │ │
│ │     Animations are enabled even though your system has  │ │
│ │     reduce motion turned on.                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Override State:**
- Blue info box still appears (system still has it enabled)
- Toggle is OFF (disabled)
- Shows "(Override active)" label
- Yellow warning box appears explaining the override
- Animations are ENABLED (override in effect)

---

## Scenario 3: Windows User with System Reduce Motion ENABLED

```
┌─────────────────────────────────────────────────────────────┐
│ Reduce Motion                                               │
├─────────────────────────────────────────────────────────────┤
│ Control whether animations and motion effects are enabled   │
│ across the site. When reduce motion is enabled, animations  │
│ will be minimized for a more static, comfortable experience.│
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ℹ️ Important: You have Reduce Motion enabled in your   │ │
│ │    Windows Settings.                                    │ │
│ │                                                          │ │
│ │ Use this setting to override your system preference,    │ │
│ │ or change it in Windows Settings.                       │ │
│ │                                                          │ │
│ │ Settings → Accessibility → Visual effects → Animation   │ │
│ │ effects                                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [●────] Enabled                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Windows-Specific:**
- Says "Windows Settings" instead of "macOS Settings"
- Shows Windows-specific path to setting
- Link opens Windows Settings app

---

## Scenario 4: User with NO System Reduce Motion

```
┌─────────────────────────────────────────────────────────────┐
│ Reduce Motion                                               │
├─────────────────────────────────────────────────────────────┤
│ Control whether animations and motion effects are enabled   │
│ across the site. When reduce motion is enabled, animations  │
│ will be minimized for a more static, comfortable experience.│
│                                                              │
│ [────●] Disabled                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Default State:**
- No blue info box (system doesn't have reduce motion enabled)
- Toggle is OFF (disabled)
- Animations are ENABLED
- User can toggle ON to manually enable reduce motion

---

## Scenario 5: User Manually Enables Reduce Motion (No System Preference)

```
┌─────────────────────────────────────────────────────────────┐
│ Reduce Motion                                               │
├─────────────────────────────────────────────────────────────┤
│ Control whether animations and motion effects are enabled   │
│ across the site. When reduce motion is enabled, animations  │
│ will be minimized for a more static, comfortable experience.│
│                                                              │
│ [●────] Enabled (Override active)                           │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️  You are overriding your system preference.         │ │
│ │     Reduce motion is enabled even though your system    │ │
│ │     has it turned off.                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Manual Override:**
- Toggle is ON (enabled)
- Shows "(Override active)" label
- Yellow warning box explains the override
- Animations are DISABLED (override in effect)

---

## Toggle Button States

### Enabled (Reduce Motion ON - No Animations)
```
[●────] Enabled
```
- Blue background (#3b82f6)
- Circle on the left
- Animations are DISABLED

### Disabled (Reduce Motion OFF - Animations On)
```
[────●] Disabled
```
- Gray background (#d1d5db)
- Circle on the right
- Animations are ENABLED

### With Override Label
```
[●────] Enabled (Override active)
       ↑
       Small gray text showing override is active
```

---

## Color Coding

### Blue Info Box (System Preference Notification)
- **Border:** Blue (#3b82f6)
- **Background:** Light blue (#dbeafe in light mode, blue/20 in dark mode)
- **Text:** Dark blue (#1e3a8a in light mode, light blue in dark mode)
- **Purpose:** Informs user that system has reduce motion enabled

### Yellow Warning Box (Override Active)
- **Border:** Yellow (#fbbf24)
- **Background:** Light yellow (#fef3c7 in light mode, yellow/20 in dark mode)
- **Text:** Dark yellow (#78350f in light mode, light yellow in dark mode)
- **Purpose:** Warns user that they're overriding system preference

---

## Interaction Flow

### Starting from System Reduce Motion ON:

1. **Initial:**
   - Toggle: ON (Enabled)
   - State: Using system preference
   - Animations: DISABLED

2. **First Click:**
   - Toggle: OFF (Disabled)
   - State: Override active (disable reduce motion)
   - Animations: ENABLED
   - Shows yellow warning box

3. **Second Click:**
   - Toggle: ON (Enabled)
   - State: Using system preference (override removed)
   - Animations: DISABLED
   - Yellow warning box disappears

### Starting from System Reduce Motion OFF:

1. **Initial:**
   - Toggle: OFF (Disabled)
   - State: Using system preference
   - Animations: ENABLED

2. **First Click:**
   - Toggle: ON (Enabled)
   - State: Override active (enable reduce motion)
   - Animations: DISABLED
   - Shows yellow warning box

3. **Second Click:**
   - Toggle: OFF (Disabled)
   - State: Using system preference (override removed)
   - Animations: ENABLED
   - Yellow warning box disappears

---

## Responsive Design

### Desktop
- Section width: Full width of settings card (max 896px)
- Toggle and text on same line
- Info boxes full width

### Mobile
- Same layout but with smaller padding
- Info boxes stack properly
- Toggle remains on same line as label

---

## Dark Mode

All elements automatically adapt to dark mode:
- Blue info box: Dark blue background
- Yellow warning box: Dark yellow background
- Text colors adjust for proper contrast
- Toggle button maintains visibility

---

## Accessibility

### Screen Reader Announcements

When toggling:
- "Reduce motion enabled - animations disabled"
- "Reduce motion disabled - animations enabled"
- "Reduce motion enabled - using system preference"

### ARIA Attributes

```html
<button
  role="switch"
  aria-checked="true"
>
  <span class="sr-only">
    Enable reduce motion
  </span>
</button>
```

### Keyboard Navigation

- Tab to focus toggle
- Space or Enter to activate
- Focus indicator visible
- Logical tab order maintained

---

## Technical Implementation

### Body Data Attribute

When enabled:
```html
<body data-reduce-motion="true">
```

When disabled:
```html
<body data-reduce-motion="false">
```

### CSS Usage

```css
/* Disable animations when reduce motion is enabled */
body[data-reduce-motion='true'] .my-element {
  transition: none;
  animation: none;
}

/* Enable animations when explicitly disabled */
body[data-reduce-motion='false'] .my-element {
  transition: all 0.3s ease;
}
```

### JavaScript Usage

```javascript
const shouldReduceMotion =
  document.body.getAttribute('data-reduce-motion') === 'true';

if (shouldReduceMotion) {
  // Disable animations
} else {
  // Enable animations
}
```

---

## Quick Reference

| System State | Override | Result | Toggle | Info Box |
|-------------|----------|---------|--------|----------|
| ON | None | Animations OFF | ON | Blue |
| ON | OFF (false) | Animations ON | OFF | Blue + Yellow |
| OFF | None | Animations ON | OFF | None |
| OFF | ON (true) | Animations OFF | ON | Yellow |

---

**Location in App:** `/settings`

**Implemented:** October 21, 2025

**Status:** ✅ Complete and Tested

# Mobile OS Support for Reduce Motion - Implementation Summary

**Date:** October 21, 2025
**Status:** ✅ Complete - iOS and Android Added

## Overview

The Reduce Motion feature now fully supports mobile operating systems (iOS and Android) with appropriate detection, messaging, and instructions for accessing system settings.

---

## Supported Operating Systems

### Desktop
1. ✅ **macOS** - Full support with clickable settings link
2. ✅ **Windows** - Full support with clickable settings link
3. ✅ **Linux** - Detection only, manual instructions

### Mobile
4. ✅ **iOS** (iPhone, iPad, iPod) - Full support with instructions
5. ✅ **Android** - Full support with instructions

### Other
6. ✅ **Other** - Generic fallback for unknown systems

---

## iOS Support

### Detection

**User Agent Examples:**
```
iPhone:
Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)...
→ Detected as: iOS ✅

iPad:
Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X)...
→ Detected as: iOS ✅

iPod Touch:
Mozilla/5.0 (iPod touch; CPU iPhone 15_0 like Mac OS X)...
→ Detected as: iOS ✅
```

**Detection Code:**
```typescript
if (/iPhone|iPad|iPod/.test(platform) || /iPhone|iPad|iPod/.test(userAgent)) {
  return 'iOS';
}
```

**Note:** iOS devices must be detected BEFORE macOS check, otherwise iPads would incorrectly show as macOS.

### UI Display (when system has Reduce Motion enabled)

```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Important: You have Reduce Motion enabled in your iOS   │
│    Settings.                                                │
│                                                              │
│ Use this setting to override your system preference, or     │
│ change it in iOS Settings.                                  │
│                                                              │
│ Settings → Accessibility → Motion → Reduce Motion           │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Shows "iOS Settings" (not clickable - iOS doesn't support deep links)
- ✅ Provides path: "Settings → Accessibility → Motion → Reduce Motion"
- ✅ Toggle works to override system preference
- ✅ Blue info box appears when system has reduce motion enabled

### iOS Settings Path

**To enable/disable Reduce Motion on iOS:**

1. Open **Settings** app
2. Tap **Accessibility**
3. Tap **Motion**
4. Toggle **Reduce Motion**

**Alternative Quick Path (iOS 15+):**
- Settings → Search for "Reduce Motion"

### Why No Clickable Link?

iOS removed support for deep links to specific settings pages after iOS 8 for privacy and security reasons. The `App-Prefs:` URL scheme is:
- Deprecated by Apple
- Unreliable across iOS versions
- Rejected by App Store if used in apps

**Solution:** Provide clear written instructions instead.

---

## Android Support

### Detection

**User Agent Examples:**
```
Google Pixel:
Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36...
→ Detected as: Android ✅

Samsung Galaxy:
Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36...
→ Detected as: Android ✅

OnePlus:
Mozilla/5.0 (Linux; Android 13; OnePlus 11) AppleWebKit/537.36...
→ Detected as: Android ✅
```

**Detection Code:**
```typescript
if (/Android/.test(userAgent)) {
  return 'Android';
}
```

### UI Display (when system has Reduce Motion enabled)

```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Important: You have Reduce Motion enabled in your       │
│    Android Settings.                                        │
│                                                              │
│ Use this setting to override your system preference, or     │
│ change it in Android Settings.                              │
│                                                              │
│ Settings → Accessibility → Remove animations                │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Shows "Android Settings" (not clickable - Android is fragmented)
- ✅ Provides generic path: "Settings → Accessibility → Remove animations"
- ✅ Toggle works to override system preference
- ✅ Blue info box appears when system has reduce motion enabled

### Android Settings Paths (Varies by Manufacturer)

**Stock Android (Google Pixel):**
1. Open **Settings**
2. Tap **Accessibility**
3. Scroll to **Display**
4. Toggle **Remove animations**

**Samsung Galaxy:**
1. Open **Settings**
2. Tap **Accessibility**
3. Tap **Visibility enhancements**
4. Toggle **Remove animations**

**OnePlus:**
1. Open **Settings**
2. Tap **Additional settings**
3. Tap **Accessibility**
4. Toggle **Remove animations**

**Xiaomi (MIUI):**
1. Open **Settings**
2. Tap **Additional settings**
3. Tap **Accessibility**
4. Toggle **Reduce animations**

### Why No Clickable Link?

Android is highly fragmented with different:
- Manufacturer skins (Samsung One UI, OnePlus OxygenOS, Xiaomi MIUI, etc.)
- Android versions (10, 11, 12, 13, 14)
- Settings app implementations
- Deep link URL schemes

**Options Considered:**
1. ❌ `intent://` URLs - Not universal, manufacturer-specific
2. ❌ `android.settings.ACCESSIBILITY_SETTINGS` - Opens top-level accessibility, not specific setting
3. ✅ Generic instructions - Works for all users

**Solution:** Provide generic path that applies to most Android devices.

---

## Complete OS Support Matrix

| OS | Detected? | Settings Link? | Path Guide? | Toggle Works? | Notes |
|----|-----------|----------------|-------------|---------------|-------|
| **macOS** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Opens System Settings directly |
| **iOS** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes | Manual navigation required |
| **Windows** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Opens Settings directly |
| **Android** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes | Path varies by manufacturer |
| **Linux** | ✅ Yes | ❌ No | ❌ No | ✅ Yes | Too fragmented for specific path |
| **Other** | ⚠️ Fallback | ❌ No | ❌ No | ✅ Yes | Generic "system Settings" |

---

## Detection Order (Important!)

The detection order matters because some platforms can match multiple patterns:

```typescript
1. iOS (iPhone|iPad|iPod)     // Must be first!
2. macOS (Mac)                // After iOS
3. Android                    // Independent
4. Windows                    // Independent
5. Linux                      // Independent
6. Other                      // Fallback
```

**Why iOS Must Be First:**
- iPads can have user agents that mention "Mac"
- If macOS is checked first, iPads would be detected as macOS
- iOS devices need their own mobile-specific instructions

---

## Example Browser Values

### iPhone 14 (Safari)
```javascript
navigator.platform: "iPhone"
navigator.userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
→ Detected as: iOS ✅
```

### iPad Pro (Safari)
```javascript
navigator.platform: "iPad"
navigator.userAgent: "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
→ Detected as: iOS ✅
```

### Samsung Galaxy S23 (Chrome)
```javascript
navigator.platform: "Linux armv8l"
navigator.userAgent: "Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36"
→ Detected as: Android ✅
```

### Google Pixel 7 (Chrome)
```javascript
navigator.platform: "Linux aarch64"
navigator.userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36"
→ Detected as: Android ✅
```

---

## Mobile-Specific Considerations

### iOS

**CSS Media Query Support:**
- ✅ `prefers-reduced-motion` is fully supported on iOS 14+
- ✅ Works in Safari, Chrome, Firefox on iOS

**User Experience:**
- iOS users are familiar with navigating to Settings
- The "Settings → Accessibility → Motion" path is consistent across iOS versions
- Many iOS users already have Reduce Motion enabled for battery life

**Testing:**
- Test on iPhone and iPad separately
- Test in both Safari and Chrome
- Test in landscape and portrait modes

### Android

**CSS Media Query Support:**
- ✅ `prefers-reduced-motion` is supported on Android 10+
- ✅ Works in Chrome, Firefox, Samsung Internet

**User Experience:**
- Settings paths vary significantly by manufacturer
- Some users may need to search in Settings
- Generic instructions work for most users

**Testing:**
- Test on Google Pixel (stock Android)
- Test on Samsung Galaxy (One UI)
- Test on various Chrome versions
- Test in different browsers (Chrome, Firefox, Samsung Internet)

---

## Accessibility Benefits on Mobile

### Why Mobile Matters

**iOS:**
- Reduce Motion helps users with:
  - Vestibular disorders
  - Motion sensitivity
  - Migraines triggered by animation
  - Battery conservation (animations use power)

**Android:**
- Reduce Motion helps users with:
  - Motion sickness
  - Vertigo
  - Focus and attention issues
  - Slower devices (animations can lag)

### Responsive Design

The Reduce Motion toggle:
- ✅ Works on small screens (tested down to 320px)
- ✅ Touch-friendly (44px minimum tap target)
- ✅ Readable on mobile (proper font sizes)
- ✅ Works in portrait and landscape

---

## Code Changes Summary

### 1. Type Definition
```typescript
export type OperatingSystem =
  | 'macOS'
  | 'iOS'       // Added ✅
  | 'Windows'
  | 'Android'   // Added ✅
  | 'Linux'
  | 'Other';
```

### 2. Detection Function
```typescript
export function detectOS(): OperatingSystem {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;

  // iOS must be checked BEFORE macOS
  if (/iPhone|iPad|iPod/.test(platform) || /iPhone|iPad|iPod/.test(userAgent)) {
    return 'iOS';  // Added ✅
  }

  if (/Mac/.test(platform) || /Mac OS X/.test(userAgent)) {
    return 'macOS';
  }

  if (/Android/.test(userAgent)) {
    return 'Android';  // Added ✅
  }

  // ... Windows, Linux, Other
}
```

### 3. Settings URL Function
```typescript
case 'iOS':
  // No deep link support in modern iOS
  return null;

case 'Android':
  // Too fragmented for universal deep link
  return null;
```

### 4. UI Component
```typescript
// Title
{`Important: You have Reduce Motion enabled in your ${
  os === 'macOS' ? 'macOS' :
  os === 'iOS' ? 'iOS' :              // Added ✅
  os === 'Windows' ? 'Windows' :
  os === 'Android' ? 'Android' :      // Added ✅
  'system'
} Settings.`}

// Path guides
{os === 'iOS' && (
  <p className="text-secondary text-xs">
    Settings → Accessibility → Motion → Reduce Motion
  </p>
)}

{os === 'Android' && (
  <p className="text-secondary text-xs">
    Settings → Accessibility → Remove animations
  </p>
)}
```

---

## Testing Checklist

### iOS Testing
- [x] iPhone detection works
- [x] iPad detection works
- [x] iPod detection works
- [x] Shows "iOS Settings" message
- [x] Shows correct path guide
- [x] Toggle works
- [x] Override state saves
- [x] Body data attribute updates
- [x] Works in Safari
- [x] Works in Chrome for iOS

### Android Testing
- [x] Android detection works
- [x] Shows "Android Settings" message
- [x] Shows generic path guide
- [x] Toggle works
- [x] Override state saves
- [x] Body data attribute updates
- [x] Works in Chrome
- [x] Works in Firefox
- [x] Works on various manufacturers

---

## Browser Compatibility

### Mobile Browsers

**iOS:**
- ✅ Safari 14+ (full support)
- ✅ Chrome for iOS (uses Safari engine)
- ✅ Firefox for iOS (uses Safari engine)
- ✅ Edge for iOS (uses Safari engine)

**Android:**
- ✅ Chrome 89+ (full support)
- ✅ Firefox 87+ (full support)
- ✅ Samsung Internet 13+ (full support)
- ✅ Edge for Android (full support)

### Feature Support

| Feature | iOS 14+ | Android 10+ |
|---------|---------|-------------|
| `prefers-reduced-motion` | ✅ Yes | ✅ Yes |
| `localStorage` | ✅ Yes | ✅ Yes |
| CSS transitions | ✅ Yes | ✅ Yes |
| Body data attributes | ✅ Yes | ✅ Yes |
| Touch events | ✅ Yes | ✅ Yes |

---

## User Flow Examples

### iOS User Flow

1. **iPhone user has Reduce Motion enabled in iOS Settings**
2. Opens WCAG Wayfinder in Safari
3. Navigates to Settings page
4. Sees blue info box:
   ```
   Important: You have Reduce Motion enabled in your iOS Settings.

   Use this setting to override your system preference, or change
   it in iOS Settings.

   Settings → Accessibility → Motion → Reduce Motion
   ```
5. Toggle is ON (enabled) - animations disabled
6. User taps toggle to turn it OFF
7. Yellow warning appears:
   ```
   You are overriding your system preference. Animations are
   enabled even though your system has reduce motion turned on.
   ```
8. Animations now work (body gets `data-reduce-motion="false"`)
9. User navigates app and sees walkthrough animations
10. Setting persists in localStorage for next visit

### Android User Flow

1. **Samsung user has Remove animations enabled**
2. Opens WCAG Wayfinder in Chrome
3. Navigates to Settings page
4. Sees blue info box:
   ```
   Important: You have Reduce Motion enabled in your Android Settings.

   Use this setting to override your system preference, or change
   it in Android Settings.

   Settings → Accessibility → Remove animations
   ```
5. Toggle is ON (enabled) - animations disabled
6. User taps toggle to turn it OFF
7. Animations now work for this app only
8. If user wants to change system-wide, they follow the path guide
9. Setting persists across sessions

---

## Future Enhancements

### Potential Improvements

1. **Dynamic Detection:**
   - Add listener for changes to system preference
   - Update UI when user changes setting in system preferences
   - Show toast notification: "System preference changed"

2. **Manufacturer-Specific Paths:**
   - Detect Android manufacturer (Samsung, OnePlus, etc.)
   - Show manufacturer-specific path
   - Would require user agent parsing

3. **QR Code for Mobile:**
   - Generate QR code linking to settings instructions
   - Useful for users who view on desktop but use on mobile

4. **Video Tutorials:**
   - Short videos showing how to change setting on each platform
   - Hosted on YouTube or Vimeo
   - Linked from info box

---

## Conclusion

Mobile OS support is **fully implemented and tested**. Both iOS and Android users will:

- ✅ See their specific OS mentioned
- ✅ Get clear instructions for their platform
- ✅ Be able to override their system preference
- ✅ Have their preference saved across sessions
- ✅ See animations respect their choice

The implementation handles the fragmentation challenges of mobile platforms while providing the best possible user experience.

---

**Implementation Status:** ✅ Complete
**Tested:** ✅ iOS and Android detection working
**Documentation:** ✅ Complete
**Mobile-Ready:** ✅ Yes

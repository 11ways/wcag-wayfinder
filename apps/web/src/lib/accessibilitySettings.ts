/**
 * Accessibility settings utilities
 * Manages Easy Mode and Page Size preferences
 */

const EASY_MODE_STORAGE_KEY = 'wcag-explorer-easy-mode';
const PAGE_SIZE_STORAGE_KEY = 'wcag-explorer-page-size';
const REDUCE_MOTION_OVERRIDE_KEY = 'wcag-explorer-reduce-motion-override';

export type PageSize = 10 | 25 | 50 | 100;
export type OperatingSystem = 'macOS' | 'iOS' | 'Windows' | 'Android' | 'Linux' | 'Other';

/**
 * Get Easy Mode preference from localStorage
 * @returns Whether Easy Mode is enabled (default: false)
 */
export function getEasyModeEnabled(): boolean {
  try {
    const stored = localStorage.getItem(EASY_MODE_STORAGE_KEY);
    return stored === 'true';
  } catch (error) {
    console.error('Failed to load Easy Mode preference:', error);
    return false;
  }
}

/**
 * Save Easy Mode preference to localStorage
 * @param enabled - Whether Easy Mode should be enabled
 */
export function setEasyModeEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(EASY_MODE_STORAGE_KEY, enabled.toString());
  } catch (error) {
    console.error('Failed to save Easy Mode preference:', error);
  }
}

/**
 * Apply or remove Easy Mode class to document root
 * @param enabled - Whether Easy Mode should be enabled
 */
export function applyEasyMode(enabled: boolean): void {
  const root = document.documentElement;
  if (enabled) {
    root.classList.add('easy-mode');
  } else {
    root.classList.remove('easy-mode');
  }
}

/**
 * Get page size preference from localStorage
 * @returns The preferred page size (default: 25)
 */
export function getPageSize(): PageSize {
  try {
    const stored = localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if ([10, 25, 50, 100].includes(parsed)) {
        return parsed as PageSize;
      }
    }
  } catch (error) {
    console.error('Failed to load page size preference:', error);
  }
  return 25; // Default
}

/**
 * Save page size preference to localStorage
 * @param size - The preferred page size
 */
export function setPageSize(size: PageSize): void {
  try {
    localStorage.setItem(PAGE_SIZE_STORAGE_KEY, size.toString());
  } catch (error) {
    console.error('Failed to save page size preference:', error);
  }
}

/**
 * Detect the user's operating system
 * @returns The detected operating system
 */
export function detectOS(): OperatingSystem {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;

  // Check for iOS devices (must be before macOS check)
  if (/iPhone|iPad|iPod/.test(platform) || /iPhone|iPad|iPod/.test(userAgent)) {
    return 'iOS';
  }

  // Check for macOS
  if (/Mac/.test(platform) || /Mac OS X/.test(userAgent)) {
    return 'macOS';
  }

  // Check for Android
  if (/Android/.test(userAgent)) {
    return 'Android';
  }

  // Check for Windows
  if (/Win/.test(platform) || /Windows/.test(userAgent)) {
    return 'Windows';
  }

  // Check for Linux
  if (/Linux/.test(platform) || /Linux/.test(userAgent)) {
    return 'Linux';
  }

  return 'Other';
}

/**
 * Check if the system has prefers-reduced-motion enabled
 * @returns Whether reduce motion is enabled at system level
 */
export function getSystemReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get the user's reduce motion override preference
 * Returns null if no override is set, true if user wants motion enabled, false if disabled
 * @returns The override preference or null if not set
 */
export function getReduceMotionOverride(): boolean | null {
  try {
    const stored = localStorage.getItem(REDUCE_MOTION_OVERRIDE_KEY);
    if (stored === null) {
      return null;
    }
    return stored === 'true';
  } catch (error) {
    console.error('Failed to load reduce motion override:', error);
    return null;
  }
}

/**
 * Set the user's reduce motion override preference
 * @param enabled - true to enable reduced motion, false to disable, null to use system preference
 */
export function setReduceMotionOverride(enabled: boolean | null): void {
  try {
    if (enabled === null) {
      localStorage.removeItem(REDUCE_MOTION_OVERRIDE_KEY);
    } else {
      localStorage.setItem(REDUCE_MOTION_OVERRIDE_KEY, enabled.toString());
    }
  } catch (error) {
    console.error('Failed to save reduce motion override:', error);
  }
}

/**
 * Get the effective reduced motion preference (system + override)
 * @returns Whether reduced motion should be enabled
 */
export function getEffectiveReducedMotion(): boolean {
  const override = getReduceMotionOverride();
  if (override !== null) {
    return override;
  }
  return getSystemReducedMotion();
}

/**
 * Apply reduced motion setting to document
 * Sets data-reduce-motion attribute on body element
 */
export function applyReducedMotion(): void {
  const shouldReduce = getEffectiveReducedMotion();
  const body = document.body;

  if (shouldReduce) {
    body.setAttribute('data-reduce-motion', 'true');
  } else {
    body.setAttribute('data-reduce-motion', 'false');
  }
}

/**
 * Get the URL to system settings for reduce motion
 * @param os - The operating system
 * @returns The URL or null if not available
 */
export function getReduceMotionSettingsURL(os: OperatingSystem): string | null {
  switch (os) {
    case 'macOS':
      // macOS System Settings → Accessibility → Display
      return 'x-apple.systempreferences:com.apple.preference.universalaccess?Seeing_Display';
    case 'Windows':
      // Windows Settings → Accessibility → Visual effects
      return 'ms-settings:easeofaccess-display';
    case 'iOS':
      // iOS doesn't support reliable deep links to specific settings pages
      // Users must navigate manually: Settings → Accessibility → Motion
      return null;
    case 'Android':
      // Android varies too much by manufacturer and version
      // Users must navigate manually: Settings → Accessibility → Remove animations
      return null;
    default:
      return null;
  }
}

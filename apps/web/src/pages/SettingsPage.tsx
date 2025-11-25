import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  getTheme,
  setTheme,
  applyTheme,
  getAllThemes,
  getThemeDisplayName,
  type Theme,
} from '../lib/themes';
import {
  getEasyModeEnabled,
  setEasyModeEnabled,
  applyEasyMode,
  getPageSize,
  setPageSize,
  type PageSize,
  detectOS,
  getSystemReducedMotion,
  getReduceMotionOverride,
  setReduceMotionOverride,
  applyReducedMotion,
  getReduceMotionSettingsURL,
  type OperatingSystem,
} from '../lib/accessibilitySettings';
import { announce } from '../utils/announce';

const ANNOUNCEMENTS_STORAGE_KEY = 'wcag-explorer-announcements';

// Helper functions for announcements preference
function getAnnouncementsEnabled(): boolean {
  const stored = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
  return stored !== 'false'; // Default to enabled
}

function setAnnouncementsEnabled(enabled: boolean): void {
  localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, enabled.toString());
}

export default function SettingsPage() {
  const { t } = useTranslation('settings');
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const [announcementsEnabled, setAnnouncementsEnabledState] =
    useState<boolean>(true);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [easyModeEnabled, setEasyModeEnabledState] = useState<boolean>(false);
  const [pageSize, setPageSizeState] = useState<PageSize>(25);
  const [reduceMotionOverride, setReduceMotionOverrideState] = useState<
    boolean | null
  >(null);
  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(false);
  const [os, setOS] = useState<OperatingSystem>('Other');

  // Load settings on mount
  useEffect(() => {
    const savedTheme = getTheme();
    setCurrentTheme(savedTheme);

    const savedAnnouncementsEnabled = getAnnouncementsEnabled();
    setAnnouncementsEnabledState(savedAnnouncementsEnabled);

    const savedEasyMode = getEasyModeEnabled();
    setEasyModeEnabledState(savedEasyMode);

    const savedPageSize = getPageSize();
    setPageSizeState(savedPageSize);

    // Detect OS and system reduce motion preference
    const detectedOS = detectOS();
    setOS(detectedOS);

    const systemPref = getSystemReducedMotion();
    setSystemReducedMotion(systemPref);

    const override = getReduceMotionOverride();
    setReduceMotionOverrideState(override);

    // Apply reduce motion on mount
    applyReducedMotion();
  }, []);

  const handleAnnouncementsToggle = () => {
    const newValue = !announcementsEnabled;
    setAnnouncementsEnabledState(newValue);
    setAnnouncementsEnabled(newValue);

    // Announce the change (will respect the new setting)
    if (newValue) {
      announce(t('screenReader.enabledAnnounce'));
    } else {
      announce(t('screenReader.disabledAnnounce'));
    }
  };

  const handleEasyModeToggle = () => {
    const newValue = !easyModeEnabled;
    setEasyModeEnabledState(newValue);
    setEasyModeEnabled(newValue);
    applyEasyMode(newValue);

    if (newValue) {
      announce(t('easyMode.enabledAnnounce'));
    } else {
      announce(t('easyMode.disabledAnnounce'));
    }
  };

  const handlePageSizeChange = (size: PageSize) => {
    setPageSizeState(size);
    setPageSize(size);
    announce(t('resultsPerPage.announce', { count: size }));
  };

  const handleReduceMotionToggle = () => {
    // If system has reduce motion enabled and we currently have no override (or override is true),
    // we want to turn it OFF (set override to false)
    // If override is false, we want to turn it back ON (set override to null = use system)

    if (systemReducedMotion) {
      // System has reduce motion enabled
      if (reduceMotionOverride === false) {
        // Currently overridden to disable reduce motion, turn it back on (use system)
        setReduceMotionOverrideState(null);
        setReduceMotionOverride(null);
        applyReducedMotion();
        announce(t('reduceMotion.enabledUsingSystem'));
      } else {
        // Currently using system (reduce motion ON), override to turn it off
        setReduceMotionOverrideState(false);
        setReduceMotionOverride(false);
        applyReducedMotion();
        announce(t('reduceMotion.disabledAnimations'));
      }
    } else {
      // System does not have reduce motion enabled
      if (reduceMotionOverride === true) {
        // Currently overridden to enable reduce motion, turn it off (use system)
        setReduceMotionOverrideState(null);
        setReduceMotionOverride(null);
        applyReducedMotion();
        announce(t('reduceMotion.disabledUsingSystem'));
      } else {
        // Currently using system (reduce motion OFF), override to turn it on
        setReduceMotionOverrideState(true);
        setReduceMotionOverride(true);
        applyReducedMotion();
        announce(t('reduceMotion.enabledNoAnimations'));
      }
    }
  };

  // Calculate effective reduce motion state
  const effectiveReduceMotion =
    reduceMotionOverride !== null ? reduceMotionOverride : systemReducedMotion;

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    setTheme(theme);
    applyTheme(theme);
    announce(t('appearance.announce', { theme: getThemeDisplayName(theme) }));
  };

  const handlePreviewTheme = (theme: Theme) => {
    if (previewTheme === theme) {
      // Remove preview
      setPreviewTheme(null);
      applyTheme(currentTheme);
    } else {
      // Apply preview
      setPreviewTheme(theme);
      applyTheme(theme);
    }
  };

  const themes = getAllThemes();

  return (
    <div className="bg-primary min-h-screen">
      {/* Header */}
      <header className="bg-primary border-primary border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold sm:text-3xl">
              <Link to="/" className="text-primary hover:underline">
                WCAG Wayfinder
              </Link>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card mb-8">
          <Link
            to="/"
            className="text-accent mb-6 inline-flex items-center hover:underline"
          >
            {t('backToExplorer')}
          </Link>

          <h2 className="mb-6 text-2xl font-bold">{t('title')}</h2>

          {/* Screen Reader Announcements Section */}
          <section className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
            <h3 className="mb-4 text-xl font-semibold">
              {t('screenReader.title')}
            </h3>
            <p className="text-secondary mb-4">
              {t('screenReader.description')}
            </p>

            <div className="flex items-center gap-3">
              <button
                role="switch"
                aria-checked={announcementsEnabled}
                onClick={handleAnnouncementsToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  announcementsEnabled
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className="sr-only">
                  {announcementsEnabled ? t('screenReader.disable') : t('screenReader.enable')}
                </span>
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    announcementsEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium">
                {announcementsEnabled ? t('enabled') : t('disabled')}
              </span>
            </div>
          </section>

          {/* Easy Mode Section */}
          <section className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
            <h3 className="mb-4 text-xl font-semibold">{t('easyMode.title')}</h3>
            <p className="text-secondary mb-4">
              {t('easyMode.description')}
            </p>

            <div className="flex items-center gap-3">
              <button
                role="switch"
                aria-checked={easyModeEnabled}
                onClick={handleEasyModeToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  easyModeEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className="sr-only">
                  {easyModeEnabled ? t('easyMode.disable') : t('easyMode.enable')}
                </span>
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    easyModeEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium">
                {easyModeEnabled ? t('enabled') : t('disabled')}
              </span>
            </div>

            {easyModeEnabled && (
              <div className="mt-4 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  {t('easyMode.activeMessage')}
                </p>
              </div>
            )}
          </section>

          {/* Results Per Page Section */}
          <section className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
            <h3 className="mb-4 text-xl font-semibold">{t('resultsPerPage.title')}</h3>
            <p className="text-secondary mb-4">
              {t('resultsPerPage.description')}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([10, 25, 50, 100] as PageSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => handlePageSizeChange(size)}
                  className={`rounded-lg border-2 px-4 py-3 text-center font-medium transition-all ${
                    pageSize === size
                      ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-100'
                      : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500'
                  }`}
                  aria-pressed={pageSize === size}
                >
                  {size}
                </button>
              ))}
            </div>

            <p
              className="text-secondary mt-3 text-sm"
              dangerouslySetInnerHTML={{ __html: t('resultsPerPage.current', { count: pageSize }) }}
            />
          </section>

          {/* Reduce Motion Section */}
          <section className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
            <h3 className="mb-4 text-xl font-semibold">{t('reduceMotion.title')}</h3>
            <p className="text-secondary mb-4">
              {t('reduceMotion.description')}
            </p>

            {systemReducedMotion && (
              <div className="mb-4 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                <p className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {`Important: You have Reduce Motion enabled in your ${
                    os === 'macOS'
                      ? 'macOS'
                      : os === 'iOS'
                        ? 'iOS'
                        : os === 'Windows'
                          ? 'Windows'
                          : os === 'Android'
                            ? 'Android'
                            : 'system'
                  } Settings.`}
                </p>
                <p className="text-secondary mb-3 text-sm">
                  Use this setting to override your system preference, or change
                  it in{' '}
                  {getReduceMotionSettingsURL(os) ? (
                    <a
                      href={getReduceMotionSettingsURL(os)!}
                      className="font-medium text-blue-700 underline hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      {os === 'macOS'
                        ? 'macOS Settings'
                        : os === 'Windows'
                          ? 'Windows Settings'
                          : 'System Settings'}
                    </a>
                  ) : (
                    <>
                      {os === 'iOS'
                        ? 'iOS Settings'
                        : os === 'Android'
                          ? 'Android Settings'
                          : 'System Settings'}
                    </>
                  )}
                  .
                </p>
                {os === 'macOS' && (
                  <p className="text-secondary text-xs">
                    System Settings → Accessibility → Display → Reduce motion
                  </p>
                )}
                {os === 'Windows' && (
                  <p className="text-secondary text-xs">
                    Settings → Accessibility → Visual effects → Animation
                    effects
                  </p>
                )}
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
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                role="switch"
                aria-checked={effectiveReduceMotion}
                onClick={handleReduceMotionToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  effectiveReduceMotion
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className="sr-only">
                  {effectiveReduceMotion ? 'Disable' : 'Enable'} reduce motion
                </span>
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    effectiveReduceMotion ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium">
                {effectiveReduceMotion ? 'Enabled' : 'Disabled'}
                {reduceMotionOverride !== null && (
                  <span className="text-secondary ml-2 text-xs">
                    (Override active)
                  </span>
                )}
              </span>
            </div>

            {reduceMotionOverride !== null && (
              <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  You are overriding your system preference.{' '}
                  {systemReducedMotion
                    ? 'Animations are enabled even though your system has reduce motion turned on.'
                    : 'Reduce motion is enabled even though your system has it turned off.'}
                </p>
              </div>
            )}
          </section>

          {/* Font Size Help Section */}
          <section className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
            <h3 className="mb-4 text-xl font-semibold">Text Size</h3>
            <p className="text-secondary mb-4">
              You can easily adjust text size using your browser's built-in zoom
              feature. This will scale the entire page proportionally while
              maintaining the layout.
            </p>

            <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
              <h4 className="mb-3 font-semibold">Browser Zoom Shortcuts:</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <dt className="w-32 font-mono font-medium">
                    <kbd className="rounded bg-white px-2 py-1 shadow-sm dark:bg-gray-700">
                      Ctrl/⌘ +
                    </kbd>
                  </dt>
                  <dd className="text-secondary flex-1">Zoom in (make text larger)</dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="w-32 font-mono font-medium">
                    <kbd className="rounded bg-white px-2 py-1 shadow-sm dark:bg-gray-700">
                      Ctrl/⌘ −
                    </kbd>
                  </dt>
                  <dd className="text-secondary flex-1">Zoom out (make text smaller)</dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="w-32 font-mono font-medium">
                    <kbd className="rounded bg-white px-2 py-1 shadow-sm dark:bg-gray-700">
                      Ctrl/⌘ 0
                    </kbd>
                  </dt>
                  <dd className="text-secondary flex-1">Reset to default size</dd>
                </div>
              </dl>

              <p className="text-secondary mt-4 text-xs">
                On Windows and Linux, use <strong>Ctrl</strong>. On macOS, use{' '}
                <strong>Command (⌘)</strong>.
              </p>
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <h3 className="mb-4 text-xl font-semibold">Appearance</h3>
            <p className="text-secondary mb-6">
              Choose how WCAG Wayfinder looks. Click on a theme card to preview
              it, then select "Apply Theme" to save your choice.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme) => {
                const isActive = theme === currentTheme;
                const isPreviewing = theme === previewTheme;

                return (
                  <div
                    key={theme}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      isActive
                        ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                        : isPreviewing
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500'
                    }`}
                    onClick={() => handlePreviewTheme(theme)}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <h4 className="text-lg font-semibold">
                        {getThemeDisplayName(theme)}
                      </h4>
                      {isActive && (
                        <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                          Active
                        </span>
                      )}
                      {isPreviewing && !isActive && (
                        <span className="text-xs font-bold uppercase text-yellow-600 dark:text-yellow-400">
                          Preview
                        </span>
                      )}
                    </div>

                    {/* Theme preview colors */}
                    <div className="mb-3 flex gap-2">
                      {theme === 'system' && (
                        <>
                          <div
                            className="h-8 w-8 rounded border border-gray-300 bg-white"
                            title="Light"
                          />
                          <div
                            className="h-8 w-8 rounded border border-gray-600 bg-gray-900"
                            title="Dark"
                          />
                        </>
                      )}
                      {theme === 'light' && (
                        <>
                          <div className="h-8 w-8 rounded border border-gray-300 bg-white" />
                          <div className="h-8 w-8 rounded bg-blue-600" />
                          <div className="h-8 w-8 rounded border border-gray-300 bg-gray-100" />
                        </>
                      )}
                      {theme === 'dark' && (
                        <>
                          <div className="h-8 w-8 rounded border border-gray-600 bg-gray-900" />
                          <div className="h-8 w-8 rounded bg-blue-500" />
                          <div className="h-8 w-8 rounded border border-gray-600 bg-gray-800" />
                        </>
                      )}
                      {theme === 'solarized-light' && (
                        <>
                          <div className="h-8 w-8 rounded border border-[#93a1a1] bg-[#fdf6e3]" />
                          <div className="h-8 w-8 rounded bg-[#268bd2]" />
                          <div className="h-8 w-8 rounded border border-[#93a1a1] bg-[#eee8d5]" />
                        </>
                      )}
                      {theme === 'solarized-dark' && (
                        <>
                          <div className="h-8 w-8 rounded border border-gray-600 bg-[#002b36]" />
                          <div className="h-8 w-8 rounded bg-[#268bd2]" />
                          <div className="h-8 w-8 rounded border border-gray-600 bg-[#073642]" />
                        </>
                      )}
                      {theme === 'dracula' && (
                        <>
                          <div className="h-8 w-8 rounded border border-[#6272a4] bg-[#282a36]" />
                          <div className="h-8 w-8 rounded bg-[#bd93f9]" />
                          <div className="h-8 w-8 rounded border border-[#6272a4] bg-[#44475a]" />
                        </>
                      )}
                      {theme === 'high-contrast' && (
                        <>
                          <div className="h-8 w-8 rounded border-2 border-white bg-black" />
                          <div className="h-8 w-8 rounded bg-yellow-400" />
                          <div className="h-8 w-8 rounded border-2 border-black bg-white" />
                        </>
                      )}
                    </div>

                    {isPreviewing && !isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThemeChange(theme);
                          setPreviewTheme(null);
                        }}
                        className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        Apply Theme
                      </button>
                    )}

                    {isActive && (
                      <p className="text-secondary text-xs">
                        This is your current theme
                      </p>
                    )}

                    {!isPreviewing && !isActive && (
                      <p className="text-secondary text-xs">Click to preview</p>
                    )}
                  </div>
                );
              })}
            </div>

            {previewTheme && previewTheme !== currentTheme && (
              <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                <p className="mb-2 text-sm font-medium">
                  Previewing: {getThemeDisplayName(previewTheme)}
                </p>
                <p className="text-secondary mb-3 text-sm">
                  Click "Apply Theme" on the theme card to save this appearance,
                  or click another theme to preview it.
                </p>
                <button
                  onClick={() => {
                    setPreviewTheme(null);
                    applyTheme(currentTheme);
                  }}
                  className="text-sm font-medium text-yellow-700 hover:underline dark:text-yellow-300"
                >
                  Cancel preview
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary border-primary mt-auto border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-secondary text-sm">
              Data from{' '}
              <a
                href="https://www.w3.org/WAI/WCAG22/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent"
              >
                W3C WCAG 2.2
              </a>
              . Built with accessibility in mind.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Export the helper functions so they can be used by the announce utility
export { getAnnouncementsEnabled, setAnnouncementsEnabled };

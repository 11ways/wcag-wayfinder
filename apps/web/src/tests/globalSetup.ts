/**
 * Global setup that runs before any tests or module imports.
 * Polyfills localStorage for MSW compatibility.
 */

// Create localStorage polyfill
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

// Polyfill globalThis.localStorage if not available
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = createStorageMock();
}

if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = createStorageMock();
}

export default function globalSetup() {
  // This runs in the main process - polyfill already applied above
}

/**
 * Polyfills for test environment
 * This must be imported FIRST before any other modules (especially MSW)
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

// Polyfill globalThis.localStorage if not a function
if (typeof globalThis.localStorage?.getItem !== 'function') {
  (globalThis as any).localStorage = createStorageMock();
}

if (typeof globalThis.sessionStorage?.getItem !== 'function') {
  (globalThis as any).sessionStorage = createStorageMock();
}

import { cleanup } from '@testing-library/react';
import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';

// Import MSW server lazily to ensure jsdom's localStorage is available
let server: Awaited<typeof import('./mocks/server')>['server'];

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Setup MSW server - import lazily to ensure jsdom's localStorage is available
beforeAll(async () => {
  const mswModule = await import('./mocks/server');
  server = mswModule.server;
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server?.resetHandlers();
  cleanup();
});

// Cleanup MSW server
afterAll(() => server?.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Reset localStorage and sessionStorage before each test
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

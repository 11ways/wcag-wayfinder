import React, { ReactElement } from 'react';

import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import type { Criterion, Tag, QueryFilters } from '../lib/types';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests
        gcTime: 0, // Disable garbage collection for tests
      },
    },
  });
}

// Custom render function that includes router and QueryClientProvider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

export function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...renderOptions }: CustomRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route);
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Test data fixtures
export const testCriterion: Criterion = {
  id: 'sc-1-1-1',
  num: '1.1.1',
  title: 'Non-text Content',
  description:
    'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
  details_json: null,
  level: 'A',
  version: '2.0',
  principle: 'Perceivable',
  principle_id: '1',
  guideline_id: '1.1',
  guideline_title: 'Text Alternatives',
  handle: 'non-text-content',
  content:
    'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
  how_to_meet: null,
  understanding: null,
};

export const testCriterionWithTags: Criterion = {
  ...testCriterion,
  tags: [
    {
      id: 1,
      name: 'Images',
      description: 'Related to image accessibility',
      slug: 'images',
      category: 'Content',
      icon: 'image',
      relevance_score: 0.95,
      rank_order: 1,
      reasoning: 'Directly related to image alt text',
      reviewed: true,
    },
    {
      id: 2,
      name: 'Forms',
      description: 'Related to form accessibility',
      slug: 'forms',
      category: 'Interaction',
      icon: 'wpforms',
      relevance_score: 0.7,
      rank_order: 2,
      reasoning: 'May include form controls',
      reviewed: true,
    },
  ],
};

export const testTag: Tag = {
  id: 1,
  name: 'Images',
  description: 'Related to image accessibility',
  slug: 'images',
  category: 'Content',
  icon: 'image',
};

export const testFilters: QueryFilters = {
  version: ['2.2'],
  level: ['A', 'AA'],
  page: 1,
  pageSize: 25,
};

export const testFiltersWithSearch: QueryFilters = {
  ...testFilters,
  q: 'keyboard',
};

export const testFiltersWithPrinciple: QueryFilters = {
  ...testFilters,
  principle: ['Perceivable'],
};

// Mock data generators
export function createMockCriterion(
  overrides: Partial<Criterion> = {}
): Criterion {
  return {
    ...testCriterion,
    ...overrides,
  };
}

export function createMockCriteria(count: number): Criterion[] {
  return Array.from({ length: count }, (_, i) => ({
    ...testCriterion,
    id: `sc-${i + 1}-1-1`,
    num: `${i + 1}.1.1`,
    title: `Test Criterion ${i + 1}`,
  }));
}

// Wait helpers
export function waitForLoadingToFinish() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// User event helpers for common interactions
export function createMouseEvent(type: string, options = {}) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  return event;
}

// Accessibility test helpers
export function getByAriaLabel(container: HTMLElement, label: string) {
  return container.querySelector(`[aria-label="${label}"]`);
}

export function getAllByRole(container: HTMLElement, role: string) {
  return Array.from(container.querySelectorAll(`[role="${role}"]`));
}

// Mock localStorage helpers
export function setLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalStorage(key: string) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

// Mock fetch helpers
export function mockFetchSuccess(data: any) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  }) as any;
}

export function mockFetchError(error = 'Network error') {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error }),
  }) as any;
}

// Announce helper for testing screen reader announcements
export function getLastAnnouncement(): string | null {
  const liveRegion = document.querySelector(
    '[role="status"][aria-live="polite"]'
  );
  return liveRegion?.textContent || null;
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

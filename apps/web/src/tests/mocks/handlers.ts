import { http, HttpResponse } from 'msw';

import type { Criterion, Guideline, PaginatedResult } from '../../lib/types';

// Mock data fixtures
export const mockCriteria: Criterion[] = [
  {
    id: 'sc-1-1-1',
    num: '1.1.1',
    title: 'Non-text Content',
    description:
      'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
    details_json: null,
    level: 'A',
    version: '2.2',
    principle: 'Perceivable',
    principle_id: '1',
    guideline_id: '1.1',
    guideline_title: 'Text Alternatives',
    handle: 'non-text-content',
    content:
      'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
    how_to_meet: null,
    understanding: null,
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
    ],
  },
  {
    id: 'sc-1-3-1',
    num: '1.3.1',
    title: 'Info and Relationships',
    description:
      'Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.',
    details_json: null,
    level: 'A',
    version: '2.2',
    principle: 'Perceivable',
    principle_id: '1',
    guideline_id: '1.3',
    guideline_title: 'Adaptable',
    handle: 'info-and-relationships',
    content:
      'Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.',
    how_to_meet: null,
    understanding: null,
    tags: [
      {
        id: 2,
        name: 'Semantic HTML',
        description: 'Related to semantic HTML structure',
        slug: 'semantic-html',
        category: 'Development',
        icon: 'code',
        relevance_score: 0.9,
        rank_order: 1,
        reasoning: 'Requires proper HTML semantics',
        reviewed: true,
      },
    ],
  },
  {
    id: 'sc-2-1-1',
    num: '2.1.1',
    title: 'Keyboard',
    description:
      'All functionality of the content is operable through a keyboard interface.',
    details_json: null,
    level: 'A',
    version: '2.2',
    principle: 'Operable',
    principle_id: '2',
    guideline_id: '2.1',
    guideline_title: 'Keyboard Accessible',
    handle: 'keyboard',
    content:
      'All functionality of the content is operable through a keyboard interface.',
    how_to_meet: null,
    understanding: null,
    tags: [
      {
        id: 3,
        name: 'Keyboard',
        description: 'Related to keyboard navigation',
        slug: 'keyboard',
        category: 'Interaction',
        icon: 'keyboard',
        relevance_score: 1.0,
        rank_order: 1,
        reasoning: 'Core keyboard accessibility',
        reviewed: true,
      },
    ],
  },
];

export const mockGuidelines: Guideline[] = [
  {
    guideline_id: '1.1',
    guideline_title: 'Text Alternatives',
    principle: 'Perceivable',
  },
  {
    guideline_id: '1.3',
    guideline_title: 'Adaptable',
    principle: 'Perceivable',
  },
  {
    guideline_id: '2.1',
    guideline_title: 'Keyboard Accessible',
    principle: 'Operable',
  },
];

export const mockPrinciples = [
  'Perceivable',
  'Operable',
  'Understandable',
  'Robust',
];
export const mockVersions = ['2.0', '2.1', '2.2'];
export const mockLevels = ['A', 'AA', 'AAA'];

// Helper to create paginated response
function createPaginatedResponse<T>(
  items: T[],
  page = 1,
  pageSize = 25
): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    total,
    page,
    pageSize,
    totalPages,
  };
}

// Mock terms
export const mockTerms: { id: number; name: string; definition: string }[] = [
  { id: 1, name: 'programmatically determined', definition: 'Determined by software from author-supplied data provided in a way that different user agents, including assistive technologies, can extract and present this information to users in different modalities.' },
  { id: 2, name: 'text alternative', definition: 'Text that is programmatically associated with non-text content or referred to from text that is programmatically associated with non-text content.' },
];

// MSW handlers
export const handlers = [
  // GET /api/terms
  http.get('/api/terms', () => {
    return HttpResponse.json(mockTerms);
  }),

  // GET /api/criteria
  http.get('/api/criteria', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const principle = url.searchParams.getAll('principle');
    const level = url.searchParams.getAll('level');
    const version = url.searchParams.getAll('version');
    const guideline_id = url.searchParams.get('guideline_id');
    const tag_id = url.searchParams.get('tag_id');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '25', 10);

    let filtered = [...mockCriteria];

    // Apply filters
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    if (principle.length > 0) {
      filtered = filtered.filter((c) => principle.includes(c.principle));
    }

    if (level.length > 0) {
      filtered = filtered.filter((c) => level.includes(c.level));
    }

    if (version.length > 0) {
      filtered = filtered.filter((c) => version.includes(c.version));
    }

    if (guideline_id) {
      filtered = filtered.filter((c) => c.guideline_id === guideline_id);
    }

    if (tag_id) {
      const tagIdNum = parseInt(tag_id, 10);
      filtered = filtered.filter((c) =>
        c.tags?.some((tag) => tag.id === tagIdNum)
      );
    }

    return HttpResponse.json(createPaginatedResponse(filtered, page, pageSize));
  }),

  // GET /api/criteria/:id
  http.get('/api/criteria/:id', ({ params }) => {
    const { id } = params;
    const criterion = mockCriteria.find((c) => c.id === id);

    if (!criterion) {
      return HttpResponse.json(
        { error: 'Criterion not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(criterion);
  }),

  // GET /api/principles
  http.get('/api/principles', () => {
    return HttpResponse.json(mockPrinciples);
  }),

  // GET /api/guidelines
  http.get('/api/guidelines', () => {
    return HttpResponse.json(mockGuidelines);
  }),

  // GET /api/versions
  http.get('/api/versions', () => {
    return HttpResponse.json(mockVersions);
  }),

  // GET /api/levels
  http.get('/api/levels', () => {
    return HttpResponse.json(mockLevels);
  }),
];

import type { QueryFilters } from './types';

// Principle aliases mapping
const PRINCIPLE_ALIASES: Record<string, string> = {
  p: 'Perceivable',
  perceivable: 'Perceivable',
  o: 'Operable',
  operable: 'Operable',
  u: 'Understandable',
  understandable: 'Understandable',
  r: 'Robust',
  robust: 'Robust',
};

// Reverse mapping for building URLs
const PRINCIPLE_TO_CODE: Record<string, string> = {
  Perceivable: 'p',
  Operable: 'o',
  Understandable: 'u',
  Robust: 'r',
};

const ALL_PRINCIPLES = ['Perceivable', 'Operable', 'Understandable', 'Robust'];

/**
 * Parse URL pathname and search params into QueryFilters
 */
export function parseURL(pathname: string, search: string): QueryFilters {
  const segments = pathname.split('/').filter(Boolean);
  const filters: QueryFilters = {};

  for (const segment of segments) {
    const colonIndex = segment.indexOf(':');
    if (colonIndex === -1) continue;

    const key = segment.substring(0, colonIndex);
    const value = segment.substring(colonIndex + 1);

    switch (key) {
      case 'version': {
        // '2-2' → ['2.2'] or '2-1+2-2' → ['2.1', '2.2']
        filters.version = value.split('+').map((v) => v.replace(/-/g, '.'));
        break;
      }

      case 'level': {
        // 'a+aa' → ['A', 'AA']
        filters.level = value.split('+').map((l) => l.toUpperCase());
        break;
      }

      case 'principle': {
        // Handle 'all' special case
        if (value.toLowerCase() === 'all') {
          filters.principle = ALL_PRINCIPLES;
        } else {
          // 'p+r' or 'perceivable+r' → ['Perceivable', 'Robust']
          const principles = value
            .split('+')
            .map((p) => PRINCIPLE_ALIASES[p.toLowerCase()])
            .filter(Boolean);

          if (principles.length > 0) {
            filters.principle = principles;
          }
        }
        break;
      }

      case 'guideline': {
        // '1-2' → '1.2'
        filters.guideline_id = value.replace(/-/g, '.');
        break;
      }

      case 'guidelines': {
        // '1-1+1-2+2-3' → ['1.1', '1.2', '2.3']
        filters.guideline_ids = value.split('+').map((g) => g.replace(/-/g, '.'));
        break;
      }

      case 'tag': {
        // 'tag:1' → tag_id = 1 (legacy single tag)
        const tagId = parseInt(value, 10);
        if (!isNaN(tagId)) {
          filters.tag_id = tagId;
        }
        break;
      }

      case 'tags': {
        // 'tags:1+2+3' → tag_ids = [1, 2, 3] (max 3)
        const tagIds = value
          .split('+')
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
          .slice(0, 3); // Limit to 3 tags

        if (tagIds.length > 0) {
          filters.tag_ids = tagIds;
        }
        break;
      }

      case 'affects': {
        // 'affects:1+2+3' → affected_user_ids = [1, 2, 3] (max 3)
        const affectedIds = value
          .split('+')
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
          .slice(0, 3);

        if (affectedIds.length > 0) {
          filters.affected_user_ids = affectedIds;
        }
        break;
      }

      case 'responsibility': {
        // 'responsibility:1+2+3' → assignee_ids = [1, 2, 3] (max 3)
        const assigneeIds = value
          .split('+')
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
          .slice(0, 3);

        if (assigneeIds.length > 0) {
          filters.assignee_ids = assigneeIds;
        }
        break;
      }

      case 'technology': {
        // 'technology:1+2+3' → technology_ids = [1, 2, 3] (max 3)
        const techIds = value
          .split('+')
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
          .slice(0, 3);

        if (techIds.length > 0) {
          filters.technology_ids = techIds;
        }
        break;
      }
    }
  }

  // Parse query params
  const params = new URLSearchParams(search);
  if (params.has('q')) {
    const q = params.get('q');
    if (q) filters.q = q;
  }

  return filters;
}

/**
 * Build URL path from QueryFilters (canonical form)
 */
export function buildURL(filters: QueryFilters, hash?: string): string {
  const segments: string[] = [];

  // Version - omit if it's the default (all versions: 2.0, 2.1, 2.2)
  if (filters.version && filters.version.length > 0) {
    const sortedVersions = [...filters.version].sort();
    const isDefault =
      sortedVersions.length === 3 &&
      sortedVersions[0] === '2.0' &&
      sortedVersions[1] === '2.1' &&
      sortedVersions[2] === '2.2';

    if (!isDefault) {
      const versionStr = filters.version
        .map((v) => v.replace(/\./g, '-')) // '2.2' → '2-2'
        .sort()
        .join('+');
      segments.push(`version:${versionStr}`);
    }
  }

  // Level - omit if it's the default (A+AA)
  if (filters.level && filters.level.length > 0) {
    const sortedLevels = [...filters.level].sort();
    const isDefault =
      sortedLevels.length === 2 &&
      sortedLevels[0] === 'A' &&
      sortedLevels[1] === 'AA';

    if (!isDefault) {
      const levelStr = sortedLevels.map((l) => l.toLowerCase()).join('+');
      segments.push(`level:${levelStr}`);
    }
  }

  // Principle - omit if all principles are selected
  if (filters.principle && filters.principle.length > 0) {
    const isAll =
      filters.principle.length === 4 &&
      ALL_PRINCIPLES.every((p) => filters.principle!.includes(p));

    if (!isAll) {
      // Use short codes and sort for consistency
      const principleStr = filters.principle
        .map((p) => PRINCIPLE_TO_CODE[p])
        .filter(Boolean)
        .sort()
        .join('+');

      if (principleStr) {
        segments.push(`principle:${principleStr}`);
      }
    }
  }

  // Guidelines (multiple) - takes precedence over single guideline
  if (filters.guideline_ids && filters.guideline_ids.length > 0) {
    const guidelinesStr = filters.guideline_ids
      .map((g) => g.replace(/\./g, '-'))
      .sort()
      .join('+');
    segments.push(`guidelines:${guidelinesStr}`);
  }
  // Guideline (single, legacy)
  else if (filters.guideline_id) {
    const guidelineStr = filters.guideline_id.replace(/\./g, '-');
    segments.push(`guideline:${guidelineStr}`);
  }

  // Tags (multiple) - takes precedence over single tag
  if (filters.tag_ids && filters.tag_ids.length > 0) {
    const tagsStr = filters.tag_ids
      .slice(0, 3) // Limit to 3 tags
      .sort((a, b) => a - b) // Sort for consistent URLs
      .join('+');
    segments.push(`tags:${tagsStr}`);
  }
  // Tag (single, legacy)
  else if (filters.tag_id !== undefined) {
    segments.push(`tag:${filters.tag_id}`);
  }

  // Affects (affected users)
  if (filters.affected_user_ids && filters.affected_user_ids.length > 0) {
    const affectsStr = filters.affected_user_ids
      .slice(0, 3)
      .sort((a, b) => a - b)
      .join('+');
    segments.push(`affects:${affectsStr}`);
  }

  // Responsibility (assignees)
  if (filters.assignee_ids && filters.assignee_ids.length > 0) {
    const responsibilityStr = filters.assignee_ids
      .slice(0, 3)
      .sort((a, b) => a - b)
      .join('+');
    segments.push(`responsibility:${responsibilityStr}`);
  }

  // Technology
  if (filters.technology_ids && filters.technology_ids.length > 0) {
    const techStr = filters.technology_ids
      .slice(0, 3)
      .sort((a, b) => a - b)
      .join('+');
    segments.push(`technology:${techStr}`);
  }

  // Build path
  const path = segments.length > 0 ? '/' + segments.join('/') + '/' : '/';

  // Add query params
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);

  // Build final URL with hash if provided
  let url = params.toString() ? `${path}?${params}` : path;
  if (hash) {
    url += hash.startsWith('#') ? hash : `#${hash}`;
  }

  return url;
}

/**
 * Get default filters (used when URL has no segments)
 */
export function getDefaultFilters(): QueryFilters {
  return {
    version: ['2.0', '2.1', '2.2'], // All WCAG versions
    level: ['A', 'AA'], // A and AA, not AAA
    principle: ALL_PRINCIPLES, // All 4 principles
  };
}

/**
 * Merge URL filters with defaults
 */
export function mergeWithDefaults(urlFilters: QueryFilters): QueryFilters {
  const defaults = getDefaultFilters();

  return {
    // Use defaults only if version/level/principle are undefined (not explicitly set)
    // Empty arrays are intentional and should not fall back to defaults
    version: urlFilters.version !== undefined ? urlFilters.version : defaults.version,
    level: urlFilters.level !== undefined ? urlFilters.level : defaults.level,
    principle: urlFilters.principle !== undefined ? urlFilters.principle : defaults.principle,
    guideline_id: urlFilters.guideline_id,
    guideline_ids: urlFilters.guideline_ids,
    tag_id: urlFilters.tag_id,
    tag_ids: urlFilters.tag_ids,
    affected_user_ids: urlFilters.affected_user_ids,
    assignee_ids: urlFilters.assignee_ids,
    technology_ids: urlFilters.technology_ids,
    q: urlFilters.q,
    page: urlFilters.page || 1,
    pageSize: urlFilters.pageSize || 25,
  };
}

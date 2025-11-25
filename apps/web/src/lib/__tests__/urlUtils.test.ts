import { describe, it, expect } from 'vitest';

import {
  parseURL,
  buildURL,
  getDefaultFilters,
  mergeWithDefaults,
} from '../urlUtils';

import type { QueryFilters } from '../types';

describe('urlUtils', () => {
  describe('parseURL', () => {
    it('should parse empty path to empty filters', () => {
      const result = parseURL('/', '');
      expect(result).toEqual({});
    });

    it('should parse version segment', () => {
      const result = parseURL('/version:2-1/', '');
      expect(result).toEqual({
        version: ['2.1'],
      });
    });

    it('should parse multiple versions', () => {
      const result = parseURL('/version:2-1+2-2/', '');
      expect(result).toEqual({
        version: ['2.1', '2.2'],
      });
    });

    it('should parse level segment', () => {
      const result = parseURL('/level:a/', '');
      expect(result).toEqual({
        level: ['A'],
      });
    });

    it('should parse multiple levels', () => {
      const result = parseURL('/level:a+aa/', '');
      expect(result).toEqual({
        level: ['A', 'AA'],
      });
    });

    it('should parse principle segment with short code', () => {
      const result = parseURL('/principle:p/', '');
      expect(result).toEqual({
        principle: ['Perceivable'],
      });
    });

    it('should parse multiple principles', () => {
      const result = parseURL('/principle:p+o/', '');
      expect(result).toEqual({
        principle: ['Perceivable', 'Operable'],
      });
    });

    it('should parse principle "all" to all principles', () => {
      const result = parseURL('/principle:all/', '');
      expect(result).toEqual({
        principle: ['Perceivable', 'Operable', 'Understandable', 'Robust'],
      });
    });

    it('should parse guideline segment', () => {
      const result = parseURL('/guideline:1-2/', '');
      expect(result).toEqual({
        guideline_id: '1.2',
      });
    });

    it('should parse single tag (legacy)', () => {
      const result = parseURL('/tag:1/', '');
      expect(result).toEqual({
        tag_id: 1,
      });
    });

    it('should parse multiple tags', () => {
      const result = parseURL('/tags:1+2+3/', '');
      expect(result).toEqual({
        tag_ids: [1, 2, 3],
      });
    });

    it('should limit tags to 3', () => {
      const result = parseURL('/tags:1+2+3+4+5/', '');
      expect(result).toEqual({
        tag_ids: [1, 2, 3],
      });
    });

    it('should parse search query param', () => {
      const result = parseURL('/', '?q=keyboard');
      expect(result).toEqual({
        q: 'keyboard',
      });
    });

    it('should parse complex URL with multiple segments', () => {
      const result = parseURL(
        '/version:2-2/level:a+aa/principle:p/',
        '?q=test'
      );
      expect(result).toEqual({
        version: ['2.2'],
        level: ['A', 'AA'],
        principle: ['Perceivable'],
        q: 'test',
      });
    });
  });

  describe('buildURL', () => {
    it('should build root path for empty filters', () => {
      const result = buildURL({});
      expect(result).toBe('/');
    });

    it('should omit default version (all versions)', () => {
      // All three versions is the default, so it should produce clean URL
      const result = buildURL({ version: ['2.0', '2.1', '2.2'] });
      expect(result).toBe('/');
    });

    it('should include single version (2.2 only)', () => {
      const result = buildURL({ version: ['2.2'] });
      expect(result).toBe('/version:2-2/');
    });

    it('should include non-default version', () => {
      const result = buildURL({ version: ['2.1'] });
      expect(result).toBe('/version:2-1/');
    });

    it('should omit default levels (A+AA)', () => {
      const result = buildURL({ level: ['A', 'AA'] });
      expect(result).toBe('/');
    });

    it('should include non-default level', () => {
      const result = buildURL({ level: ['AAA'] });
      expect(result).toBe('/level:aaa/');
    });

    it('should omit all principles when all selected', () => {
      const result = buildURL({
        principle: ['Perceivable', 'Operable', 'Understandable', 'Robust'],
      });
      expect(result).toBe('/');
    });

    it('should include principles with short codes', () => {
      const result = buildURL({ principle: ['Perceivable', 'Operable'] });
      expect(result).toBe('/principle:o+p/');
    });

    it('should include guideline', () => {
      const result = buildURL({ guideline_id: '1.2' });
      expect(result).toBe('/guideline:1-2/');
    });

    it('should include multiple tags', () => {
      const result = buildURL({ tag_ids: [3, 1, 2] });
      expect(result).toBe('/tags:1+2+3/');
    });

    it('should include search query param', () => {
      const result = buildURL({ q: 'keyboard' });
      expect(result).toBe('/?q=keyboard');
    });

    it('should include hash fragment', () => {
      const result = buildURL({ q: 'test' }, '#sc-1-1-1');
      expect(result).toBe('/?q=test#sc-1-1-1');
    });

    it('should add hash sign if missing', () => {
      const result = buildURL({ q: 'test' }, 'sc-1-1-1');
      expect(result).toBe('/?q=test#sc-1-1-1');
    });

    it('should build complex URL with multiple segments', () => {
      const filters: QueryFilters = {
        version: ['2.1'],
        level: ['A'],
        principle: ['Perceivable'],
        guideline_id: '1.2',
        q: 'test',
      };
      const result = buildURL(filters);
      expect(result).toBe(
        '/version:2-1/level:a/principle:p/guideline:1-2/?q=test'
      );
    });
  });

  describe('getDefaultFilters', () => {
    it('should return default filters', () => {
      const result = getDefaultFilters();
      expect(result).toEqual({
        version: ['2.0', '2.1', '2.2'], // All WCAG versions
        level: ['A', 'AA'],
        principle: ['Perceivable', 'Operable', 'Understandable', 'Robust'], // All principles
      });
    });
  });

  describe('mergeWithDefaults', () => {
    it('should merge empty filters with defaults', () => {
      const result = mergeWithDefaults({});
      expect(result).toEqual({
        version: ['2.0', '2.1', '2.2'], // All versions
        level: ['A', 'AA'],
        principle: ['Perceivable', 'Operable', 'Understandable', 'Robust'], // All principles
        guideline_id: undefined,
        guideline_ids: undefined,
        tag_id: undefined,
        tag_ids: undefined,
        q: undefined,
        page: 1,
        pageSize: 25,
      });
    });

    it('should preserve provided filters', () => {
      const result = mergeWithDefaults({
        version: ['2.1'],
        level: ['AAA'],
        principle: ['Operable'],
        q: 'test',
      });
      expect(result).toEqual({
        version: ['2.1'],
        level: ['AAA'],
        principle: ['Operable'],
        guideline_id: undefined,
        guideline_ids: undefined,
        tag_id: undefined,
        tag_ids: undefined,
        q: 'test',
        page: 1,
        pageSize: 25,
      });
    });

    it('should set default pagination', () => {
      const result = mergeWithDefaults({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(25);
    });

    it('should preserve custom pagination', () => {
      const result = mergeWithDefaults({ page: 3, pageSize: 50 });
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(50);
    });
  });

  describe('URL round-trip', () => {
    it('should parse and rebuild the same URL', () => {
      // Use non-default values to ensure they survive the round-trip
      // (default values get omitted by buildURL)
      const originalPath = '/version:2-1/level:aaa/principle:p/';
      const originalSearch = '?q=keyboard';

      const parsed = parseURL(originalPath, originalSearch);
      const rebuilt = buildURL(parsed);

      // Parse the rebuilt URL
      const [rebuiltPath, rebuiltSearch] = rebuilt.split('?');
      const reparsed = parseURL(
        rebuiltPath,
        rebuiltSearch ? `?${rebuiltSearch}` : ''
      );

      expect(reparsed).toEqual(parsed);
    });

    it('should preserve semantic meaning for default values', () => {
      // When using default values like level:a+aa, they get omitted from URL
      // This tests that the semantic meaning is preserved even if literal values change
      const originalPath = '/version:2-1/level:a+aa/principle:p/';
      const parsed = parseURL(originalPath, '');

      // Level A+AA is the default, so it should be omitted
      const rebuilt = buildURL(parsed);
      expect(rebuilt).toBe('/version:2-1/principle:p/');

      // When reparsed, level will be undefined (defaults apply at merge time)
      const reparsed = parseURL(rebuilt, '');
      expect(reparsed.level).toBeUndefined();
      expect(reparsed.version).toEqual(['2.1']);
      expect(reparsed.principle).toEqual(['Perceivable']);
    });
  });
});

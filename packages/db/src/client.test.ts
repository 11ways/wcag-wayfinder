import { describe, it, expect } from 'bun:test';
import { compareWcagIds } from './client';

describe('compareWcagIds', () => {
  it('should compare single-digit IDs correctly', () => {
    expect(compareWcagIds('1', '2')).toBeLessThan(0);
    expect(compareWcagIds('2', '1')).toBeGreaterThan(0);
    expect(compareWcagIds('1', '1')).toBe(0);
  });

  it('should compare multi-level IDs correctly', () => {
    expect(compareWcagIds('1.1', '1.2')).toBeLessThan(0);
    expect(compareWcagIds('1.2', '1.1')).toBeGreaterThan(0);
    expect(compareWcagIds('1.1', '1.1')).toBe(0);
  });

  it('should handle double-digit segments correctly', () => {
    expect(compareWcagIds('1.2.3', '1.2.10')).toBeLessThan(0);
    expect(compareWcagIds('1.2.10', '1.2.3')).toBeGreaterThan(0);
    expect(compareWcagIds('1.2.10', '1.2.10')).toBe(0);
  });

  it('should compare IDs of different depths', () => {
    expect(compareWcagIds('1.1', '1.1.1')).toBeLessThan(0);
    expect(compareWcagIds('1.1.1', '1.1')).toBeGreaterThan(0);
  });

  it('should sort an array correctly', () => {
    const ids = ['1.2.10', '1.1.1', '2.1.1', '1.2.3', '1.1.2'];
    const sorted = ids.sort(compareWcagIds);
    expect(sorted).toEqual(['1.1.1', '1.1.2', '1.2.3', '1.2.10', '2.1.1']);
  });
});

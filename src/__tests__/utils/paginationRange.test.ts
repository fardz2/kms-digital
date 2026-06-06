import { describe, expect, test } from 'vitest';
import { paginationRange } from '../../utils/paginationRange';

describe('paginationRange', () => {
  test('returns all pages when total is small', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test('shows ellipsis on the right near the start', () => {
    expect(paginationRange(1, 10)).toEqual([1, 2, 3, '...', 10]);
  });

  test('shows ellipsis on the left near the end', () => {
    expect(paginationRange(10, 10)).toEqual([1, '...', 8, 9, 10]);
  });

  test('shows ellipsis on both sides in the middle', () => {
    expect(paginationRange(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
  });

  test('clamps current page within bounds', () => {
    expect(paginationRange(99, 3)).toEqual([1, 2, 3]);
    expect(paginationRange(0, 3)).toEqual([1, 2, 3]);
  });

  test('handles single page', () => {
    expect(paginationRange(1, 1)).toEqual([1]);
  });
});

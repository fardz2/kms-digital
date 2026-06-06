import { describe, expect, test, vi, afterEach } from 'vitest';
import { isMobileViewport } from '../../utils/isMobileViewport';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isMobileViewport', () => {
  test('returns true when viewport matches max-width 768px', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(max-width: 768px)',
    }));
    expect(isMobileViewport()).toBe(true);
  });

  test('returns false when viewport does not match', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(isMobileViewport()).toBe(false);
  });

  test('returns false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(isMobileViewport()).toBe(false);
  });
});

import { renderHook, act } from '@testing-library/react';
import { describe, expect, test, afterEach, vi } from 'vitest';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useOnlineStatus', () => {
  test('reflects initial navigator.onLine', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  test('updates to false on offline event', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);
  });

  test('updates to true on online event', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});

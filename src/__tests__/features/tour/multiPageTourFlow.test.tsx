import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, beforeEach } from 'vitest';
import {
  getRoleFlow,
  getFirstStepForPath,
  getNextStep,
  getPreviousStep,
} from '../../../features/tour/tourSteps';
import { useTour } from '../../../features/tour/useTour';

describe('multi-page tour flow manifest', () => {
  test('returns admin flow with dashboard as first route', () => {
    const flow = getRoleFlow('ADMIN');

    expect(flow).toBeTruthy();
    expect(flow?.steps[0].routePattern).toBe('/admin/dashboard');
    expect(flow?.steps.some((step) => step.routePattern === '/admin/dashboard/desa')).toBe(true);
    expect(flow?.steps.some((step) => step.routePattern === '/admin/dashboard/artikel/baru')).toBe(true);
  });

  test('finds first step for current route inside role flow', () => {
    const step = getFirstStepForPath('ADMIN', '/admin/dashboard/posyandu');

    expect(step?.routePattern).toBe('/admin/dashboard/posyandu');
  });

  test('returns next step across route boundaries', () => {
    const flow = getRoleFlow('ADMIN');
    const current = flow!.steps.find((step) => step.id === 'admin-dashboard-sidebar');

    const next = getNextStep('ADMIN', current!.id);

    expect(next?.routePattern).toBe('/admin/dashboard/desa');
  });

  test('returns previous step across route boundaries', () => {
    const flow = getRoleFlow('ADMIN');
    const current = flow!.steps.find((step) => step.id === 'admin-desa-header');

    const prev = getPreviousStep('ADMIN', current!.id);

    expect(prev?.routePattern).toBe('/admin/dashboard');
  });
});

describe('useTour route-aware state', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('auto-start begins from first step for role', () => {
    const { result } = renderHook(() => useTour('ADMIN', true));

    act(() => {
      result.current.startFromBeginning('ADMIN');
    });

    expect(result.current.activeStepId).toBe('admin-dashboard-intro');
    expect(result.current.open).toBe(true);
  });

  test('replay from current path starts from first step on that route', () => {
    const { result } = renderHook(() => useTour('ADMIN', false));

    act(() => {
      result.current.replayFromPath('ADMIN', '/admin/dashboard/desa');
    });

    expect(result.current.activeStepId).toBe('admin-desa-header');
    expect(result.current.open).toBe(true);
  });

  test('finish marks role complete', () => {
    const { result } = renderHook(() => useTour('ADMIN', false));

    act(() => {
      result.current.startFromBeginning('ADMIN');
      result.current.finishFlow('ADMIN');
    });

    expect(result.current.open).toBe(false);
    expect(window.localStorage.getItem('kms_tour_completed_ADMIN')).toBe('1');
  });
});

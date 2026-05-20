import { useCallback, useEffect, useState } from 'react';
import type { Role } from '../../types';
import { getRoleFlow, getFirstStepForPath } from './tourSteps';

const TOUR_FLAG_PREFIX = 'kms_tour_completed_';

function flagKey(role: Role | null): string | null {
  if (!role) return null;
  return `${TOUR_FLAG_PREFIX}${role}`;
}

function isCompleted(role: Role | null): boolean {
  if (typeof window === 'undefined') return true;
  const key = flagKey(role);
  if (!key) return true;
  return window.localStorage.getItem(key) === '1';
}

function markCompleted(role: Role | null): void {
  if (typeof window === 'undefined') return;
  const key = flagKey(role);
  if (!key) return;
  window.localStorage.setItem(key, '1');
}

function clearFlag(role: Role | null): void {
  if (typeof window === 'undefined') return;
  const key = flagKey(role);
  if (!key) return;
  window.localStorage.removeItem(key);
}

export function useTour(role: Role | null, autoStart = true, pathname?: string) {
  const [open, setOpen] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  useEffect(() => {
    if (!autoStart || !role) return;
    if (isCompleted(role)) return;
    const flow = getRoleFlow(role);
    if (!flow || flow.steps.length === 0) return;
    const startStep = pathname
      ? getFirstStepForPath(role, pathname) ?? flow.steps[0]
      : flow.steps[0];
    const timer = window.setTimeout(() => {
      setActiveStepId(startStep.id);
      setOpen(true);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [role, autoStart, pathname]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveStepId(null);
    markCompleted(role);
  }, [role]);

  const replay = useCallback(() => {
    clearFlag(role);
    const flow = getRoleFlow(role);
    if (flow && flow.steps.length > 0) {
      setActiveStepId(flow.steps[0].id);
    }
    setOpen(true);
  }, [role]);

  const startFromBeginning = useCallback((r: Role) => {
    clearFlag(r);
    const flow = getRoleFlow(r);
    if (flow && flow.steps.length > 0) {
      setActiveStepId(flow.steps[0].id);
      setOpen(true);
    }
  }, []);

  const replayFromPath = useCallback((r: Role, path: string) => {
    clearFlag(r);
    const step = getFirstStepForPath(r, path);
    if (step) {
      setActiveStepId(step.id);
      setOpen(true);
    }
  }, []);

  const finishFlow = useCallback((r: Role) => {
    setOpen(false);
    setActiveStepId(null);
    markCompleted(r);
  }, []);

  return {
    open,
    close,
    replay,
    activeStepId,
    setActiveStepId,
    startFromBeginning,
    replayFromPath,
    finishFlow,
  };
}

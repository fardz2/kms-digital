import React, { createContext, use } from 'react';
import { Tour } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { buildSteps, getRoleFlow } from './tourSteps';
import { useTour } from './useTour';

interface TourContextValue {
  replay: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

/**
 * useTourContext — akses replay() dari component lain (mis. Navbar tombol Bantuan).
 */
export function useTourContext(): TourContextValue {
  const ctx = use(TourContext);
  if (!ctx) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return ctx;
}

/**
 * TourProvider — wrap aplikasi.
 * Tour antd dipasang sekali di root. Step generated dari role aktif.
 * Auto-show di first visit per role; bisa di-replay via context.
 */
export default function TourProvider({ children }: { children: React.ReactNode }) {
  const { role } = useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { open, close, replayFromPath, activeStepId, setActiveStepId } = useTour(
    role,
    true,
    pathname
  );
  const flow = getRoleFlow(role);

  const steps = buildSteps(role);
  const current = (() => {
    if (!flow || !activeStepId) return 0;
    const idx = flow.steps.findIndex((step) => step.id === activeStepId);
    return idx >= 0 ? idx : 0;
  })();

  const handleChange = (next: number) => {
    if (!flow || !flow.steps[next]) return;
    const nextStep = flow.steps[next];
    setActiveStepId(nextStep.id);
    if (nextStep.routePattern !== pathname) {
      navigate(nextStep.routePattern);
    }
  };

  const replay = () => {
    if (!role) return;
    replayFromPath(role, pathname);
  };

  const value: TourContextValue = { replay };

  return (
    <TourContext.Provider value={value}>
      {children}
      {steps.length > 0 && (
        <Tour
          open={open}
          current={current}
          onChange={handleChange}
          onClose={close}
          onFinish={close}
          steps={steps}
          mask
          type="primary"
        />
      )}
    </TourContext.Provider>
  );
}
